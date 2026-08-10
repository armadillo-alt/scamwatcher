@echo off
REM ============================================================================
REM  ScamGuard - install.bat
REM  One-shot installer for the PARENT'S PC. It:
REM    1. copies the capture scripts to C:\ScamGuard
REM    2. writes config.ini (asks for your /exec URL if you didn't pre-fill it)
REM    3. adds the Windows Defender exclusion (a screen-capture tool needs it)
REM    4. sets ScamGuard to start automatically at logon
REM    5. installs AutoHotkey if needed and launches ScamGuard
REM
REM  Just double-click this file. It will ask for administrator rights (needed
REM  for the antivirus exclusion) and walk through the rest.
REM ============================================================================
setlocal EnableExtensions EnableDelayedExpansion
set "SRC=%~dp0"
set "DEST=C:\ScamGuard"
set "APPNAME=ScamGuard"

REM --- Re-launch elevated if we are not already administrator -----------------
net session >nul 2>&1
if %errorlevel% neq 0 (
  echo Asking for administrator rights ^(needed for the antivirus exclusion^)...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)

echo.
echo   ================================
echo    ScamGuard installer
echo   ================================
echo    Installing to: %DEST%
echo.

REM --- 1) Folder + scripts ----------------------------------------------------
if not exist "%DEST%" mkdir "%DEST%"
copy /y "%SRC%scamguard-key.ahk"    "%DEST%\" >nul
copy /y "%SRC%capture-and-send.ps1" "%DEST%\" >nul
if exist "%SRC%watcher.ps1" copy /y "%SRC%watcher.ps1" "%DEST%\" >nul
echo   [1/5] Copied the scripts.

REM --- 2) config.ini ----------------------------------------------------------
set "CFG=%DEST%\config.ini"
if exist "%SRC%config.ini" (
  copy /y "%SRC%config.ini" "%CFG%" >nul
  echo   [2/5] Used the config.ini you prepared.
) else if exist "%CFG%" (
  echo   [2/5] Kept the config.ini already on this PC.
) else (
  echo   [2/5] Enter your settings ^(from appsscript/SETUP.md, step 6^):
  echo.
  set "ENDPOINT="
  set /p "ENDPOINT=        Apps Script /exec URL: "
  set "DEVNAME="
  set /p "DEVNAME=        Device name [Mom's PC]: "
  if "!DEVNAME!"=="" set "DEVNAME=Mom's PC"
  set "SKEY="
  set /p "SKEY=        Secret key (blank if none): "
  >"%CFG%"  echo # ScamGuard config - created by install.bat. Keep this file private.
  >>"%CFG%" echo ENDPOINT_URL=!ENDPOINT!
  >>"%CFG%" echo DEVICE_NAME=!DEVNAME!
  >>"%CFG%" echo SECRET_KEY=!SKEY!
)

REM --- 3) Antivirus exclusion -------------------------------------------------
powershell -NoProfile -Command "try { Add-MpPreference -ExclusionPath '%DEST%' -ErrorAction Stop } catch { }" >nul 2>&1
echo   [3/5] Added Windows Defender exclusion for %DEST%.
echo         ^(Using a different antivirus? Add %DEST% as an exclusion there too.^)

REM --- 4) Start at logon (all-users startup: survives account differences) ----
powershell -NoProfile -Command "$dir=[Environment]::GetFolderPath('CommonStartup'); $s=(New-Object -ComObject WScript.Shell).CreateShortcut((Join-Path $dir '%APPNAME%.lnk')); $s.TargetPath=(Join-Path '%DEST%' 'scamguard-key.ahk'); $s.WorkingDirectory='%DEST%'; $s.Save()"
echo   [4/5] ScamGuard will now start automatically at logon.

REM --- 5) AutoHotkey + launch -------------------------------------------------
set "AHK="
if exist "%ProgramFiles%\AutoHotkey\v2\AutoHotkey64.exe" set "AHK=1"
if exist "%ProgramFiles%\AutoHotkey\v2\AutoHotkey.exe"   set "AHK=1"
if exist "%ProgramFiles%\AutoHotkey\AutoHotkey.exe"      set "AHK=1"
if not defined AHK (
  echo   [5/5] AutoHotkey is not installed - installing it now...
  winget install -e --id AutoHotkey.AutoHotkey --accept-source-agreements --accept-package-agreements
)
echo   [5/5] Starting ScamGuard...
start "" "%DEST%\scamguard-key.ahk"

echo.
echo   ------------------------------------------------------------
echo   Done. Test it while you are here:
echo     1) Look for a green  H  icon near the clock (bottom-right).
echo     2) Press the red key.
echo     3) Check your phone: the email should arrive, and the
echo        screenshot should appear in the ScamGuard app.
echo   ------------------------------------------------------------
echo.
echo   If nothing happens, see capture\SETUP.md - the usual cause is
echo   antivirus (step C2) or a wrong /exec URL in %CFG%.
echo.
pause
endlocal
