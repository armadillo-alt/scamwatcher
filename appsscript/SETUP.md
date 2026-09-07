# ScamGuard backend setup (Google Apps Script)

This folder is the whole "backend": one Apps Script web app running inside
your own Google account. There is no server to rent, nothing to install on
your machine, and **no credentials anywhere** — the deployed web app URL is
the only secret-like value, and it lives only in the parent PC's `config.ini`
and, if you switch on the on-screen warning, in the dashboard's local Settings.

Time needed: about 20 minutes, once.

## How it works

```
  Parent's PC (red key)                     Your Google account (everything runs as you)
 +----------------------+   HTTPS POST    +--------------------------------------+
 | 1. red key pressed   |   JSON body     |  Apps Script web app  (.../exec)     |
 | 2. screenshot taken  | --------------> |  Code.gs: doPost()                   |
 | 3. script sends it   |  (base64 image) +----+-------------+-------------+----+
 +----------------------+                      |             |             |
                                               v             v             v
                                      Drive folder      Sheet tab      Email to you
                                      "ScamGuard        "Screenshots"  (your Android
                                       Screenshots"          |          phone pings)
                                      (image files)          | published to the web
                                                             | as CSV (step 7)
                                                             v
                                                   ScamGuard dashboard
                                                   (reads the CSV, shows
                                                    the screenshots + verdicts)
                                                             |
   Parent's PC  <-- polls every 45 s --  Sheet tab  <-- "Mark as scam" posts
   (red warning     (action=poll)        "Verdicts"     (action=verdict)
    on screen)
```

The same web app is also the way back (see "The way back: verdicts" below):
the dashboard posts your scam verdicts to it, and the parent's PC polls it
so a warning can appear on their screen.

Each capture becomes one row in the sheet, in exactly this column order
(the dashboard depends on it):

| id | screenshot_url | timestamp | parent_id | ocr_text |
|----|----------------|-----------|-----------|----------|
| a UUID | Drive thumbnail link | ISO date/time | device name, e.g. "Mum's PC" | text read from the screenshot |

---

## Step 1 — Create the Google Sheet

1. Go to <https://sheets.new> (signed in as the account that should own all
   the data — yours, not the parent's).
