; ===========================================================================
; ScamGuard - scamguard-key.ahk        (requires AutoHotkey v2, see SETUP.md)
; ---------------------------------------------------------------------------
; The parent's whole side of ScamGuard, in one small script. It runs in both
; directions:
;
;   OUT  Turns one key (the one with the red sticker) into the help key: a
;        single press captures the whole screen and sends it to the
;        caregiver's ScamGuard inbox, with a gentle on-screen message for
;        the person at the PC.
;
;   IN   Every POLL_SECONDS it quietly asks the same endpoint whether the
;        caregiver has looked yet. If she marked what was on screen as a
;        SCAM, a large red warning appears in the middle of the screen, in
;        her own words, telling the parent to stop and wait. A "safe"
;        verdict shows nothing at all, deliberately: a popup that is usually
;        harmless is a popup she learns to click away without reading, and
;        that is the exact habit a scammer needs.
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
; The real work happens in two PowerShell scripts in this same folder:
;
;   capture-and-send.ps1  run on every key press and waited for; its exit
;                         code drives the message shown:
;                         0 = sent   2 = offline, saved for later
;                         anything else = error
;
;   check-verdicts.ps1    run on a timer and never waited for (a blocking
;                         HTTP call would freeze the red key). When the
;                         caregiver marks something as a scam it writes a
;                         line into %LOCALAPPDATA%\ScamGuard\alert.txt, and
;                         this script turns that into the red warning
;                         within about three seconds.
;                         Set POLL_SECONDS=0 in config.ini to switch the
;                         whole warning half off.
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
warningGui := ""              ; the red warning window while one is on screen
alertFile := EnvGet("LOCALAPPDATA") "\ScamGuard\alert.txt"

; What the parent sees when the caregiver marked something as a scam but did
; not type anything. It has to work on its own, so it says what to do rather
; than what happened.
DEFAULT_WARNING := "Do not click anything on that screen, and do not phone any number on it. "
    . "Close it and wait - I am contacting you now."

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

; --- How often do we ask whether the caregiver has decided? -----------------
; POLL_SECONDS=0 (or a nonsense value) switches the warning half off entirely.
pollSeconds := 45
rawPoll := Trim(ReadConfigValue("POLL_SECONDS", "45"))
if (rawPoll = "")
    rawPoll := "45"
try {
    if IsNumber(rawPoll)
        pollSeconds := Integer(rawPoll)
    else
        pollSeconds := 0      ; someone typed words in there - stay quiet
} catch {
    pollSeconds := 0
}
if (pollSeconds < 0)
    pollSeconds := 0
if (pollSeconds > 0 and pollSeconds < 5)
    pollSeconds := 5          ; floor: faster than this only burns the quota

; A PC upgraded with this file but not with check-verdicts.ps1 would launch a
; PowerShell that finds nothing, every POLL_SECONDS, for ever. Stay quiet
; instead; the red key still works exactly as it always did.
if (pollSeconds > 0 and not FileExist(A_ScriptDir "\check-verdicts.ps1"))
    pollSeconds := 0

if (pollSeconds > 0) {
    ; Two separate timers on purpose. SetTimer is keyed on the function, so
    ; re-using PollForVerdicts for the startup check would turn the repeating
    ; timer into a one-shot; FirstPoll is a different function and therefore
    ; a different timer.
    SetTimer(FirstPoll, -5000)                  ; one quick look ~5s after login
    SetTimer(PollForVerdicts, pollSeconds * 1000)
    SetTimer(CheckForAlert, 3000)               ; is there a warning to show?
}

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

; ===========================================================================
; The warning half: asking whether the caregiver has decided, and telling
; the person at the PC when the answer is "scam".
; ===========================================================================

; One extra check shortly after login, so a verdict left overnight does not
; have to wait a full POLL_SECONDS. A separate function from PollForVerdicts
; because SetTimer identifies a timer by its function.
FirstPoll()
{
    PollForVerdicts()
}

; Ask the endpoint whether anything has been marked. NEVER RunWait: this sits
; on a timer, and waiting for an HTTP round trip would freeze the red key for
; as long as the network takes. The poller does all its talking through
; alert.txt, so there is nothing to wait for anyway.
PollForVerdicts()
{
    try {
        Run('powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' A_ScriptDir '\check-verdicts.ps1"', , "Hide")
    } catch {
        ; PowerShell blocked or missing. Nothing useful can be done from
        ; here, and a message box every POLL_SECONDS would be far worse than
        ; silence - the failure is already in check-verdicts' own error.log.
    }
}

