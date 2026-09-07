# ScamGuard - setting up the red key on the parent's PC

This folder is the capture side of ScamGuard: it turns one key on the
parent's Windows 10/11 PC into the "show me" key. One press captures the
whole screen and sends it to your Apps Script inbox, which files it in
Drive, adds a row to the sheet, and emails your phone. The parent sees a
gentle confirmation and nothing else - until you mark that screenshot as a
scam in the app, when a large red warning appears on their screen in your
own words (step D2).

Before you start you need the Apps Script deployment URL (the link ending
in `/exec`) - you copied it in `appsscript/SETUP.md`, **step 6**. Budget
about 15 minutes at the parent's PC (or over remote support).

| File | Purpose |
|---|---|
| `install.bat` | **the easy path** — does steps C–E for you (see below) |
| `uninstall.bat` | clean removal (after testing on your own PC) |
| `scamguard-key.ahk` | listens for the red key, shows the gentle messages and the red warning |
| `capture-and-send.ps1` | captures the screen, sends it, queues it when offline |
| `check-verdicts.ps1` | asks your Apps Script whether you marked a scam; launched by the `.ahk` every `POLL_SECONDS` |
| `setup-autohotkey.ps1` | used by `install.bat` to find/install AutoHotkey v2 and register the startup entry |
| `watcher.ps1` | alternative that needs no AutoHotkey (step F) |
| `config.example.ini` | template for `config.ini` — every setting is explained in it |
| *(optional hardware)* | a USB macro keypad as a dedicated big red button — step H |
| `READ-ME-FIRST.txt` | the one-page version of this file, for the USB stick |

## Fast path: one-file install

If you just want it done, copy this folder to the parent's PC (USB stick, or
download the `ScamGuard-parent-PC.zip` bundle) and **double-click `install.bat`**.
It asks for administrator rights, then creates `C:\ScamGuard`, writes `config.ini`
(it will prompt for your `/exec` URL, the key, and English or Afrikaans for the
messages your parent sees), adds the antivirus exclusion, sets ScamGuard to start
at logon, installs AutoHotkey if needed, and launches it. Then do step A
(the red sticker + the sentence to your parent) and test.

Better still, build the bundle at home with `config.ini` already filled in, so
nothing has to be typed at the parent's PC: from the repo root,
`.\scripts\make-client-bundle.ps1 -Endpoint "<your /exec URL>" -DeviceName "Mom's PC" -SecretKey "<your key>"`
(see SETUP-GUIDE.md). It writes the folder to your Desktop and deliberately
refuses to run inside the repo, so a filled-in `config.ini` can never end up
in git. To rebuild a plain ZIP without the config instead: in PowerShell,
`Compress-Archive -Path capture\install.bat,capture\uninstall.bat,capture\setup-autohotkey.ps1,capture\READ-ME-FIRST.txt,capture\scamguard-key.ahk,capture\capture-and-send.ps1,capture\check-verdicts.ps1,capture\watcher.ps1,capture\config.example.ini,capture\SETUP.md -DestinationPath ScamGuard-parent-PC.zip -Force`.

The steps below are the same thing done by hand, if you'd rather.

## A) Put the red sticker on the key

1. Stick a small round red sticker on the **PrintScreen** key (top row,
   right of F12; often labelled `PrtScn` or `Prt Sc`).
2. Explain it to your parent in one sentence, no technology talk:

   > "If anything on the computer ever worries you, just press the red key - I'll see it and phone you."

   Keep it at that. The point of the red key is that it needs no
   understanding of scams, screenshots, or the internet.

## B) Install AutoHotkey v2

Open a Command Prompt on the parent's PC and run:

```
winget install -e --id AutoHotkey.AutoHotkey
```

or download the **v2** installer from <https://www.autohotkey.com>.
AutoHotkey is the small free tool that lets us remap the key.

## C) Copy the files and create config.ini

1. Create the folder `C:\ScamGuard`.
2. Copy `scamguard-key.ahk`, `capture-and-send.ps1` and `check-verdicts.ps1`
   into it. (Without `check-verdicts.ps1` the red key still works; only the
   on-screen warning is missing.)
3. Copy `config.example.ini` to `C:\ScamGuard\config.ini`, open it in
   Notepad and:
   - paste your `/exec` URL as `ENDPOINT_URL` (from `appsscript/SETUP.md`,
     step 6),
   - set `DEVICE_NAME` to something you will recognise ("Mom's PC"),
   - set `SECRET_KEY` to the value you put in Apps Script's Script
     Properties (recommended),
   - optionally change `HOTKEY` (laptops often lack PrintScreen - `F12`,
     `Pause` or `^!s` for Ctrl+Alt+S all work; put the sticker on that key),
   - optionally change `POLL_SECONDS` (how often the PC checks for your
     verdict; default 45, `0` switches the on-screen warning off),
   - set `LANGUAGE=af` if your parent reads Afrikaans. It changes every word
     they see on this PC - the "Sending..."/"Sent" messages and the red
     warning's heading, note and button. Your own guidance sentence is shown
     exactly as you typed it, so write that in their language too.
