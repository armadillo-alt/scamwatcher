<#
=============================================================================
 ScamGuard - watcher.ps1  (the no-AutoHotkey fallback)
-----------------------------------------------------------------------------
 Use this variant when AutoHotkey cannot or should not be installed on the
 parent's PC. Nothing is hooked to the keyboard here; instead the parent
 presses Win+PrintScreen (the screen dims briefly and Windows saves a PNG
 into the Pictures\Screenshots folder), and this long-running hidden script
 notices the new file and sends it to the caregiver's endpoint.

 Trade-offs versus scamguard-key.ahk:
   - the parent must press TWO keys (Win + the red key), not one;
   - there is no tooltip; the brief screen dim is the only confirmation;
   - only screenshots taken while the watcher is running are sent
     (offline queueing still works exactly like the main script).

 Register it to start at logon (run once in a Command Prompt):

   schtasks /Create /TN "ScamGuard Watcher" /TR "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File C:\ScamGuard\watcher.ps1" /SC ONLOGON /RL LIMITED /F

 (The path carries no quotes because C:\ScamGuard has no spaces. If you put
 the script in a path WITH spaces, escape quotes around it like
 -File \"C:\My Path\watcher.ps1\" - single quotes would break -File.)

 Start it immediately without logging off:   schtasks /Run /TN "ScamGuard Watcher"

 NOTE: the helper functions below are intentionally DUPLICATED from
 capture-and-send.ps1 so that each file stays standalone and can be copied
 to the parent PC on its own. If you change the send/queue logic in one
 file, make the same change in the other.

 Windows PowerShell 5.1 compatible. Runs hidden; per-file errors go to
 error.log and the watcher keeps running.
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

# Set per screenshot by Send-ScreenshotFile: "png", or "jpg" when a large
# capture was re-encoded. Re-encode source images bigger than this.
$script:CaptureFormat = "png"
$script:JpegThreshold = 4MB

# ============================================================================
# Shared helpers - duplicated from capture-and-send.ps1 on purpose (see top).
# ============================================================================

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
    # Logging must never break the watcher.
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
    # Returns "sent", "rejected" (endpoint replied ok:false - retrying is
    # pointless) or "unreachable" (offline/HTTP/HTML error - safe to queue).
    try {
        $bytes = [Text.Encoding]::UTF8.GetBytes($Body)
        $response = Invoke-RestMethod -Uri $script:EndpointUrl -Method Post -ContentType "application/json; charset=utf-8" -TimeoutSec 30 -Body $bytes
        if ($null -ne $response -and $response.ok -eq $true) { return "sent" }
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
            # Permanently refused; move it aside (kept for diagnosis) so it
            # stops blocking newer captures.
            try { Rename-Item -LiteralPath $file.FullName -NewName ($file.Name + ".rejected") -Force } catch { }
        } else {
            break
        }
    }
    return $sent
}

function New-PayloadJson {
    param([string]$PngPath)
    # Payload contract with the Apps Script endpoint (see appsscript/):
    # { key, device, capturedAt, format, image }. $script:CaptureFormat is set
    # by Send-ScreenshotFile before this is called.
    $payload = @{
        key        = $script:SecretKey
        device     = $script:DeviceName
        capturedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
        format     = $script:CaptureFormat
        image      = [Convert]::ToBase64String([IO.File]::ReadAllBytes($PngPath))
    }
    return ($payload | ConvertTo-Json -Compress -Depth 3)
}

function Convert-LargePngToJpeg {
    param([string]$Path)
    # A big PNG (4K / multi-monitor) can exceed the endpoint's size limit.
    # If this file is large, write a JPEG copy to TEMP and return its path;
    # otherwise return $null. Loads System.Drawing on demand.
    try {
        if ((Get-Item -LiteralPath $Path).Length -le $script:JpegThreshold) { return $null }
        Add-Type -AssemblyName System.Drawing
        $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
            Where-Object { $_.MimeType -eq "image/jpeg" } | Select-Object -First 1
        if ($null -eq $jpegCodec) { return $null }
        $img = [System.Drawing.Image]::FromFile($Path)
        try {
            $jpgPath = Join-Path $env:TEMP ("scamguard-" + [Guid]::NewGuid().ToString("N") + ".jpg")
            $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters -ArgumentList 1
            $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter -ArgumentList ([System.Drawing.Imaging.Encoder]::Quality, [long]82)
            $img.Save($jpgPath, $jpegCodec, $encoderParams)
            $encoderParams.Dispose()
            return $jpgPath
        } finally {
            $img.Dispose()
        }
    } catch {
        return $null
    }
}

