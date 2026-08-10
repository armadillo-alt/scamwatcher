; ===========================================================================
; ScamGuard - scamguard-key.ahk        (requires AutoHotkey v2, see SETUP.md)
; ---------------------------------------------------------------------------
; Turns one key (the one with the red sticker) into the help key: a single
; press captures the whole screen and sends it to the caregiver's ScamGuard
; inbox, with a gentle on-screen message for the person at the PC.
;
; WHICH KEY? Set HOTKEY in config.ini (same folder). Default: PrintScreen.
; Small and laptop keyboards often have no PrintScreen key, so anything
; AutoHotkey understands works, for example:
;     HOTKEY=PrintScreen
;     HOTKEY=F12
;     HOTKEY=ScrollLock
;     HOTKEY=Pause
;     HOTKEY=^!s            (Ctrl+Alt+S:  ^=Ctrl  !=Alt  +=Shift  #=Win)
; Pick something the person will not press by accident.
;
; The real work happens in capture-and-send.ps1 (same folder). Its exit code
; drives the message shown:
;   0 = sent    2 = offline, saved for later    anything else = error
;
; Only the bare key is taken over, so combinations such as Shift+<key> and
; Alt+<key> keep their normal Windows behaviour.
;
; Start at login: install.bat registers this for you (pointing at the
; AutoHotkey v2 executable). Details in SETUP.md.
; ===========================================================================
#Requires AutoHotkey v2.0
#SingleInstance Force

isSending := false            ; guard: ignore presses while a send is running

; --- Which key are we listening for? ---------------------------------------
hotkeyName := Trim(ReadConfigValue("HOTKEY", "PrintScreen"))
if (hotkeyName = "")
    hotkeyName := "PrintScreen"

try {
    Hotkey(hotkeyName, DoCapture)
} catch Error as err {
    MsgBox("ScamGuard could not use the key '" hotkeyName "'.`n`n"
        . "Fix the HOTKEY line in config.ini, then start ScamGuard again.`n`n"
        . "Examples that always work:`n"
        . "    HOTKEY=PrintScreen`n"
        . "    HOTKEY=F12`n"
        . "    HOTKEY=ScrollLock`n"
        . "    HOTKEY=^!s        (Ctrl+Alt+S)`n`n"
        . "Details: " err.Message, "ScamGuard", "Iconx")
    ExitApp()
}

; Hovering the tray icon shows which key is active - handy when checking a setup.
A_IconTip := "ScamGuard - press " hotkeyName " to send a screenshot for help"

DoCapture(ThisHotkey)
{
    global isSending
    if isSending              ; a send is already in progress - ignore
        return
    isSending := true

    ; Immediate feedback, before the capture even starts.
    ToolTip("Sending your screenshot...")

    ; Run the capture script hidden and wait for it. Per the AHK v2 docs,
    ; RunWait's RETURN VALUE is the exit code; the fourth parameter would
    ; receive the process ID, not the exit code.
    exitCode := 1
    try {
        exitCode := RunWait('powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' A_ScriptDir '\capture-and-send.ps1"', , "Hide")
    } catch {
        exitCode := 1         ; PowerShell itself could not be started
    }

    ; Gentle result message for the person at the PC.
    if (exitCode = 0)
        ToolTip("Sent. Help is on the way.")
    else if (exitCode = 2)
        ToolTip("No internet right now. Saved - it will send automatically next time.")
    else
        ToolTip("Something went wrong. The screenshot was not sent.")

    isSending := false
    SetTimer(HideTip, -3000)  ; clear the message after 3 seconds
}

HideTip()
{
    global isSending
    if not isSending          ; never wipe the "Sending..." of a newer press
        ToolTip()
}

; Reads one KEY=VALUE from config.ini. Same tolerant format the PowerShell
; side uses: blank lines and lines starting with # or ; are ignored.
ReadConfigValue(key, default := "")
{
    path := A_ScriptDir "\config.ini"
    if not FileExist(path)
        return default
    try
        contents := FileRead(path, "UTF-8")
    catch
        return default
    for line in StrSplit(contents, "`n", "`r") {
        line := Trim(line)
        if (line = "" or SubStr(line, 1, 1) = "#" or SubStr(line, 1, 1) = ";")
            continue
        eq := InStr(line, "=")
        if (eq < 2)
            continue
        if (Trim(SubStr(line, 1, eq - 1)) = key)
            return Trim(SubStr(line, eq + 1))
    }
    return default
}
