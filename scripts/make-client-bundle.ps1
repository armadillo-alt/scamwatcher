<#
=============================================================================
 make-client-bundle.ps1
-----------------------------------------------------------------------------
 Builds a ready-to-install ScamGuard bundle for ONE client PC, with config.ini
 already filled in - so at the client you only double-click install.bat and
 never retype a long URL.

 Run it from the repo root, e.g.:

   .\scripts\make-client-bundle.ps1 -Endpoint "https://script.google.com/macros/s/AKfy.../exec" -DeviceName "Mom's PC"

 It writes to your Desktop by default. It REFUSES to write inside the repo:
 a filled-in config.ini contains your /exec URL, and a stray copy inside the
 repo is exactly how that URL once got committed to a public GitHub repo.
=============================================================================
#>
[CmdletBinding()]
param(
    # The Apps Script web-app URL (appsscript/SETUP.md step 6). Treat as a password.
    [Parameter(Mandatory = $true)][string]$Endpoint,

    # How this PC appears in the dashboard, e.g. "Mom's PC".
    [Parameter(Mandatory = $true)][string]$DeviceName,

    # Shared secret, if you set SECRET_KEY in Code.gs. Strongly recommended.
    [string]$SecretKey = "",

    # Which key sends a screenshot. Default PrintScreen; use e.g. F12,
    # ScrollLock, Pause or "^!s" (Ctrl+Alt+S) on keyboards without PrintScreen.
    [string]$Hotkey = "PrintScreen",

    # How often the PC asks whether you have flagged something (seconds).
    # 0 turns the on-screen scam warning off entirely.
    [int]$PollSeconds = 45,

    # Where to build. Default: Desktop\ScamGuard-<device>.
    [string]$OutputDir = ""
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$captureDir = Join-Path $repoRoot "capture"

if ($Endpoint -notmatch '^https://script\.google\.com/macros/s/\S+/exec$') {
    Write-Warning "That does not look like an Apps Script /exec URL. Expected:"
    Write-Warning "  https://script.google.com/macros/s/<long-id>/exec"
    $go = Read-Host "Continue anyway? (y/N)"
    if ($go -ne "y") { return }
}
if ($Endpoint -like "*PASTE-YOUR*") { throw "That is still the placeholder URL." }

# Default output: Desktop, never inside the repo.
if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    $safeName = ($DeviceName -replace '[^\w\-]', '-')
    $OutputDir = Join-Path ([Environment]::GetFolderPath("Desktop")) "ScamGuard-$safeName"
}
$fullOut = [IO.Path]::GetFullPath($OutputDir)
if ($fullOut.StartsWith([IO.Path]::GetFullPath($repoRoot), [StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to build inside the repo ($fullOut). The filled-in config.ini holds your /exec URL and must never sit in a git working tree. Pass -OutputDir with a path outside the repo."
}

New-Item -ItemType Directory -Path $fullOut -Force | Out-Null

$files = @(
    "install.bat", "uninstall.bat", "setup-autohotkey.ps1", "READ-ME-FIRST.txt",
    "scamguard-key.ahk", "capture-and-send.ps1", "check-verdicts.ps1",
    "watcher.ps1", "SETUP.md"
)
foreach ($f in $files) {
    Copy-Item (Join-Path $captureDir $f) (Join-Path $fullOut $f) -Force
}

# config.ini, CRLF, UTF-8 without BOM (the INI parser is byte-simple).
# Note: build the date separately. Inside an array literal, `"text" + (expr),`
# parses as `"text" + (array)`, which flattens every line into one string.
$today = Get-Date -Format "yyyy-MM-dd"
$cfgLines = @(
    "# ScamGuard config for $DeviceName - created $today",
    "# This file contains a private URL. Do not share it or copy it into a git folder.",
    "ENDPOINT_URL=$Endpoint",
    "DEVICE_NAME=$DeviceName",
    "SECRET_KEY=$SecretKey",
    "HOTKEY=$Hotkey",
    "POLL_SECONDS=$PollSeconds"
)
$cfgPath = Join-Path $fullOut "config.ini"
[IO.File]::WriteAllText($cfgPath, ($cfgLines -join "`r`n") + "`r`n", (New-Object Text.UTF8Encoding($false)))

Write-Host ""
Write-Host "  Bundle ready: $fullOut" -ForegroundColor Green
Write-Host "  Device name : $DeviceName"
Write-Host "  Hotkey      : $Hotkey   <- put the red sticker on this key"
if ($PollSeconds -gt 0) {
    Write-Host "  Scam warning: on, checks every $PollSeconds seconds"
} else {
    Write-Host "  Scam warning: OFF (PollSeconds = 0)"
}
if ($SecretKey) { Write-Host "  Secret key  : set" } else { Write-Host "  Secret key  : (none - consider setting one in Code.gs)" }
Write-Host ""
Write-Host "  Next: copy that folder to a USB stick, then on the client PC"
Write-Host "        double-click install.bat and approve the admin prompt."
Write-Host "        It will use this config.ini, so you will not be asked for the URL."
Write-Host ""
