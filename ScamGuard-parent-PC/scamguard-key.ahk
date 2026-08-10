; ===========================================================================
; ScamGuard - scamguard-key.ahk        (requires AutoHotkey v2, see SETUP.md)
; ---------------------------------------------------------------------------
; Turns the PrintScreen key (the one with the red sticker) into the help key:
; one press captures the whole screen and sends it to the caregiver's
; ScamGuard inbox, with a gentle on-screen message for the parent.
;
; The real work happens in capture-and-send.ps1 (same folder). Its exit code
; drives the message shown:
;   0 = sent    2 = offline, saved for later    anything else = error
;
; Only the BARE PrintScreen key is taken over. Combinations such as
; Shift+PrintScreen, Alt+PrintScreen and Win+PrintScreen are not hooked, so
; they keep their normal Windows behaviour.
;
; Start at login: put a shortcut to this file in the Startup folder
; (Win+R, type  shell:startup  and press Enter). Details in SETUP.md.
; ===========================================================================
#Requires AutoHotkey v2.0
#SingleInstance Force

isSending := false            ; guard: ignore presses while a send is running

PrintScreen::
{
    global isSending
    if isSending              ; a send is already in progress - ignore
        return
    isSending := true

    ; Immediate feedback, before the capture even starts.
    ToolTip "Sending your screenshot..."

    ; Run the capture script hidden and wait for it. Per the AHK v2 docs,
    ; RunWait's RETURN VALUE is the exit code; the fourth parameter would
    ; receive the process ID, not the exit code.
    exitCode := 1
    try {
        exitCode := RunWait('powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' A_ScriptDir '\capture-and-send.ps1"', , "Hide")
    } catch {
        exitCode := 1         ; PowerShell itself could not be started
    }

    ; Gentle result message for the parent.
    if (exitCode = 0)
        ToolTip "Sent. Help is on the way."
    else if (exitCode = 2)
        ToolTip "No internet right now. Saved - it will send automatically next time."
    else
        ToolTip "Something went wrong. The screenshot was not sent."

    isSending := false
    SetTimer HideTip, -3000   ; clear the message after 3 seconds
}

HideTip()
{
    global isSending
    if not isSending          ; never wipe the "Sending..." of a newer press
        ToolTip
}