4. `config.ini` stays on that PC only. The URL in it is a capability:
   anyone who has it can post into your sheet. It is gitignored in this
   repo on purpose - never commit or share it.

## C2) Allow the script in antivirus (important, do not skip)

A program that captures the screen and uploads it looks, to antivirus
heuristics, exactly like the spyware it is designed to catch - so Windows
Defender (or Norton/McAfee/etc.) may silently block `capture-and-send.ps1`
with "This script contains malicious content." It is a false alarm, but if
you skip this the red key will quietly do nothing.

Add `C:\ScamGuard` as an exclusion. In an **Administrator** PowerShell:

```
Add-MpPreference -ExclusionPath "C:\ScamGuard"
```

(Or by hand: Windows Security -> Virus & threat protection -> Manage settings
-> Add or remove exclusions -> Add a folder -> `C:\ScamGuard`.) If the parent
uses a third-party antivirus, add the same folder exclusion there too.

Only ever exclude this one folder, and only because you put the scripts in it
and know what they do - you can read every line of `capture-and-send.ps1`.

## D) Test it

1. Double-click `C:\ScamGuard\scamguard-key.ahk`. A green **H** icon
   appears in the system tray (bottom-right, possibly behind the `^` arrow).
2. Press the red key. You should see "Sending your screenshot..." and a
   few seconds later "Sent. Help is on the way."
3. Check your side: a new row in the **ScamGuard Data** sheet, the image in
   Drive, and the notification email on your phone.

## D2) Test the warning on their screen

This needs the `/exec` URL and shared key saved on your phone: ScamGuard
app -> Settings -> **Warning their PC** (SETUP-GUIDE.md, step 3).

1. Open the test screenshot in the app, type a sentence of guidance
   ("Don't touch it - I'm phoning you") and save it.
2. Tap **Mark as scam**. The toast should say "Warning sent to Mom's PC".
3. Within about a minute (`POLL_SECONDS`) the parent's screen shows a large
   red window with your sentence and a beep. **Escape** closes it. If you
   saved no guidance, a firm standard warning is shown instead - in English
   or, with `LANGUAGE=af`, in Afrikaans ("STOP - dit is 'n bedrogspul").
4. Mark something **safe**: nothing appears on their screen. That is on
   purpose - a reassuring popup every time would teach them to click
   warnings away without reading, which is exactly what a scammer needs.

Only the bare key press and the poll ever talk to Google. The poll sends the
device name and a timestamp, never anything from the screen.

## E) Start it automatically at login

1. On the parent's PC press **Win+R**, type `shell:startup`, press Enter.
   The Startup folder opens.
2. Right-click `C:\ScamGuard\scamguard-key.ahk` and choose **Copy**, then
   right-click inside the Startup folder and choose **Paste shortcut**.
3. Optional but worth it: reboot once and confirm the green **H** icon
   comes back on its own.

## F) No AutoHotkey? Use the watcher instead

If you cannot or do not want to install AutoHotkey, `watcher.ps1` does the
same job using only Windows built-ins:

1. Copy `watcher.ps1` into `C:\ScamGuard` (next to `config.ini`).
2. Teach the parent **Win + the red key** instead of just the red key
   (Windows itself takes the screenshot - the screen dims briefly and the
   PNG lands in `Pictures\Screenshots`; the watcher notices it and sends it).
3. Register the watcher to start at every login - run once in a Command
   Prompt:

   ```
   schtasks /Create /TN "ScamGuard Watcher" /TR "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File C:\ScamGuard\watcher.ps1" /SC ONLOGON /RL LIMITED /F
   ```

4. Start it right now without logging off:

   ```
   schtasks /Run /TN "ScamGuard Watcher"
   ```

Differences to know about: there is no tooltip in this mode (the brief
screen dim is the confirmation), the bare red key on its own does nothing,
and only screenshots taken while the watcher is running are sent. Offline
queueing works exactly the same.

## H) Optional: a dedicated big red button (macro keypad)

