<#
=============================================================================
 ScamGuard - capture-and-send.ps1
-----------------------------------------------------------------------------
 Captures the full screen (all monitors) and POSTs it as base64 JSON to the
 caregiver's Google Apps Script endpoint. Normally launched hidden by
 scamguard-key.ahk when the parent presses the red PrintScreen key.

 Offline-graceful: a failed send is saved to a local queue and retried at
 the start of the next run.

 Exit codes (contract with scamguard-key.ahk):
   0 = screenshot sent and accepted by the endpoint
   1 = local error (config missing, capture failed, ...) - see error.log
   2 = endpoint unreachable; screenshot queued for the next run

 Files used:
   <script folder>\config.ini              settings (see config.example.ini)
   %LOCALAPPDATA%\ScamGuard\queue\*.json   unsent screenshots (max 20 kept)
   %LOCALAPPDATA%\ScamGuard\activity.log   one line per run
   %LOCALAPPDATA%\ScamGuard\error.log      problems only

 Windows PowerShell 5.1 compatible. Runs hidden: no console output, and the
 whole main flow is wrapped so nothing ever throws unhandled.
=============================================================================
#>

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Older Windows installs default .NET web requests to TLS 1.0;
# script.google.com requires TLS 1.2.
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch { }

# --- fixed locations --------------------------------------------------------
$script:DataDir     = Join-Path $env:LOCALAPPDATA "ScamGuard"
$script:QueueDir    = Join-Path $script:DataDir "queue"
$script:ActivityLog = Join-Path $script:DataDir "activity.log"
$script:ErrorLog    = Join-Path $script:DataDir "error.log"

# --- settings (filled by Read-ScamGuardConfig) -------------------------------
$script:EndpointUrl = ""
$script:DeviceName  = $env:COMPUTERNAME
$script:SecretKey   = ""

# Set by New-ScreenCapture: "png" normally, "jpg" when the capture was large
# enough to re-encode. Re-encode PNGs bigger than this many bytes.
$script:CaptureFormat = "png"
$script:JpegThreshold = 4MB

function Initialize-ScamGuardDirs {
    if (-not (Test-Path -LiteralPath $script:QueueDir)) {
        New-Item -ItemType Directory -Path $script:QueueDir -Force | Out-Null
    }
}

function Limit-LogSize {
    param([string]$Path)
    # Keep logs small: once a log passes 200 KB, keep only the last 100 lines.
    try {
        if (Test-Path -LiteralPath $Path) {
            if ((Get-Item -LiteralPath $Path).Length -gt 200KB) {
                $tail = Get-Content -LiteralPath $Path -Tail 100
                Set-Content -LiteralPath $Path -Value $tail
            }
        }
    } catch { }
}

function Write-Log {
    param([string]$Path, [string]$Message)
    # Logging must never break the run.
    try {
        $stamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        Add-Content -LiteralPath $Path -Value ($stamp + "  " + $Message)
        Limit-LogSize -Path $Path
    } catch { }
}

function Read-ScamGuardConfig {
    # Minimal INI: KEY=VALUE lines; blank lines and lines starting with
    # # or ; are ignored. Values are taken literally (no quoting rules).
    $configPath = Join-Path $script:Root "config.ini"
    if (-not (Test-Path -LiteralPath $configPath)) {
        throw "config.ini not found next to the script. Copy config.example.ini to config.ini and fill in ENDPOINT_URL."
    }
    $settings = @{}
    foreach ($rawLine in @(Get-Content -LiteralPath $configPath)) {
        $line = ("" + $rawLine).Trim()
        if ($line.Length -eq 0) { continue }
        if ($line.StartsWith("#") -or $line.StartsWith(";")) { continue }
        $eq = $line.IndexOf("=")
        if ($eq -lt 1) { continue }
        $settings[$line.Substring(0, $eq).Trim()] = $line.Substring($eq + 1).Trim()
    }
    if (-not $settings.ContainsKey("ENDPOINT_URL")) {
        throw "ENDPOINT_URL is missing from config.ini."
    }
    if ([string]::IsNullOrWhiteSpace($settings["ENDPOINT_URL"])) {
        throw "ENDPOINT_URL is empty in config.ini."
    }
    if ($settings["ENDPOINT_URL"] -like "*PASTE-YOUR*") {
        throw "ENDPOINT_URL in config.ini is still the placeholder. Paste the real /exec URL (appsscript/SETUP.md, step 6)."
    }
    $script:EndpointUrl = $settings["ENDPOINT_URL"]
    if ($settings.ContainsKey("DEVICE_NAME")) {
        if (-not [string]::IsNullOrWhiteSpace($settings["DEVICE_NAME"])) {
            $script:DeviceName = $settings["DEVICE_NAME"]
        }
    }
    if ($settings.ContainsKey("SECRET_KEY")) {
        if ($null -ne $settings["SECRET_KEY"]) {
            $script:SecretKey = $settings["SECRET_KEY"]
        }
    }
}