function Save-ToQueue {
    param([string]$Body)
    # Store the ready-to-send JSON so a later run can retry it.
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

# ============================================================================
# Watcher-specific parts.
# ============================================================================

function Wait-FileReady {
    param([string]$Path)
    # Windows is usually still writing the PNG when the Created event fires.
    # Poll until the size stops changing and the file opens cleanly for
    # reading, up to about 10 seconds.
    $lastSize = -1
    for ($attempt = 0; $attempt -lt 20; $attempt++) {
        Start-Sleep -Milliseconds 500
        if (-not (Test-Path -LiteralPath $Path)) { continue }
        $size = -1
        try { $size = (Get-Item -LiteralPath $Path -Force).Length } catch { continue }
        if ($size -gt 0 -and $size -eq $lastSize) {
            try {
                $fs = [IO.File]::Open($Path, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::Read)
                $fs.Close()
                return $true
            } catch { }
        }
        $lastSize = $size
    }
    return $false
}

function Send-ScreenshotFile {
    param([string]$Path)
    # Same flow as capture-and-send.ps1's main: flush the queue first, then
    # send this screenshot, queueing it only if the endpoint is unreachable.
    # The parent's own file in Pictures\Screenshots is never touched.
    $flushed = Invoke-QueueFlush
    $note = ""
    if ($flushed -gt 0) { $note = " (also sent " + $flushed + " queued)" }

    # Re-encode a large PNG to a temporary JPEG so it fits the endpoint limit.
    $script:CaptureFormat = "png"
    $sourcePath = $Path
    $tempJpg = Convert-LargePngToJpeg -Path $Path
    if ($null -ne $tempJpg) {
        $script:CaptureFormat = "jpg"
        $sourcePath = $tempJpg
    }
    try {
        $json = New-PayloadJson -PngPath $sourcePath
    } finally {
        if ($null -ne $tempJpg) { try { Remove-Item -LiteralPath $tempJpg -Force } catch { } }
    }
    $byteCount = [Text.Encoding]::UTF8.GetByteCount($json)

    $status = Send-Json -Body $json
    if ($status -eq "sent") {
        Write-Log -Path $script:ActivityLog -Message ("SENT " + $byteCount + " bytes (" + (Split-Path -Leaf $Path) + ")" + $note)
    } elseif ($status -eq "rejected") {
        Write-Log -Path $script:ActivityLog -Message ("REJECTED " + $byteCount + " bytes (" + (Split-Path -Leaf $Path) + ") - not queued" + $note)
    } else {
        $queuedPath = Save-ToQueue -Body $json
        Write-Log -Path $script:ActivityLog -Message ("QUEUED " + $byteCount + " bytes as " + (Split-Path -Leaf $queuedPath) + $note)
    }
}

# -----------------------------------------------------------------------------
# Main loop. Fatal setup problems land in error.log and exit 1; problems with
# a single screenshot are logged and the watcher keeps going.
# -----------------------------------------------------------------------------
$script:Root = Split-Path -Parent $MyInvocation.MyCommand.Path

try {
    Initialize-ScamGuardDirs
    Read-ScamGuardConfig

    # Where Win+PrintScreen saves its PNGs. GetFolderPath follows the real
    # Pictures folder even when OneDrive has redirected it; normally this is
    # %USERPROFILE%\Pictures\Screenshots.
    $pictures = [Environment]::GetFolderPath("MyPictures")
    if ([string]::IsNullOrWhiteSpace($pictures)) { $pictures = Join-Path $env:USERPROFILE "Pictures" }
    $script:WatchDir = Join-Path $pictures "Screenshots"
    if (-not (Test-Path -LiteralPath $script:WatchDir)) {
        # Windows creates this folder on the first Win+PrintScreen; create it
        # up front because FileSystemWatcher needs an existing path.
        New-Item -ItemType Directory -Path $script:WatchDir -Force | Out-Null
    }

    $watcher = New-Object System.IO.FileSystemWatcher
    $watcher.Path = $script:WatchDir
    $watcher.Filter = "*.png"
    $watcher.IncludeSubdirectories = $false
    Register-ObjectEvent -InputObject $watcher -EventName Created -SourceIdentifier ScamGuardPngCreated | Out-Null
    $watcher.EnableRaisingEvents = $true

    Write-Log -Path $script:ActivityLog -Message ("WATCHER started - watching " + $script:WatchDir)

    # Events queue up in PowerShell's event queue even while we are busy
    # sending, so quick back-to-back screenshots are not lost.
    $lastHandled = @{}
    while ($true) {
        $evt = Wait-Event -SourceIdentifier ScamGuardPngCreated
        $fullPath = $evt.SourceEventArgs.FullPath
        Remove-Event -EventIdentifier $evt.EventIdentifier

        # Debounce: some tools raise more than one Created event per file;
        # ignore repeats of the same path within 2 seconds.
        if ($lastHandled.Count -gt 200) { $lastHandled = @{} }   # keep the map tiny
        $now = Get-Date
        if ($lastHandled.ContainsKey($fullPath)) {
            if (($now - $lastHandled[$fullPath]).TotalSeconds -lt 2) { continue }
        }
        $lastHandled[$fullPath] = $now

        try {
            if (Wait-FileReady -Path $fullPath) {
                Send-ScreenshotFile -Path $fullPath
            } else {
                Write-Log -Path $script:ErrorLog -Message ("Screenshot never became readable: " + $fullPath)
            }
        } catch {
            $reason = "unknown error"
            if ($null -ne $_.Exception -and $null -ne $_.Exception.Message) { $reason = $_.Exception.Message }
            Write-Log -Path $script:ErrorLog -Message ("Failed to send " + $fullPath + " - " + $reason)
        }
    }
} catch {
    $reason = "unknown error"
    if ($null -ne $_.Exception -and $null -ne $_.Exception.Message) { $reason = $_.Exception.Message }
    Write-Log -Path $script:ErrorLog -Message ("WATCHER stopped - " + $reason)
    exit 1
}
