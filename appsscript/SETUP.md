# ScamGuard backend setup (Google Apps Script)

This folder is the whole "backend": one Apps Script web app running inside
your own Google account. There is no server to rent, nothing to install on
your machine, and **no credentials anywhere** — the deployed web app URL is
the only secret-like value, and it lives only in the parent PC's `config.ini`.

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
```

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

- paste it **only** into the parent PC's `config.ini` — nowhere else;
- never commit it to a repository, never post it in a chat or screenshot;
- set `SECRET_KEY` in `Code.gs` to a long random string and put the same
  string in `config.ini` — then a leaked URL alone is not enough (see
  step 9 for rotating the URL if it ever does leak).

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

Save this as `payload.json` (any folder). If you set `SECRET_KEY` in step 6,
put the same value in `"key"`:

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

**After editing `Code.gs`** (for example to set `SECRET_KEY`): saving is not
enough — the live URL keeps serving the old code until you redeploy.

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
4. While you are at it, change `SECRET_KEY` and redeploy.

The dashboard is unaffected — it only knows the published-CSV link, never
the web app URL.

---

## Configuration reference (top of Code.gs)

| Constant | Default | Meaning |
|---|---|---|
| `SECRET_KEY` | `""` | If non-empty, requests must send the same value as `"key"`. Recommended. |
| `NOTIFY_EMAIL` | `""` | Notification recipient. Empty = the account that deployed the script. |
| `DASHBOARD_URL` | `""` | If set, the email includes this dashboard link. |
| `SHEET_NAME` | `"Screenshots"` | Tab that receives one row per capture. |
| `DRIVE_FOLDER_NAME` | `"ScamGuard Screenshots"` | Drive folder for the image files. |
| `MAX_IMAGE_BYTES` | `8388608` (8 MB) | Reject larger images. |
| `OCR_ENABLED` | `true` | Server-side OCR on/off. |
| `OCR_LANGUAGE` | `"en"` | OCR language hint. |
| `OCR_MAX_CHARS` | `6000` | Cap on stored OCR text length. |

Script Properties the script uses (Project Settings → Script properties):

| Property | Who sets it | Meaning |
|---|---|---|
| `SCAMGUARD_FOLDER_ID` | the script | Cached Drive folder id. Safe to delete; it is recreated. |
| `SPREADSHEET_ID` | you, only if standalone | Target spreadsheet id when the script is not bound to a sheet. |

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| No email arrives | It is in Spam, or the daily MailApp quota is used up (about 100 recipients/day on personal accounts), or `NOTIFY_EMAIL` has a typo | Check Spam; check **Executions** in the script editor for errors; wait a day if the quota is exhausted |
| Images show as broken in the dashboard | The file-sharing step failed — some Google Workspace domains forbid "anyone with the link" sharing | Open the file in Drive → Share → General access: **Anyone with the link, Viewer**. If your domain forbids it, use a personal Google account for ScamGuard |
| `ocr_text` is always empty | The advanced Drive service is not enabled, or `OCR_ENABLED` is `false` | Step 4: the **Services** list must show **Drive** (v2). Also genuine: screenshots with no readable text |
| `{"ok":false,"error":"Wrong or missing key."}` | `SECRET_KEY` in Code.gs does not match the `key` the sender posts | Make both strings identical, then redeploy (step 9) |
| curl prints an HTML page saying "Moved Temporarily" | Missing `-L` flag | Add `-L` so curl follows the redirect |
| Response is a Google sign-in page | The deployment's "Who has access" is not **Anyone**, or you used a `/dev` URL instead of `/exec` | Redeploy with access **Anyone**; use the `/exec` URL |
| Code changes have no effect | Edited but never redeployed | Step 9: Manage deployments → Edit → New version |
| New captures do not appear in the dashboard | Published-CSV caching | Wait up to ~5 minutes, then refresh |
| Error "No spreadsheet available…" | Standalone script without `SPREADSHEET_ID` | See the note in step 2 |
