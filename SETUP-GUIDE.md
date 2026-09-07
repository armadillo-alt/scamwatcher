# ScamGuard — putting the whole thing live

*The complete path from "red sticker on a key" to "my phone pings and I help Mom" —
and, when you mark a scam, a red warning on Mom's screen before you have even dialled.
Each part has its own detailed guide; this page is the map. Expect 30–45 minutes total.*

## The picture

```
Parent's PC (Windows)                Your Google account              Your Android
─────────────────────                ──────────────────               ────────────
red key (PrintScreen)                Apps Script web app              Gmail ping
  └─ scamguard-key.ahk    ── POST ──▶  ├─ image → Drive folder          │
     captures the screen               ├─ text read from image (OCR)    ▼
     (queues offline,                  ├─ row → Google Sheet         ScamGuard PWA
      retries next press)              └─ email → you                 (installed from
                                            │                          GitHub Pages)
                                       Sheet published as CSV ──────▶ reads rows,
                                       (public link, no secrets)      you review,
                                                                      Call / WhatsApp
                                                                          │
red warning on their screen ◀── polls   "Verdicts" tab      ◀── "Mark as scam" posts
(check-verdicts.ps1, every 45 s)        (same Apps Script)      your guidance sentence
```

Three properties this design guarantees:

- **No secrets in this repository, ever.** The one sensitive string (the Apps Script
  `/exec` URL) lives only in `capture/config.ini` on the parent's PC — gitignored.
- **Nothing records in the background.** A screenshot exists only when the parent
  deliberately presses the key.
- **Reviews stay on your phone**, with one deliberate exception: if you switch on the
  on-screen warning (Step 3), a *scam* verdict and the guidance sentence you wrote travel
  back through your own Apps Script to their PC. Nothing else leaves your device, and a
  *safe* verdict sends nothing at all.

## Step 1 — Google side (~15 min, on your account)

Follow **[appsscript/SETUP.md](appsscript/SETUP.md)**: create the sheet, paste the
script, deploy it as a web app, run the built-in test, and publish the sheet as CSV.
You come out of it with two URLs:

| URL | Treat as | Goes where |
| --- | --- | --- |
| `https://script.google.com/macros/s/…/exec` | **secret** | `capture/config.ini` on the parent's PC, and (optionally) ScamGuard Settings → *Warning their PC* on your phone |
| `https://docs.google.com/spreadsheets/d/e/…/pub?output=csv` | public by design | ScamGuard Settings on your phone |

### Build the client's USB bundle before you go

From the repo root, with the `/exec` URL from step 1:

```
.\scripts\make-client-bundle.ps1 -Endpoint "https://script.google.com/macros/s/AKfy.../exec" -DeviceName "Mom's PC" -SecretKey "your-shared-key"
```