; Has check-verdicts.ps1 left a warning for us? Runs every three seconds.
CheckForAlert()
{
    global isSending, alertFile

    if isSending
        return          ; a capture is running; the warning can wait 3 seconds

    ; Claim the file by renaming it before reading. An append that is still
    ; in flight makes the rename fail and we simply try again on the next
    ; tick, so a warning can never be half-read and thrown away. Once it is
    ; renamed nothing else knows the name, so it cannot fire twice either.
    taken := alertFile ".taken"
    if not FileExist(taken) {
        if not FileExist(alertFile)
            return
        try
            FileMove(alertFile, taken, true)
        catch
            return
    }
    ; (If .taken already existed, a previous pass was interrupted between
    ; claiming the file and showing it. Finish that job instead.)

    contents := ""
    try
        contents := FileRead(taken, "UTF-8")
    catch
        contents := ""

    try
        FileDelete(taken)
    if FileExist(taken)
        return          ; cannot clear it - never risk warning her on a loop

    ; Each line is  <iso>|<message>  and the newest is last.
    lines := []
    for line in StrSplit(contents, "`n", "`r") {
        line := Trim(line)
        if (line != "")
            lines.Push(line)
    }
    if (lines.Length = 0)
        return

    last := lines[lines.Length]
    bar := InStr(last, "|")
    if (bar > 0)
        message := Trim(SubStr(last, bar + 1))
    else
        message := Trim(last)     ; no timestamp: treat the whole line as words

    ShowScamWarning(message, lines.Length)
}

; The warning itself. Big, red, unmissable, and impossible to lose behind
; another window - but always closable, by the button or by Escape.
ShowScamWarning(message, total := 1)
{
    global warningGui, DEFAULT_WARNING

    if (message = "")
        message := DEFAULT_WARNING
    ; The window grows to fit whatever the caregiver wrote, but not without
    ; limit - it still has to fit on a small laptop screen at 125% scaling.
    ; 320 characters is about seven lines, far more than anyone types here.
    if (StrLen(message) > 320)
        message := SubStr(message, 1, 317) "..."

    note := "Sent by your family just now."
    if (total > 1)
        note := "Sent by your family just now. This is the newest of " total " messages."

    ; Never stack warnings: replace whatever is on screen so the words she
    ; reads are the newest ones.
    CloseWarning()

    try {
        g := Gui("+AlwaysOnTop -SysMenu -MinimizeBox -MaximizeBox -Resize", "Warning from your family")
        g.BackColor := "9E2B25"                 ; the ScamGuard warning red

        g.SetFont("s42 Bold cFFFFFF", "Segoe UI")
        g.AddText("x40 y26 w740 h68 Center BackgroundTrans", "STOP - this is a scam")

        g.SetFont("s20 Norm cFFFFFF", "Segoe UI")
        g.AddText("x40 y98 w740 Center BackgroundTrans", message)

        g.SetFont("s16 Norm cFFFFFF", "Segoe UI")
        noteText := g.AddText("x40 y+16 w740 Center BackgroundTrans", note)

        ; The button normally sits at a fixed spot near the bottom, so it is
        ; in the same place every time she sees this window. Only if the
        ; caregiver wrote enough to reach that far does the text push the
        ; button - and the window - further down. Measuring beats guessing:
        ; how many lines the message wraps to depends on the font Windows
        ; actually used and on the display scaling.
        buttonY := 326
        try {
            noteText.GetPos( , &noteY, , &noteH)
            if (noteY + noteH + 22 > buttonY)
                buttonY := noteY + noteH + 22
        }
        windowH := 460
        if (buttonY + 78 + 46 > windowH)
            windowH := buttonY + 78 + 46

        g.SetFont("s24 Bold c000000", "Segoe UI")
        button := g.AddButton("x230 y" buttonY " w360 h78 Default", "OK, I understand")
        button.OnEvent("Click", CloseWarning)

        g.OnEvent("Escape", CloseWarning)       ; it must never trap her
        g.OnEvent("Close", CloseWarning)        ; there is no X, but Alt+F4 works

        warningGui := g
        g.Show("w820 h" windowH " Center")
        try
            WinActivate("ahk_id " g.Hwnd)
        SetTimer(AlertBeep, -50)                ; beep once the window has painted
    } catch {
        ; The window could not be built for any reason at all. The message
        ; still has to reach her, so fall back to something that cannot fail.
        warningGui := ""
        try
            MsgBox("STOP - this is a scam`n`n" message "`n`n" note, "Warning from your family", "Iconx 4096")
    }
}

CloseWarning(*)
{
    global warningGui
    if not IsObject(warningGui)
        return
    closing := warningGui
    warningGui := ""            ; cleared first, so Destroy cannot re-enter
    try
        closing.Destroy()
}

AlertBeep()
{
    ; Two short beeps to pull her eyes to the screen - deliberately not a
    ; siren. She may well be on the phone to the scammer while this appears,
    ; and a continuous alarm would frighten her instead of informing her.
    try {
        SoundBeep(1000, 300)
        SoundBeep(800, 300)
    }
}
