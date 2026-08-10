<#
=============================================================================
 ScamGuard - check-verdicts.ps1
-----------------------------------------------------------------------------
 The return half of the red key. capture-and-send.ps1 sends the parent's
 screen to the caregiver; this script asks the same endpoint whether the
 caregiver has decided anything about it yet. When the answer is "scam" it
 leaves a note in alert.txt, and scamguard-key.ahk turns that note into a
 large red warning on the parent's screen. Normally launched hidden every
 POLL_SECONDS seconds by scamguard-key.ahk.

 A "safe" verdict deliberately shows NOTHING. Popping up a reassuring box
 every time would teach the parent to click warnings away without reading
 them, which is the exact habit a scammer needs her to have.

 Request (POST, application/json; charset=utf-8):
   { "key": "...", "action": "poll", "device": "...", "since": "<ISO8601 or empty>" }

 Response (plain text on purpose, so it is trivial to parse and impossible
 to half-parse):
   line 1      OK                       or   ERR <reason>
   lines 2..n  verdict|iso8601|message  oldest first; verdict is scam or safe;
                                        message contains no "|" and may be empty

 Exit codes:
   0 = normal run - including "nothing new", offline, and an ERR reply
   1 = local error (no config.ini, cannot write the alert) - see error.log

 Files used:
   <script folder>\config.ini                    settings (see config.example.ini)
   %LOCALAPPDATA%\ScamGuard\last-verdict.txt     newest verdict already handled
   %LOCALAPPDATA%\ScamGuard\alert.txt            warnings waiting to be shown
   %LOCALAPPDATA%\ScamGuard\last-poll-error.txt  throttle for repeated errors
   %LOCALAPPDATA%\ScamGuard\activity.log         only when a verdict arrives
   %LOCALAPPDATA%\ScamGuard\error.log            problems only

 Windows PowerShell 5.1 compatible. Runs hidden roughly once a minute, so:
 no console output ever, nothing throws unhandled, the activity log stays
 quiet unless something actually happened, and any failure that could be
 temporary (offline, timeout, half-answer) leaves the watermark untouched so
 the verdict is simply picked up on the next poll instead of being lost.
=============================================================================
#>

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Older Windows installs default .NET web requests to TLS 1.0;
# script.google.com requires TLS 1.2.
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch { }

# --- fixed locations --------------------------------------------------------
$script:DataDir       = Join-Path $env:LOCALAPPDATA "ScamGuard"
$script:WatermarkFile = Join-Path $script:DataDir "last-verdict.txt"
$script:AlertFile     = Join-Path $script:DataDir "alert.txt"
$script:PollErrorFile = Join-Path $script:DataDir "last-poll-error.txt"
$script:ActivityLog   = Join-Path $script:DataDir "activity.log"
$script:ErrorLog      = Join-Path $script:DataDir "error.log"

# --- settings (filled by Read-ScamGuardConfig) -------------------------------
$script:EndpointUrl = ""
$script:DeviceName  = $env:COMPUTERNAME
$script:SecretKey   = ""

