# ScamGuard - setting up the red key on the parent's PC

This folder is the capture side of ScamGuard: it turns one key on the
parent's Windows 10/11 PC into the "show me" key. One press captures the
whole screen and sends it to your Apps Script inbox, which files it in
Drive, adds a row to the sheet, and emails your phone. The parent sees a
gentle confirmation and nothing else.

Before you start you need the Apps Script deployment URL (the link ending
in `/exec`) - you copied it in `appsscript/SETUP.md`, **step 6**. Budget
about 15 minutes at the parent's PC (or over remote support).

| File | Purpose |
|---|---|
| `install.bat` | **the easy path** — does steps C–E for you (see below) |
| `scamguard-key.ahk` | listens for the red key, shows the gentle messages |
| `capture-and-send.ps1` | captures the screen, sends it, queues it when offline |
| `watcher.ps1` | alternative that needs no AutoHotkey (step F) |
| `config.example.ini` | template for `config.ini` |

## Fast path: one-file install

If you just want it done, copy this folder to the parent's PC (USB stick, or
download the `ScamGuard-parent-PC.zip` bundle) and **double-click `install.bat`**.
It asks for administrator rights, then creates `C:\ScamGuard`, writes `config.ini`
(it will prompt for your `/exec` URL), adds the antivirus exclusion, sets ScamGuard
to start at logon, installs AutoHotkey if needed, and launches it. Then do step A
(the red sticker + the sentence to your parent) and test.

To rebuild the ZIP from this folder: in PowerShell, `Compress-Archive -Path
capture\install.bat,capture\READ-ME-FIRST.txt,capture\scamguard-key.ahk,capture\capture-and-send.ps1,capture\watcher.ps1,capture\config.example.ini,capture\SETUP.md -DestinationPath ScamGuard-parent-PC.zip -Force`.

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
2. Copy `scamguard-key.ahk` and `capture-and-send.ps1` into it.
3. Copy `config.example.ini` to `C:\ScamGuard\config.ini`, open it in
   Notepad and:
   - paste your `/exec` URL as `ENDPOINT_URL` (from `appsscript/SETUP.md`,
     step 6),
   - set `DEVICE_NAME` to something you will recognise ("Mom's PC"),
   - set `SECRET_KEY` if you configured one in `Code.gs` (recommended).
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

## G) Troubleshooting

| What you see | What it means / what to do |
|---|---|
| Tooltip: "No internet right now. Saved..." | The PC is offline. The screenshot waits in `%LOCALAPPDATA%\ScamGuard\queue` and is sent automatically at the start of the next press. Watch that folder fill and then empty to confirm the queue works. |
| Pressing the red key does nothing at all | AutoHotkey is not running. Look for the green **H** icon in the tray; if missing, double-click `scamguard-key.ahk` and re-check the Startup shortcut (step E). |
| Tooltip: "Something went wrong" AND `error.log` mentions "malicious content" / a virus block | Antivirus is blocking the capture script. Add the `C:\ScamGuard` exclusion in **step C2**. This is the most common first-run failure. |
| Tooltip: "Something went wrong" right after setup | Besides antivirus, check `config.ini`: is `SECRET_KEY` here the same as in `Code.gs`? A wrong key is now reported honestly ("not sent") instead of being queued forever - `error.log` will say "endpoint rejected the screenshot: Wrong or missing key." |
| Tooltip: "Something went wrong..." every time | Open `%LOCALAPPDATA%\ScamGuard\error.log`. The usual causes: `config.ini` missing, or `ENDPOINT_URL` still the placeholder. |
| Worried that ExecutionPolicy blocks the script | It does not - both launch commands pass `-ExecutionPolicy Bypass`, which applies only to that one hidden process. Nothing to change on the PC. |
| The parent has two monitors | Both arrive as one wide image. That is expected - the capture spans the whole desktop so nothing is missed. |
| Row appears in the sheet but no email | The capture side is fine; check the Apps Script side (`appsscript/SETUP.md`, troubleshooting table). |
| You want to see what happened lately | `%LOCALAPPDATA%\ScamGuard\activity.log` has one line per capture: SENT, QUEUED or ERROR, with sizes. |

**Privacy, so you can say it with a straight face:** nothing on the PC
records in the background. The screen is captured at exactly one moment -
when the red key is pressed (or, in watcher mode, when Windows itself saves
a screenshot). There is no schedule, no periodic upload, no keylogging;
between presses the scripts are idle.