function Send-Json {
    param([string]$Body)
    # Returns one of three states so the caller can tell a real outage from a
    # refusal that retrying will never fix:
    #   "sent"        endpoint replied { "ok": true }
    #   "rejected"    endpoint replied { "ok": false, ... } - wrong key, image
    #                 too large, etc. Retrying is pointless; do NOT queue.
    #   "unreachable" offline, timeout, HTTP/HTML error - safe to queue+retry.
    # The body is sent as explicit UTF-8 bytes so PowerShell 5.1 cannot
    # re-encode it. Apps Script answers POSTs with a redirect; 5.1 follows
    # it with a GET, which is exactly how Apps Script serves the response.
    try {
        $bytes = [Text.Encoding]::UTF8.GetBytes($Body)
        $response = Invoke-RestMethod -Uri $script:EndpointUrl -Method Post -ContentType "application/json; charset=utf-8" -TimeoutSec 30 -Body $bytes
        if ($null -ne $response -and $response.ok -eq $true) { return "sent" }
        # Only a definitive machine "no" (a parsed object with ok:false) counts
        # as a rejection. An HTML error page or blank body is treated as an
        # outage so a transient Google hiccup never discards a screenshot.
        $hasOk = $false
        if ($null -ne $response -and $null -ne $response.PSObject) {
            $hasOk = @($response.PSObject.Properties.Name) -contains "ok"
        }
        if ($hasOk -and $response.ok -eq $false) {
            $why = "endpoint rejected the screenshot"
            if ($null -ne $response.error) { $why = $why + ": " + $response.error }
            Write-Log -Path $script:ErrorLog -Message $why
            return "rejected"
        }
        return "unreachable"
    } catch {
        return "unreachable"
    }
}

function Invoke-QueueFlush {
    # Send queued screenshots, oldest first. The queue keeps at most 20
    # files; older ones beyond that are deleted. Stops at the first failed
    # send (probably still offline). Returns the number of files sent.
    $sent = 0
    $files = @(Get-ChildItem -LiteralPath $script:QueueDir -Filter "*.json" -File | Sort-Object Name)
    if ($files.Count -gt 20) {
        $excess = $files.Count - 20
        for ($i = 0; $i -lt $excess; $i++) {
            try { Remove-Item -LiteralPath $files[$i].FullName -Force } catch { }
        }
        $files = @($files | Select-Object -Skip $excess)
    }
    foreach ($file in $files) {
        $body = $null
        try { $body = [IO.File]::ReadAllText($file.FullName, [Text.Encoding]::UTF8) } catch { continue }
        $status = Send-Json -Body $body
        if ($status -eq "sent") {
            try { Remove-Item -LiteralPath $file.FullName -Force } catch { }
            $sent++
        } elseif ($status -eq "rejected") {
            # Permanently refused (Send-Json already logged why). Move it out of
            # the queue so it stops blocking newer captures, but keep the file
            # for diagnosis instead of deleting the parent's flagged screen.
            try { Rename-Item -LiteralPath $file.FullName -NewName ($file.Name + ".rejected") -Force } catch { }
        } else {
            break   # still unreachable; leave the rest queued for next time
        }
    }
    return $sent
}

