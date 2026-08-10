<#
=============================================================================
 setup-autohotkey.ps1  (called by install.bat)
-----------------------------------------------------------------------------
 Makes sure AutoHotkey **v2** is present, then registers ScamGuard to start at
 logon and launches it.

 Why this is fussier than it looks:
   * Many PCs already have AutoHotkey **v1** at
     C:\Program Files\AutoHotkey\AutoHotkey.exe. A plain "does AutoHotkey
     exist?" check sees that and wrongly concludes we are done - then the v1
     interpreter tries to run our v2 script and dies with
     "This script requires AutoHotkey v2.0".
   * Even with v2 installed, v1 usually owns the .ahk file association, so
     double-clicking the script (or a shortcut pointing at it) still runs v1.

 So: detect v2 by reading each executable's FileVersion, and always launch the
 script by passing it as an ARGUMENT to the v2 executable. v1 and v2 coexist
 happily; we never touch the existing v1 install.
=============================================================================
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Dest,
    [string]$AppName = "ScamGuard",
    [switch]$SkipLaunch
)

$ErrorActionPreference = "Stop"

function Find-AutoHotkeyV2 {
    $roots = @(
        (Join-Path $env:ProgramFiles "AutoHotkey"),
        (Join-Path ${env:ProgramFiles(x86)} "AutoHotkey"),
        (Join-Path $env:LOCALAPPDATA "Programs\AutoHotkey")
    ) | Where-Object { $_ -and (Test-Path -LiteralPath $_) }

    $candidates = @()
    foreach ($r in $roots) {
        $candidates += Get-ChildItem -LiteralPath $r -Recurse -Filter "AutoHotkey*.exe" -File -ErrorAction SilentlyContinue
    }
    # Keep only real v2 interpreters (excludes the v1 exe and the UX launcher).
    $v2 = $candidates |
        Where-Object { $_.VersionInfo.FileVersion -like "2.*" -and $_.Name -notlike "*UX*" } |
        Sort-Object @{ Expression = { $_.Name -like "*64*" }; Descending = $true }, Name
    if ($v2) { return $v2[0].FullName }
    return $null
}

$script = Join-Path $Dest "scamguard-key.ahk"

# --- 1. Ensure AutoHotkey v2 -------------------------------------------------
$ahk = Find-AutoHotkeyV2
if ($ahk) {
    Write-Host "        Found AutoHotkey v2: $ahk"
} else {
    $v1 = Join-Path $env:ProgramFiles "AutoHotkey\AutoHotkey.exe"
    if (Test-Path -LiteralPath $v1) {
        Write-Host "        AutoHotkey v1 is installed, but this needs v2. Installing v2 alongside it"
        Write-Host "        (your existing v1 scripts keep working)..."
    } else {
        Write-Host "        AutoHotkey v2 not found - installing it..."
    }
    try {
        winget install -e --id AutoHotkey.AutoHotkey --accept-source-agreements --accept-package-agreements
    } catch {
        Write-Warning "winget could not run: $($_.Exception.Message)"
    }
    $ahk = Find-AutoHotkeyV2
}

if (-not $ahk) {
    Write-Host ""
    Write-Warning "AutoHotkey v2 still not found."
    Write-Host "        Install it by hand from https://www.autohotkey.com (choose v2),"
    Write-Host "        then run this installer again."
    exit 1
}

# --- 2. Start at logon -------------------------------------------------------
# Target the v2 EXECUTABLE with the script as an argument. Pointing a shortcut
# straight at the .ahk would hand it to whichever version owns the association.
$startupDir = [Environment]::GetFolderPath("CommonStartup")
$lnk = Join-Path $startupDir "$AppName.lnk"
$s = (New-Object -ComObject WScript.Shell).CreateShortcut($lnk)
$s.TargetPath = $ahk
$s.Arguments = '"' + $script + '"'
$s.WorkingDirectory = $Dest
$s.Description = "ScamGuard - sends a screenshot when the red key is pressed"
$s.Save()
Write-Host "        Start-at-logon registered."

# --- 3. Launch now -----------------------------------------------------------
if (-not $SkipLaunch) {
    Start-Process -FilePath $ahk -ArgumentList ('"' + $script + '"') -WorkingDirectory $Dest
    Write-Host "        ScamGuard is running."
}
exit 0
