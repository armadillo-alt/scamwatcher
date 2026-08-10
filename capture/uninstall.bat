@echo off
REM ============================================================================
REM  ScamGuard - uninstall.bat
REM  Cleanly removes ScamGuard from this PC: stops the key listener, removes the
REM  logon shortcut, removes the Windows Defender exclusion, and deletes
REM  C:\ScamGuard plus the local logs/queue. AutoHotkey itself is left installed
REM  (it is a general tool you may want for other things).
REM  Double-click it; it will ask for administrator rights.
REM ============================================================================
setlocal EnableExtensions
set "DEST=C:\ScamGuard"
set "APPNAME=ScamGuard"

net session >nul 2>&1
if %errorlevel% neq 0 (
  echo Asking for administrator rights...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)

echo.
echo   Removing ScamGuard from this PC...

REM Stop the key listener. NOTE: this stops ALL running AutoHotkey scripts.
taskkill /IM AutoHotkey64.exe /F >nul 2>&1
taskkill /IM AutoHotkey.exe   /F >nul 2>&1
echo   [1/4] Stopped the key listener.

REM Remove the start-at-logon shortcut.
powershell -NoProfile -Command "$p=(Join-Path ([Environment]::GetFolderPath('CommonStartup')) '%APPNAME%.lnk'); if (Test-Path $p) { Remove-Item $p -Force }"
echo   [2/4] Removed the logon shortcut.

REM Remove the Windows Defender folder exclusion.
powershell -NoProfile -Command "try { Remove-MpPreference -ExclusionPath '%DEST%' -ErrorAction Stop } catch { }"
echo   [3/4] Removed the Defender exclusion.

REM Delete the program folder and this user's logs/queue.
if exist "%DEST%" rmdir /s /q "%DEST%"
if exist "%LOCALAPPDATA%\ScamGuard" rmdir /s /q "%LOCALAPPDATA%\ScamGuard"
echo   [4/4] Deleted %DEST% and local logs.

echo.
echo   Done. ScamGuard has been removed. (AutoHotkey was left installed.)
echo   If you use a third-party antivirus, remove the C:\ScamGuard exclusion there too.
echo.
pause
endlocal