function New-ScreenCapture {
    # Capture the whole virtual desktop in one image. VirtualScreen spans
    # every monitor and can start at negative X/Y when a monitor sits left
    # of or above the primary one. Returns the path of a temporary PNG.
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing

    # Ask Windows for real pixels. Without this, display scaling (125% etc.)
    # hands us a shrunken, blurry capture. Harmless if it fails.
    try {
        Add-Type -Namespace ScamGuard -Name Native -MemberDefinition '[DllImport("user32.dll")] public static extern bool SetProcessDPIAware();'
        [ScamGuard.Native]::SetProcessDPIAware() | Out-Null
    } catch { }

    $virtual = [System.Windows.Forms.SystemInformation]::VirtualScreen
    $bitmap = New-Object System.Drawing.Bitmap -ArgumentList $virtual.Width, $virtual.Height
    $graphics = $null
    try {
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $graphics.CopyFromScreen($virtual.X, $virtual.Y, 0, 0, $bitmap.Size)
        $pngPath = Join-Path $env:TEMP ("scamguard-" + [Guid]::NewGuid().ToString("N") + ".png")
        $bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $script:CaptureFormat = "png"

        # A lossless PNG of a 4K or multi-monitor desktop can be 10-30 MB, which
        # would blow the endpoint's size limit and be slow on a poor connection.
        # Re-encode oversized captures as JPEG (a fraction of the size, still
        # perfectly readable). The bitmap is still alive here, before Dispose.
        try {
            if ((Get-Item -LiteralPath $pngPath).Length -gt $script:JpegThreshold) {
                $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
                    Where-Object { $_.MimeType -eq "image/jpeg" } | Select-Object -First 1
                if ($null -ne $jpegCodec) {
                    $jpgPath = [IO.Path]::ChangeExtension($pngPath, ".jpg")
                    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters -ArgumentList 1
                    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter -ArgumentList ([System.Drawing.Imaging.Encoder]::Quality, [long]82)
                    $bitmap.Save($jpgPath, $jpegCodec, $encoderParams)
                    $encoderParams.Dispose()
                    try { Remove-Item -LiteralPath $pngPath -Force } catch { }
                    $script:CaptureFormat = "jpg"
                    return $jpgPath
                }
            }
        } catch {
            # Re-encode failed for any reason: fall back to the original PNG.
        }
        return $pngPath
    } finally {
        if ($null -ne $graphics) { $graphics.Dispose() }
        $bitmap.Dispose()
    }
}

function New-PayloadJson {
    param([string]$PngPath)
    # Payload contract with the Apps Script endpoint (see appsscript/):
    # { key, device, capturedAt, format, image } - image is base64 PNG.
    $payload = @{
        key        = $script:SecretKey
        device     = $script:DeviceName
        capturedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
        format     = $script:CaptureFormat
        image      = [Convert]::ToBase64String([IO.File]::ReadAllBytes($PngPath))
    }
    return ($payload | ConvertTo-Json -Compress -Depth 3)
}

function Save-ToQueue {
    param([string]$Body)
    # Store the ready-to-send JSON so the next run can retry it.
    # Names sort chronologically; the rare same-second clash gets a suffix.
    $stamp = (Get-Date).ToString("yyyyMMdd-HHmmss")
    $path = Join-Path $script:QueueDir ($stamp + ".json")
    $n = 1
    while (Test-Path -LiteralPath $path) {
        $path = Join-Path $script:QueueDir ($stamp + "-" + $n + ".json")
        $n++
    }
    [IO.File]::WriteAllText($path, $Body)   # UTF-8 without BOM
    return $path
}

# -----------------------------------------------------------------------------
# Main. Never throws: every local failure lands in error.log with exit code 1,
# and a failed send lands in the queue with exit code 2.
# -----------------------------------------------------------------------------
$script:Root = Split-Path -Parent $MyInvocation.MyCommand.Path

try {
    Initialize-ScamGuardDirs
    Read-ScamGuardConfig

    # 1) First flush anything a previous offline run left behind.
    $flushed = Invoke-QueueFlush
    $flushedNote = ""
    if ($flushed -gt 0) { $flushedNote = " (also sent " + $flushed + " queued)" }

    # 2) Capture, build the payload, then drop the temporary PNG.
    $pngPath = New-ScreenCapture
    try {
        $json = New-PayloadJson -PngPath $pngPath
    } finally {
        try { Remove-Item -LiteralPath $pngPath -Force } catch { }
    }
    $byteCount = [Text.Encoding]::UTF8.GetByteCount($json)

    # 3) Send now, or queue for the next run.
    $status = Send-Json -Body $json
    if ($status -eq "sent") {
        Write-Log -Path $script:ActivityLog -Message ("SENT " + $byteCount + " bytes" + $flushedNote)
        exit 0
    }
    if ($status -eq "rejected") {
        # The endpoint refused it (Send-Json logged why). Queuing would just
        # retry the same doomed request, so fail honestly - the parent is told
        # it was not sent rather than falsely reassured it is on its way.
        Write-Log -Path $script:ActivityLog -Message ("REJECTED " + $byteCount + " bytes - not queued" + $flushedNote)
        exit 1
    }
    $queuedPath = Save-ToQueue -Body $json
    Write-Log -Path $script:ActivityLog -Message ("QUEUED " + $byteCount + " bytes as " + (Split-Path -Leaf $queuedPath) + $flushedNote)
    exit 2
} catch {
    $reason = "unknown error"
    if ($null -ne $_.Exception -and $null -ne $_.Exception.Message) { $reason = $_.Exception.Message }
    Write-Log -Path $script:ErrorLog -Message $reason
    Write-Log -Path $script:ActivityLog -Message ("ERROR 0 bytes - " + $reason)
    exit 1
}