function Initialize-ScamGuardDirs {
    if (-not (Test-Path -LiteralPath $script:DataDir)) {
        New-Item -ItemType Directory -Path $script:DataDir -Force | Out-Null
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

function Write-ThrottledPollError {
    param([string]$Reason)
    # This script runs every POLL_SECONDS seconds, so a standing problem (a
    # SECRET_KEY that no longer matches, a redeployed endpoint, a config.ini
    # that was never created) would otherwise write a thousand identical
    # lines a day and bury everything useful. Log the first occurrence, then
    # at most one repeat per hour for as long as the same thing keeps failing.
    try {
        $shouldLog = $true
        if (Test-Path -LiteralPath $script:PollErrorFile) {
            $previous = ("" + [IO.File]::ReadAllText($script:PollErrorFile)).Trim()
            $age = (Get-Date) - (Get-Item -LiteralPath $script:PollErrorFile).LastWriteTime
            if ($previous -eq $Reason -and $age.TotalMinutes -lt 60) { $shouldLog = $false }
        }
        if ($shouldLog) {
            [IO.File]::WriteAllText($script:PollErrorFile, $Reason)   # UTF-8 without BOM
            Write-Log -Path $script:ErrorLog -Message ("poll: " + $Reason)
        }
    } catch { }
}

function Clear-PollError {
    # A poll worked, so the next problem deserves to be logged immediately
    # rather than being swallowed by the hour-long throttle above.
    try {
        if (Test-Path -LiteralPath $script:PollErrorFile) {
            Remove-Item -LiteralPath $script:PollErrorFile -Force
        }
    } catch { }
}

function Read-ScamGuardConfig {
    # Minimal INI: KEY=VALUE lines; blank lines and lines starting with
    # # or ; are ignored. Values are taken literally (no quoting rules).
    # Deliberately identical to capture-and-send.ps1 so one config.ini
    # serves both halves and neither file needs the other to run.
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
        # Be forgiving about a common mistake: a config.ini that is just the
        # bare /exec URL on a line, with no "ENDPOINT_URL=" label. Accept the
        # first http(s) line as the endpoint.
        foreach ($rawLine in @(Get-Content -LiteralPath $configPath)) {
            $line = ("" + $rawLine).Trim()
            if ($line -match "^https?://\S+") { $settings["ENDPOINT_URL"] = $line; break }
        }
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

function Read-Watermark {
    # ISO timestamp of the newest verdict this PC has already handled.
    # Missing, empty or unreadable all mean the same thing: "no idea". We
    # then send since="" and the endpoint answers with only the last few
    # minutes, which is exactly what a fresh install should see - it must
    # not replay a month of old verdicts at the parent.
    try {
        if (Test-Path -LiteralPath $script:WatermarkFile) {
            return ("" + [IO.File]::ReadAllText($script:WatermarkFile)).Trim()
        }
    } catch { }
    return ""
}

function Write-Watermark {
    param([string]$Iso)
    # Stored exactly as the endpoint spelled it, so what we send back as
    # "since" next time is byte-for-byte what it gave us.
    [IO.File]::WriteAllText($script:WatermarkFile, $Iso)   # UTF-8 without BOM
}

function ConvertTo-VerdictTime {
    param([string]$Iso)
    # ISO8601 -> UTC DateTime, or $null when the stamp cannot be understood.
    # A stamp we cannot compare is worse than useless, so the caller drops
    # that line rather than guessing at its age.
    if ([string]::IsNullOrWhiteSpace($Iso)) { return $null }
    $parsed = [DateTime]::MinValue
    # AssumeUniversal: a stamp with no zone is read as UTC, not as the
    # parent's local time. AdjustToUniversal: everything comes back in UTC,
    # so a "+02:00" stamp and a "Z" stamp compare correctly against each other.
    $styles = [System.Globalization.DateTimeStyles]::AdjustToUniversal -bor [System.Globalization.DateTimeStyles]::AssumeUniversal
    $ok = [DateTime]::TryParse($Iso, [System.Globalization.CultureInfo]::InvariantCulture, $styles, [ref]$parsed)
    if ($ok) { return $parsed }
    return $null
}

function ConvertTo-ResponseText {
    param($Response)
    # The endpoint answers in plain text, so Invoke-RestMethod hands back a
    # plain string. Be defensive anyway: a content-type surprise (JSON, XML,
    # a Google error page) would hand back an object instead, and an
    # unparseable string that we quietly ignore is far better than a throw.
    if ($null -eq $Response) { return "" }
    if ($Response -is [string]) { return $Response }
    try {
        $names = @()
        if ($null -ne $Response.PSObject) { $names = @($Response.PSObject.Properties.Name) }
        foreach ($carrier in @("Content", "OuterXml", "InnerText")) {
            if ($names -contains $carrier) {
                if ($Response.$carrier -is [string]) { return $Response.$carrier }
            }
        }
    } catch { }
    try { return (("" + ($Response | Out-String)).Trim()) } catch { }
    return ""
}

function Read-VerdictResponse {
    param([string]$Text)
    # Parses the plain-text reply. Status mirrors the three states
    # capture-and-send.ps1 uses for sending, for the same reason - a
    # definitive machine "no" must be told apart from a hiccup:
    #   "ok"       first line was OK; Verdicts holds whatever followed
    #   "error"    first line was ERR <reason>; a real, reportable refusal
    #   "unusable" anything else (an HTML error page, truncated body, junk);
    #              treated as a temporary outage and never reported
    # Malformed verdict lines are skipped one by one: one bad line must not
    # cost the parent a warning that arrived on the line below it.
    $parsed = [PSCustomObject]@{ Status = "unusable"; Reason = ""; Verdicts = @() }

    $lines = @((("" + $Text) -replace "`r", "") -split "`n")
    $first = ""
    if ($lines.Count -gt 0) { $first = ("" + $lines[0]).Trim() }

    if ($first -ne "OK") {
        if ($first -eq "ERR" -or $first.StartsWith("ERR ")) {
            $reason = $first
            if ($reason.Length -gt 120) { $reason = $reason.Substring(0, 120) + "..." }
            $parsed.Status = "error"
            $parsed.Reason = $reason
        }
        return $parsed
    }

    $verdicts = @()
    for ($i = 1; $i -lt $lines.Count; $i++) {
        $line = ("" + $lines[$i]).Trim()
        if ($line.Length -eq 0) { continue }
        # Split into at most three so a stray "|" inside the message cannot
        # chop the caregiver's words in half.
        $parts = $line.Split([char[]]@("|"), 3)
        if ($parts.Count -lt 2) { continue }
        $verdict = $parts[0].Trim().ToLowerInvariant()
        if ($verdict -ne "scam" -and $verdict -ne "safe") { continue }
        $when = $parts[1].Trim()
        if ($when.Length -eq 0) { continue }
        $message = ""
        if ($parts.Count -ge 3) { $message = $parts[2].Trim() }
        $verdicts += [PSCustomObject]@{ Verdict = $verdict; When = $when; Message = $message }
    }
    $parsed.Status = "ok"
    $parsed.Verdicts = $verdicts
    return $parsed
}

function Invoke-VerdictPoll {
    param([string]$Since)
    # Ask the endpoint what the caregiver has decided since $Since. Returns
    # the reply as text, or $null when the endpoint could not be reached -
    # offline, timeout, HTTP error, empty body. $null is always a silent
    # no-op for the caller: the parent's PC being on a flaky connection is
    # normal, and it must never cost us the watermark.
    # The body goes out as explicit UTF-8 bytes so PowerShell 5.1 cannot
    # re-encode it, exactly as capture-and-send.ps1 does. Apps Script answers
    # a POST with a redirect; 5.1 follows it with a GET, which is how Apps
    # Script serves the response.
    $payload = @{
        key    = $script:SecretKey
        action = "poll"
        device = $script:DeviceName
        since  = $Since
    }
    $body = ($payload | ConvertTo-Json -Compress -Depth 3)
    try {
        $bytes = [Text.Encoding]::UTF8.GetBytes($body)
        $response = Invoke-RestMethod -Uri $script:EndpointUrl -Method Post -ContentType "application/json; charset=utf-8" -TimeoutSec 20 -Body $bytes
        $text = ConvertTo-ResponseText -Response $response
        if ([string]::IsNullOrWhiteSpace($text)) { return $null }
        return $text
    } catch {
        return $null
    }
}

function Add-Alert {
    param([string]$Iso, [string]$Message)
    # One line per warning:  <iso>|<message>
    # scamguard-key.ahk watches for this file, claims it, deletes it and puts
    # the newest line on screen. Append rather than overwrite: if two
    # verdicts land in the same three-second window, neither may be lost.
    # Tabs and newlines are flattened so one warning can never become two.
    $clean = ("" + $Message) -replace "[`r`n`t]", " "
    $clean = $clean.Trim()
    [IO.File]::AppendAllText($script:AlertFile, ($Iso + "|" + $clean + "`r`n"))   # UTF-8 without BOM
}

# -----------------------------------------------------------------------------
# Main. Never throws. Anything that might be temporary exits 0 without
# touching the watermark, so the verdict comes round again on the next poll.
# -----------------------------------------------------------------------------
$script:Root = Split-Path -Parent $MyInvocation.MyCommand.Path

# One poll at a time. If a previous run is still waiting on a slow network,
# this one steps aside instead of piling a second request on top - which also
# means two runs can never write the same warning to alert.txt twice.
# Windows releases the mutex when the process ends, so there is nothing to
# clean up on the exit paths below.
$script:PollMutex = $null
$script:HaveLock  = $true
try {
    $script:PollMutex = New-Object System.Threading.Mutex($false, "Local\ScamGuardPoll")
    $script:HaveLock = $script:PollMutex.WaitOne(0)
} catch {
    $script:HaveLock = $true    # no mutex available for any reason: just run
}
if (-not $script:HaveLock) { exit 0 }

try {
    Initialize-ScamGuardDirs
    Read-ScamGuardConfig

    $since = Read-Watermark
    $responseText = Invoke-VerdictPoll -Since $since
    if ($null -eq $responseText) { exit 0 }        # offline: quiet no-op

    $parsed = Read-VerdictResponse -Text $responseText
    if ($parsed.Status -eq "error") {
        # A definitive refusal from the endpoint - wrong key, unknown device.
        # Retrying will not fix it, so it is worth one line in error.log, but
        # it is still not the parent's problem: nothing on screen, exit 0.
        Write-ThrottledPollError -Reason ("endpoint replied " + $parsed.Reason)
        exit 0
    }
    if ($parsed.Status -ne "ok") { exit 0 }        # unusable body: quiet no-op
    Clear-PollError

    $verdicts = @($parsed.Verdicts)
    if ($verdicts.Count -eq 0) { exit 0 }          # nothing new; stay silent

    # Only act on verdicts strictly newer than the watermark, so a re-sent or
    # replayed line cannot warn her twice about the same screenshot.
    $sinceTime = ConvertTo-VerdictTime -Iso $since
    $newestTime = $null
    $newestIso = ""
    $scamCount = 0
    $safeCount = 0
    foreach ($verdict in $verdicts) {
        $when = ConvertTo-VerdictTime -Iso $verdict.When
        if ($null -eq $when) { continue }                                 # unreadable stamp
        if ($null -ne $sinceTime -and $when -le $sinceTime) { continue }  # already handled
        if ($verdict.Verdict -eq "scam") {
            Add-Alert -Iso $verdict.When -Message $verdict.Message
            $scamCount++
        } else {
            $safeCount++    # "safe" only moves the watermark - see the header
        }
        if ($null -eq $newestTime -or $when -gt $newestTime) {
            $newestTime = $when
            $newestIso = $verdict.When
        }
    }

    # Written last, and only for verdicts we actually got through: if writing
    # an alert failed above, the watermark stays put and we try again.
    if ($newestIso -ne "") { Write-Watermark -Iso $newestIso }

    if ($scamCount -gt 0) {
        Write-Log -Path $script:ActivityLog -Message ("VERDICT scam received - " + $scamCount + " warning(s) queued for the screen")
    }
    if ($safeCount -gt 0) {
        Write-Log -Path $script:ActivityLog -Message ("VERDICT safe received - " + $safeCount + " marked safe, nothing shown")
    }
    exit 0
} catch {
    $reason = "unknown error"
    if ($null -ne $_.Exception -and $null -ne $_.Exception.Message) { $reason = $_.Exception.Message }
    Write-ThrottledPollError -Reason $reason
    exit 1
}