2. Name the spreadsheet **ScamGuard Data** (top-left, click "Untitled
   spreadsheet").
3. You can rename the first tab to **Screenshots**, or leave it — the script
   creates a tab named `Screenshots` automatically if it is missing.

## Step 2 — Open Apps Script from inside the sheet

In the spreadsheet's menu: **Extensions → Apps Script**.

This creates a *container-bound* script — one that belongs to the sheet —
which is what lets the code find the spreadsheet without any ID or key.
Give the project a name (top-left): **ScamGuard**.

> Created the script at script.google.com instead (standalone)? It will not
> find the sheet by itself. Either start again from Extensions → Apps Script
> (recommended), or add a Script Property named `SPREADSHEET_ID` under
> **Project Settings → Script properties**, set to the long ID in the sheet's
> URL (between `/d/` and `/edit`).

## Step 3 — Paste the code and the manifest

1. In the editor, delete the placeholder `function myFunction() {}` in
   `Code.gs` and paste the full contents of this folder's **`Code.gs`**.
2. Show the manifest: click the gear icon (**Project Settings**) in the left
   sidebar and tick **"Show 'appsscript.json' manifest file in editor"**.
3. Back in the **Editor** (the `< >` icon), open `appsscript.json` and replace
   its contents with this folder's **`appsscript.json`**.
4. Save everything (Ctrl+S).

The manifest sets the timezone (Africa/Johannesburg), enables the advanced
Drive service used for OCR, declares the web app as anonymous-access, and
lists exactly the five permissions the script needs — no more.

## Step 4 — Check the advanced Drive service

The manifest you pasted in step 3 already enables **Drive API v2** (that is
the `enabledAdvancedServices` block — it is what performs the OCR). Confirm
it took: in the left sidebar, **Services** should now list **Drive**.

If it does not appear, add it by hand: click **+** next to **Services** →
scroll to **Drive API** → set **Version** to **v2** → identifier **Drive** →
**Add**. (This does the same thing as the manifest block.)

If OCR is never enabled, nothing breaks — captures still work, and the
`ocr_text` column simply stays empty.

## Step 5 — Run the end-to-end test (and grant permissions)

1. In the editor toolbar, open the function dropdown and select
   **`TEST_endToEnd`**, then click **Run**.
2. The first run asks for authorisation:
   - "Authorization required" → **Review permissions**
   - choose your account
   - "Google hasn't verified this app" — this is normal for your own private
     scripts → click **Advanced** → **Go to ScamGuard (unsafe)**
   - review the list and click **Allow**.

   Why each permission is needed:
   - **Google Sheets** — append one row per capture.
   - **Google Drive** — save the screenshot files and create the temporary
     OCR document.
   - **Google Docs** — read the text out of that temporary OCR document.
   - **Send email as you** — the notification email.
   - **See your email address** — to know where to send it when
     `NOTIFY_EMAIL` is left empty.

3. Run `TEST_endToEnd` again if the first run only performed authorisation.
4. Check the results. This is a **real** run: expect a genuine email in your
   inbox, a new **ScamGuard Screenshots** folder in Drive containing a tiny
   test image, and a new row in the **Screenshots** tab. The execution log
   (bottom of the editor) shows the appended row and the screenshot URL.
   The test image is a blank 1×1 pixel, so an empty `ocr_text` is expected.
5. Feel free to delete the test row and the test file afterwards.

## Step 6 — Deploy the web app

1. Top right: **Deploy → New deployment**.
2. Click the gear icon next to **Select type** and choose **Web app**.
3. Fill in:
   - **Description**: anything, e.g. `ScamGuard v1`
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone** — this is what lets the parent PC post
     without a Google login. The script's own key check (`SECRET_KEY`) is the
     gate instead.
4. Click **Deploy**, authorise if asked again, and **copy the Web app URL**
   (it ends in `/exec`).

**Treat that URL like a password.** Anyone who has it can add rows to your
sheet and send you email. So:

- paste it only into the parent PC's `config.ini` and, optionally, the
  dashboard's Settings → *Warning their PC* (stored in that browser only);
- never commit it to a repository, never post it in a chat or screenshot;
- set a shared key: **Project Settings → Script properties → Add script
  property**, name `SECRET_KEY`, value a long random string. Put the same
  string in the parent PC's `config.ini` and in the dashboard's Settings →
  *Warning their PC*. Then a leaked URL alone is not enough (see step 9 for
  rotating the URL if it ever does leak). Do **not** type the key into
  `Code.gs` — that file lives in a public repository, and a key on that line
  got committed by accident twice during development. The `SECRET_KEY`
  constant in the file stays empty; the Script Property wins when both exist.

## Step 7 — Publish the sheet as CSV for the dashboard

1. In the **spreadsheet** (not the script editor):
   **File → Share → Publish to web**.
2. On the **Link** tab, change the two dropdowns:
   - first dropdown: the **Screenshots** tab (not "Entire Document"),
   - second dropdown: **Comma-separated values (.csv)**.
3. Click **Publish**, confirm, and copy the generated link.
4. Paste that link into the ScamGuard dashboard's **Settings** page.

Notes:

- The published CSV is readable by anyone who has its (unguessable) link.
  It contains the OCR text of the screenshots — that is the deliberate
  trade-off that keeps the dashboard free of credentials.
- Google caches published CSVs; new rows can take up to about five minutes
  to appear in the dashboard.

## Step 8 — Test from Windows with curl

Save this as `payload.json` in any folder **outside this repository** (it is
gitignored here anyway). If you set `SECRET_KEY` in step 6, put the same
value in `"key"`:

```json
{
  "key": "",
  "device": "Curl test",
  "capturedAt": "2026-07-13T09:00:00Z",
  "format": "png",
  "image": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
}
```

Then run (Command Prompt or PowerShell — note it must be `curl.exe`, because
in PowerShell plain `curl` is an alias for something else):

```
curl.exe -L -H "Content-Type: application/json" --data "@payload.json" "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
```

The `-L` matters: Apps Script answers with a redirect first, and `-L` tells
curl to follow it to the real JSON response. Expected output:

```json
{"ok":true,"id":"<a uuid>","screenshot_url":"https://drive.google.com/thumbnail?id=<file id>&sz=w1600"}
```

You should also get the email, the Drive file, and the sheet row — same as
step 5. A health check is even simpler: open the `/exec` URL in a browser and
you should see `{"ok":true,"service":"scamguard","time":"..."}`.

This is exactly the request the parent PC's red-key script sends: a JSON
body with `key`, `device`, `capturedAt` (ISO date), `format` (`png` or
`jpg`), and `image` (base64 of the image bytes, without any `data:` prefix).

## Step 9 — Updating the code, and rotating the URL

**After editing `Code.gs`**: saving is not enough — the live URL keeps
serving the old code until you redeploy. (Changing the `SECRET_KEY` Script
Property needs no redeploy.)

1. **Deploy → Manage deployments**.
2. Click the pencil (**Edit**) on the active deployment.
3. Under **Version**, choose **New version**, then **Deploy**.

The URL stays the same, so the parent PC needs no change. Do **not** use
"New deployment" for routine updates — that mints a *different* URL.

**If the URL ever leaks** (or you just want a fresh one):

1. **Deploy → Manage deployments** → select the deployment → **Archive**
   (it stops serving immediately).
2. **Deploy → New deployment** → Web app → same settings as step 6.
3. Put the new `/exec` URL into the parent PC's `config.ini`.
4. While you are at it, change the `SECRET_KEY` Script Property and update
   `config.ini` to match.
5. If you set up the on-screen warning, paste the new URL and key into the
   dashboard's Settings → *Warning their PC* as well.

The dashboard's screenshot list is unaffected — it reads the published-CSV
link, which does not change.

---

## The way back: verdicts

Since 2026-08-10 `doPost` routes on an `action` field in the JSON body. A
body without one is a screenshot capture, so nothing above changes.

| `action` | Sent by | What happens |
|---|---|---|
| `verdict` | the dashboard, when you tap **Mark as scam** with the `/exec` URL saved in Settings → *Warning their PC* | Appends `id, screenshot_id, device, verdict, message, created_at` to a **Verdicts** tab (created on first use). `message` is the guidance sentence you saved for that screenshot. A *safe* verdict is never sent. |
| `poll` | `capture/check-verdicts.ps1` on the parent's PC, every `POLL_SECONDS` | Answers in plain text: line 1 `OK` (or `ERR reason`), then one `verdict\|iso\|message` line per new verdict for that device, oldest first. |

Both carry the same `key` check as captures. A PC that has never polled
before only sees verdicts from the last 10 minutes (`POLL_DEFAULT_WINDOW_MS`),
so a fresh install cannot replay a backlog of old warnings; after that the PC
keeps its own watermark and asks only for what is newer. The dashboard posts
with `Content-Type: text/plain` on purpose — Apps Script does not answer CORS
preflight requests, and a plain-text body keeps the browser from sending one.

Load: at the default 45 s a PC makes about 1 900 polls a day, each a short
read of the Verdicts tab. Lower `POLL_SECONDS` only with reason — every poll
spends a little of your account's free Apps Script allowance.

To test the whole return path without Google, `node scripts/mock-backend.mjs`
answers capture, verdict and poll on `http://localhost:8787/exec`.

---

## Configuration reference (top of Code.gs)

| Constant | Default | Meaning |
|---|---|---|
| `SECRET_KEY` | `""` | Leave empty. Set the key as a **Script Property** instead (step 6); the property wins when both exist. |
| `NOTIFY_EMAIL` | `""` | Notification recipient. Empty = the account that deployed the script. |
| `DASHBOARD_URL` | `""` | If set, the email includes this dashboard link. |
| `SHEET_NAME` | `"Screenshots"` | Tab that receives one row per capture. |
| `DRIVE_FOLDER_NAME` | `"ScamGuard Screenshots"` | Drive folder for the image files. |
| `MAX_IMAGE_BYTES` | `8388608` (8 MB) | Reject larger images. |
| `OCR_ENABLED` | `true` | Server-side OCR on/off. |
| `OCR_LANGUAGE` | `"en"` | OCR language hint. |
| `OCR_MAX_CHARS` | `6000` | Cap on stored OCR text length. |
| `VERDICTS_SHEET_NAME` | `"Verdicts"` | Tab that receives the caregiver's scam verdicts. |
| `POLL_DEFAULT_WINDOW_MS` | 10 minutes | How far back a PC with no watermark can see. |
| `POLL_MAX_ROWS` | `20` | Most verdicts returned by one poll. |
| `POLL_SCAN_ROWS` | `200` | How many recent Verdicts rows one poll scans. |

Script Properties the script uses (Project Settings → Script properties):

| Property | Who sets it | Meaning |
|---|---|---|
| `SECRET_KEY` | you (step 6) | The shared key every request must carry. Lives here, never in the code. |
| `SCAMGUARD_FOLDER_ID` | the script | Cached Drive folder id. Safe to delete; it is recreated. |
| `SPREADSHEET_ID` | you, only if standalone | Target spreadsheet id when the script is not bound to a sheet. |

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| No email arrives | It is in Spam, or the daily MailApp quota is used up (about 100 recipients/day on personal accounts), or `NOTIFY_EMAIL` has a typo | Check Spam; check **Executions** in the script editor for errors; wait a day if the quota is exhausted |
| Images show as broken in the dashboard | The file-sharing step failed — some Google Workspace domains forbid "anyone with the link" sharing | Open the file in Drive → Share → General access: **Anyone with the link, Viewer**. If your domain forbids it, use a personal Google account for ScamGuard |
| `ocr_text` is always empty | The advanced Drive service is not enabled, or `OCR_ENABLED` is `false` | Step 4: the **Services** list must show **Drive** (v2). Also genuine: screenshots with no readable text |
| `{"ok":false,"error":"Wrong or missing key."}` | The `SECRET_KEY` Script Property does not match the `key` the sender posts (`config.ini` on the PC, or Settings → *Warning their PC* in the dashboard) | Make the strings identical; no redeploy needed for a property change |
| "Mark as scam" toast says the relay refused it, or no warning reaches the PC | Wrong key or URL in the dashboard's Settings, or the PC is not polling | Check the key as above; on the PC side see the troubleshooting table in `capture/SETUP.md` |
| curl prints an HTML page saying "Moved Temporarily" | Missing `-L` flag | Add `-L` so curl follows the redirect |
| Response is a Google sign-in page | The deployment's "Who has access" is not **Anyone**, or you used a `/dev` URL instead of `/exec` | Redeploy with access **Anyone**; use the `/exec` URL |
| Code changes have no effect | Edited but never redeployed | Step 9: Manage deployments → Edit → New version |
| New captures do not appear in the dashboard | Published-CSV caching | Wait up to ~5 minutes, then refresh |
| Error "No spreadsheet available…" | Standalone script without `SPREADSHEET_ID` | See the note in step 2 |