A sticker on PrintScreen works, but a separate button that does nothing
else is easier to explain, easier to find in a panic, and impossible to
confuse with the rest of the keyboard. Any cheap USB **macro keypad**
(also sold as "programmable mini keyboard", "custom keypad", "1-key /
3-key macro pad") does the job. They cost roughly R150–R300 online and
plug in next to the keyboard. Pick one that says its keys are
**programmable and stored on the device** ("onboard memory", "no driver
needed after setup") - then it works on the parent's PC without any extra
software running there. If it has a red keycap, even better; otherwise
the red sticker goes on the button.

Program it **once, at home**, before you visit:

1. Plug it into your own PC and open the programming tool it came with
   (usually a small Windows program or a web page named on the box).
2. Set the button to send the single key **F13**. No normal keyboard has
   F13-F24, so nothing on the PC reacts to it and nobody can press it by
   accident. If the tool cannot send F13, choose a combination no program
   uses, e.g. **Ctrl+Alt+Shift+F12**.
3. Save to the device, unplug, plug into the parent's PC.

Then in `config.ini` on the parent's PC:

```
HOTKEY=F13
```

or, to keep the stickered PrintScreen key working as well:

```
HOTKEY=F13,PrintScreen
```

(For the Ctrl+Alt+Shift+F12 fallback: `HOTKEY=^!+F12`.) `install.bat`
asks for this at install time; `make-client-bundle.ps1 -Hotkey "F13,PrintScreen"`
bakes it into the bundle. Restart ScamGuard (or the PC) after editing
`config.ini`; hover the green **H** tray icon to confirm it lists the key.

A button that gets pressed and held sends the key over and over; ScamGuard
ignores repeats for two seconds after a send finishes, so one long press is
one screenshot.

Test it exactly like step D: press the button, expect "Sending..." then
"Sent". If nothing happens, the pad is probably sending something other
than F13 - press it inside Notepad (nothing should appear for F13; a letter
or symbol means it was programmed to that instead) and re-program it.

## G) Troubleshooting

| What you see | What it means / what to do |
|---|---|
| Tooltip: "No internet right now. Saved..." | The PC is offline. The screenshot waits in `%LOCALAPPDATA%\ScamGuard\queue` and is sent automatically at the start of the next press. Watch that folder fill and then empty to confirm the queue works. |
| Pressing the red key does nothing at all | AutoHotkey is not running. Look for the green **H** icon in the tray; if missing, double-click `scamguard-key.ahk` and re-check the Startup shortcut (step E). With a macro keypad: hover the icon - it lists the active key(s); if the pad's key is not there, fix `HOTKEY` (step H). |
| Tooltip: "Something went wrong" AND `error.log` mentions "malicious content" / a virus block | Antivirus is blocking the capture script. Add the `C:\ScamGuard` exclusion in **step C2**. This is the most common first-run failure. |
| Tooltip: "Something went wrong" right after setup | Besides antivirus, check `config.ini`: is `SECRET_KEY` here the same as in `Code.gs`? A wrong key is now reported honestly ("not sent") instead of being queued forever - `error.log` will say "endpoint rejected the screenshot: Wrong or missing key." |
| Tooltip: "Something went wrong..." every time | Open `%LOCALAPPDATA%\ScamGuard\error.log`. The usual causes: `config.ini` missing, or `ENDPOINT_URL` still the placeholder. |
| Worried that ExecutionPolicy blocks the script | It does not - both launch commands pass `-ExecutionPolicy Bypass`, which applies only to that one hidden process. Nothing to change on the PC. |
| The parent has two monitors | Both arrive as one wide image. That is expected - the capture spans the whole desktop so nothing is missed. |
| Row appears in the sheet but no email | The capture side is fine; check the Apps Script side (`appsscript/SETUP.md`, troubleshooting table). |
| You want to see what happened lately | `%LOCALAPPDATA%\ScamGuard\activity.log` has one line per capture: SENT, QUEUED or ERROR, with sizes, plus one line per warning received. |
| You marked a scam but no warning appeared | Check, in order: the app's toast said "Warning sent" (if it said the relay refused it, the key in Settings does not match Script Properties); `POLL_SECONDS` in `config.ini` is not `0`; `check-verdicts.ps1` is in `C:\ScamGuard` next to the `.ahk`; the PC had been running for at least one poll. A PC polling for the very first time only sees verdicts from the last 10 minutes, so an old test verdict will not replay - mark a fresh one. `error.log` records poll problems, throttled so it does not fill up. |
| The warning shows the standard text, not your words | The guidance was not saved before you tapped "Mark as scam". Save the sentence first; the panel says so under the guidance box. |

**Privacy, so you can say it with a straight face:** nothing on the PC
records in the background. The screen is captured at exactly one moment -
when the red key is pressed (or, in watcher mode, when Windows itself saves
a screenshot). There is no keylogging and no periodic upload of anything
from the screen. The only scheduled activity is the verdict poll every
`POLL_SECONDS`, which sends the device name and a timestamp to your own
Apps Script and nothing else - and `POLL_SECONDS=0` switches even that off.
