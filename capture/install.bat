@echo off
REM ============================================================================
REM  ScamGuard - install.bat
REM  One-shot installer for the CLIENT'S PC. It:
REM    1. copies the capture scripts to C:\ScamGuard
REM    2. writes config.ini (asks for your /exec URL if you didn't pre-fill it)
REM    3. adds the Windows Defender exclusion (a screen-capture tool needs it)
REM    4. makes sure AutoHotkey v2 is present, registers start-at-logon,
REM       and launches ScamGuard
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
copy /y "%SRC%scamguard-key.ahk"     "%DEST%\" >nul
copy /y "%SRC%capture-and-send.ps1"  "%DEST%\" >nul
if exist "%SRC%check-verdicts.ps1"   copy /y "%SRC%check-verdicts.ps1" "%DEST%\" >nul
if exist "%SRC%watcher.ps1"          copy /y "%SRC%watcher.ps1" "%DEST%\" >nul
if exist "%SRC%uninstall.bat"        copy /y "%SRC%uninstall.bat" "%DEST%\" >nul
if exist "%SRC%install.bat"          copy /y "%SRC%install.bat" "%DEST%\" >nul
if exist "%SRC%setup-autohotkey.ps1" copy /y "%SRC%setup-autohotkey.ps1" "%DEST%\" >nul
echo   [1/4] Copied the scripts.

REM --- 2) config.ini ----------------------------------------------------------
set "CFG=%DEST%\config.ini"
if exist "%SRC%config.ini" (
  copy /y "%SRC%config.ini" "%CFG%" >nul
  echo   [2/4] Used the config.ini you prepared.
) else if exist "%CFG%" (
  echo   [2/4] Kept the config.ini already on this PC.
) else (
  echo   [2/4] Enter your settings ^(from appsscript/SETUP.md, step 6^):
  echo.
  set "ENDPOINT="
  set /p "ENDPOINT=        Apps Script /exec URL: "
  set "DEVNAME="
  set /p "DEVNAME=        Device name [Mom's PC]: "
  if "!DEVNAME!"=="" set "DEVNAME=Mom's PC"
  set "SKEY="
  set /p "SKEY=        Secret key (blank if none): "
  echo.
  echo         Which key should send a screenshot? Press Enter for PrintScreen.
  echo         No PrintScreen key? Try:  F12   ScrollLock   Pause
  echo         Combos are written AutoHotkey-style - see config.example.ini.
  set "HKEY="
  set /p "HKEY=        Hotkey [PrintScreen]: "
  if "!HKEY!"=="" set "HKEY=PrintScreen"
  >"%CFG%"  echo # ScamGuard config - created by install.bat. Keep this file private.
  >>"%CFG%" echo ENDPOINT_URL=!ENDPOINT!
  >>"%CFG%" echo DEVICE_NAME=!DEVNAME!
  >>"%CFG%" echo SECRET_KEY=!SKEY!
  >>"%CFG%" echo HOTKEY=!HKEY!
)

REM --- 3) Antivirus exclusion -------------------------------------------------
powershell -NoProfile -Command "try { Add-MpPreference -ExclusionPath '%DEST%' -ErrorAction Stop } catch { }" >nul 2>&1
echo   [3/4] Added Windows Defender exclusion for %DEST%.
echo         ^(Using a different antivirus? Add %DEST% as an exclusion there too.^)

REM --- 4) AutoHotkey v2, start-at-logon, launch -------------------------------
REM  Handled by a PowerShell helper because detecting v2 correctly matters:
REM  a PC with AutoHotkey v1 installed must still get v2, and the script must
REM  be launched via the v2 executable (v1 usually owns the .ahk association).
echo   [4/4] Setting up AutoHotkey v2 and start-at-logon...
powershell -NoProfile -ExecutionPolicy Bypass -File "%SRC%setup-autohotkey.ps1" -Dest "%DEST%" -AppName "%APPNAME%"
if %errorlevel% neq 0 (
  echo.
  echo   !! AutoHotkey v2 could not be set up. See the message above.
  echo      Everything else is installed; once AutoHotkey v2 is present,
  echo      run this installer again.
  echo.
  pause
  exit /b 1
)

echo.
echo   ------------------------------------------------------------
echo   Done. Test it while you are here:
echo     1) Look for a green  H  icon near the clock (bottom-right).
echo        Hover it - it shows which key is set.
echo     2) Press the red key.
echo     3) Check your phone: the email should arrive, and the
echo        screenshot should appear in the ScamGuard app.
echo   ------------------------------------------------------------
echo.
echo   If nothing happens, see SETUP.md - the usual causes are antivirus,
echo   a wrong /exec URL, or a mistyped HOTKEY in %CFG%.
echo.
pause
endlocal