Add `-Language af` if your parent reads Afrikaans: every message they see on the
PC (the "Sent" tooltip, the red warning's heading and button) switches language.
It writes a ready folder to your Desktop with `config.ini` already filled in, so
at the client PC you only double-click `install.bat` — no retyping a long URL.
(The shared key goes in Apps Script's Script Properties as `SECRET_KEY`, never in
`Code.gs` — see appsscript/SETUP.md step 6.)
The script refuses to build inside this repo on purpose: a filled-in `config.ini`
holds your `/exec` URL, and a stray copy inside a git folder is exactly how that
URL once got committed to a public repo. Copy the folder to a USB stick.

## Step 2 — Parent's PC (~10 min, next visit)

Follow **[capture/SETUP.md](capture/SETUP.md)**: red sticker on **PrintScreen** (or
whichever key you set as `HOTKEY` - a R150–R300 USB macro keypad programmed to F13
makes a dedicated big red button, step H there), install AutoHotkey v2, copy the
scripts + your `config.ini` to `C:\ScamGuard`,
**add the antivirus exclusion for `C:\ScamGuard` (step C2 — don't skip it; a
screen-capture-and-upload tool trips AV heuristics by design)**, add the startup
shortcut, press the key once to test.

Then the only sentence your parent needs:

> “If anything on the computer ever worries you, just press the red key —
> I’ll see it and phone you.”

## Step 3 — Your phone (~10 min)

1. **Deploy the dashboard.** On GitHub: repo → Settings → Pages → Source: **GitHub
   Actions**. The included workflow builds and deploys on every push to `main`; your
   app lands at `https://<your-username>.github.io/scamwatcher/`.
2. Open that URL on your Android → **Settings** in the app:
   - *Where screenshots come from* → **A Google Sheet** → paste the CSV link → Save.
   - *Reaching your parent* → their number with country code → Save.
   - *Warning their PC* → paste the `/exec` URL and the shared key → Save. This is what
     lets **Mark as scam** put a red warning on their screen. It stays in this browser
     only; skip it if you'd rather the phone call be the only channel.
3. In Chrome: menu ⋮ → **Add to Home screen** → it installs as a proper app
   (ScamGuard icon, full screen, no browser chrome).
4. Make sure **Gmail notifications are on** — the capture email is your doorbell.

## The daily flow (what it feels like)

1. Phone pings: *“ScamGuard: Mom's PC pressed the red key.”*
2. Tap the ScamGuard icon → the new screenshot is at the top, already scored, with
   plain-language reasons.
3. Write one sentence of guidance and save it, then decide: **Mark safe** or **Mark as
   scam**. Marking a scam puts a large red warning on their screen within about a minute,
   in your own words ("Don't touch it — I'm phoning you"), so they stop before you dial.
4. Tap **Call them** — or **WhatsApp your guidance** and it arrives pre-typed.

## End-to-end test checklist (do this once, before relying on it)

- [ ] Press the red key on the parent's PC → tooltip says it was sent
- [ ] A new row appears in the Google Sheet within ~15 seconds
- [ ] The email arrives on your phone (this is your real-time doorbell)
- [ ] Pull-to-refresh (or Refresh) in ScamGuard shows the screenshot — **allow up to
      ~5 minutes**: Google caches the published CSV, so the dashboard can lag the sheet
      by a few minutes. The email is instant; the dashboard list is not. (Nothing is
      broken if the row is in the sheet but not yet in the app — wait and refresh.)
- [ ] Risk level and “why it was flagged” make sense
- [ ] Unplug the parent's network cable, press the key → tooltip says “saved, will send
      later” → replug, press again → both arrive
- [ ] Call and WhatsApp buttons work from the detail panel
- [ ] Save a guidance sentence, tap **Mark as scam** → the toast says "Warning sent to
      Mom's PC" → within about a minute their screen shows the red warning with your words;
      **Escape** closes it
- [ ] Mark something **safe** → nothing appears on their screen (that is intended)

## If something leaks or breaks

- **The /exec URL got shared somewhere** → appsscript/SETUP.md §“Rotating the URL”:
  archive the deployment, create a new one, update `config.ini`. Takes 2 minutes.
- **Images don’t show in the dashboard** → the Drive sharing step was skipped; rerun
  `TEST_endToEnd` and check the troubleshooting table in appsscript/SETUP.md.
- **No emails** → check Gmail spam once; Apps Script’s free daily mail quota (100/day)
  is far above any realistic use.
- **The warning never appears on their PC** → in this order: Settings → *Warning their
  PC* has the `/exec` URL and the same key as Script Properties (the toast after
  "Mark as scam" tells you if the relay refused it); `POLL_SECONDS` in `config.ini` is
  not `0`; `check-verdicts.ps1` sits next to the `.ahk` in `C:\ScamGuard`; the verdict
  was less than 10 minutes old when the PC first polled after install.
- Local pipeline test without Google (for development): `node scripts/mock-backend.mjs`
  then point `capture/config.ini`'s ENDPOINT_URL at `http://localhost:8787/exec`, the
  dashboard's sheet at `http://localhost:8787/sheet.csv` and its *Warning their PC* link
  at `http://localhost:8787/exec`. The mock answers capture, verdict and poll.
