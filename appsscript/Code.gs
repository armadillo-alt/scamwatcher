/**
 * ScamGuard capture endpoint
 * ==========================
 *
 * Google Apps Script (V8) web app that receives screenshots from the parent
 * PC's red-key script and fans them out inside the caregiver's own Google
 * account. No third-party services, no stored credentials:
 *
 *   Windows script --POST JSON--> this web app (runs as the caregiver)
 *                                   |-- saves the image to a Drive folder
 *                                   |-- OCRs it server-side (Drive API v2, optional)
 *                                   |-- appends a row to the "Screenshots" sheet
 *                                   |     (published as CSV; the dashboard reads it)
 *                                   `-- emails the caregiver (Android pings)
 *
 * The web app URL is the only credential-like value in the whole system.
 * It lives ONLY in the parent PC's config.ini. See SETUP.md for deployment.
 *
 * Request contract (POST body, JSON):
 *   {
 *     "key":        "same value as SECRET_KEY below (omit if SECRET_KEY is empty)",
 *     "device":     "Mum's PC",             // optional, default "Parent PC"
 *     "capturedAt": "2026-07-13T09:30:00Z", // optional; any parseable date; default now
 *     "format":     "png",                  // or "jpg" / "jpeg"; anything else means png
 *     "image":      "<base64 of the image bytes, no data: prefix>"
 *   }
 *
 * Response (always JSON, always HTTP 200 - Apps Script web apps cannot set
 * real status codes, so errors are signalled in the body):
 *   { "ok": true, "id": "...", "screenshot_url": "..." }
 *   { "ok": false, "error": "human-readable reason" }
 *
 * Sheet row contract (must match the dashboard - see src/lib/sources.ts and
 * src/pages/SettingsPage.tsx in the ScamGuard repo):
 *   id | screenshot_url | timestamp | parent_id | ocr_text
 */

// ============================== CONFIG =====================================
// Everything below is optional; the defaults work as-is. After editing,
// save and redeploy (Deploy -> Manage deployments -> Edit -> New version),
// otherwise the live web app keeps running the old code.

// Shared secret. If set, every request must carry the identical value in its
// "key" field or it is rejected.
//
// PUT THE KEY IN SCRIPT PROPERTIES, NOT HERE:
//   Project Settings -> Script properties -> Add script property
//   Property: SECRET_KEY     Value: <your long random string>
// Then paste the same string into the client PC's config.ini.
//
// Why: this file lives in a public git repository. A key typed on the line
// below WILL eventually be committed by accident (it happened twice during
// development). A Script Property is stored in your Google account only, and
// survives re-pasting this code. The constant below stays empty on purpose;
// it exists only as a fallback for throwaway setups.
const SECRET_KEY = "";

// Where the notification email goes. Leave empty to send it to the Google
// account that deployed this script (Session.getEffectiveUser()).
const NOTIFY_EMAIL = "";

// If set, the notification email ends with a link to the ScamGuard dashboard.
const DASHBOARD_URL = "";

// Name of the spreadsheet tab that receives one row per capture. The
// published-CSV link the dashboard uses must point at this tab.
const SHEET_NAME = "Screenshots";

// Name of the Drive folder that stores the screenshot image files.
const DRIVE_FOLDER_NAME = "ScamGuard Screenshots";

// Reject images larger than this many bytes (measured after base64 decoding).
// A lossless PNG of a 4K or multi-monitor desktop can be 10-25 MB; the capture
// script re-encodes big screens to JPEG, but keep the ceiling generous so a
// legitimate full-desktop capture is never silently dropped. (The base64 body
// is ~4/3 of this; 30 MB -> ~40 MB, within Apps Script's ~50 MB POST limit.)
const MAX_IMAGE_BYTES = 30 * 1024 * 1024; // 30 MB

// Server-side OCR via the advanced Drive service (Drive API v2). If the
// service is not enabled, or OCR fails for any reason, the capture still
// succeeds and ocr_text is stored empty - the dashboard can OCR in the
// browser instead (its opt-in Tesseract path).
const OCR_ENABLED = true;
const OCR_LANGUAGE = "en"; // ISO 639-1 language hint for the OCR engine
const OCR_MAX_CHARS = 6000; // cap stored OCR text at this many characters

// ============================ INTERNALS ====================================

// Column order the dashboard expects. parent_id holds the device name.
const SHEET_HEADER = ["id", "screenshot_url", "timestamp", "parent_id", "ocr_text"];

// The caregiver's decisions, sent back from the dashboard so the client PC can
// warn the person sitting at it. Append-only; the PC keeps its own watermark.
const VERDICTS_SHEET_NAME = "Verdicts";
const VERDICT_HEADER = ["id", "screenshot_id", "device", "verdict", "message", "created_at"];

// A PC that has never polled before only sees verdicts from the last few
// minutes, so a fresh install cannot replay a backlog of old warnings.
const POLL_DEFAULT_WINDOW_MS = 10 * 60 * 1000;
// Never return more than this many verdicts in one poll.
const POLL_MAX_ROWS = 20;
// How far back to scan the Verdicts sheet on each poll.
const POLL_SCAN_ROWS = 200;

// Script Properties keys (Project Settings -> Script properties).
const FOLDER_ID_PROPERTY = "SCAMGUARD_FOLDER_ID"; // cached folder id; safe to delete
const SPREADSHEET_ID_PROPERTY = "SPREADSHEET_ID"; // only read by standalone scripts

// Timezone for the human-readable time in the email.
// Keep in step with "timeZone" in appsscript.json.
const EMAIL_TIMEZONE = "Africa/Johannesburg";

// ============================ ENTRY POINTS ==================================

/**
 * Health check. Open the /exec URL in a browser and you should see
 * {"ok":true,"service":"scamguard","time":"..."}.
 */
function doGet(e) {
  return jsonOutput_({
    ok: true,
    service: "scamguard",
    time: new Date().toISOString(),
    // Reports WHETHER a key is required, never the key itself. Lets you verify
    // that a redeploy took effect without posting a junk row to the sheet.
    keyRequired: effectiveSecretKey_() !== ""
  });
}

/**
 * Receives one capture from the parent PC. Never throws a raw error at the
 * caller: every outcome is a JSON body with ok:true or ok:false.
 */
function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : "";
    let payload;
    try {
      payload = JSON.parse(raw || "{}");
    } catch (parseErr) {
      return jsonOutput_({ ok: false, error: "The request body must be valid JSON." });
    }
    if (!payload || typeof payload !== "object") {
      return jsonOutput_({ ok: false, error: "The request body must be a JSON object." });
    }

    // Three kinds of request share this one endpoint. Anything without an
    // "action" is a screenshot capture, so older clients keep working.
    const action = typeof payload.action === "string" ? payload.action : "capture";
    if (action === "poll") {
      // Plain text on purpose: the client PC parses this with a few lines of
      // string handling, no JSON library needed.
      return textOutput_(handlePoll_(payload));
    }
    if (action === "verdict") {
      return jsonOutput_(handleVerdict_(payload));
    }
    return jsonOutput_(handleCapture_(payload));
  } catch (err) {
    return jsonOutput_({ ok: false, error: String(err) });
  }
}

// ============================ CORE PIPELINE =================================

/**
 * The whole capture pipeline. Shared by doPost() and TEST_endToEnd() so the
 * editor test exercises exactly the code the web app runs.
 *
 * @param {Object} payload Parsed JSON body: { key, device, capturedAt, format, image }.
 * @return {Object} { ok: true, id, screenshot_url } or { ok: false, error }.
 */
function handleCapture_(payload) {
  // --- 1. Shared key (401-style refusal; the HTTP status is still 200) ---
  const secret = effectiveSecretKey_();
  if (secret) {
    if (typeof payload.key !== "string" || payload.key !== secret) {
      return { ok: false, error: "Wrong or missing key." };
    }
  }

  // --- 2. Device name: string, trimmed, capped at 60 characters ---
  let device = typeof payload.device === "string" ? payload.device : "";
  device = device.replace(/\s+/g, " ").trim();
  if (!device) device = "Parent PC";
  if (device.length > 60) device = device.slice(0, 60);

  // --- 3. Capture time: any parseable date, otherwise "now"; stored as ISO ---
  let captured = payload.capturedAt ? new Date(payload.capturedAt) : new Date();
  if (isNaN(captured.getTime())) captured = new Date();
  const capturedIso = captured.toISOString();

  // --- 4. Image: present, valid base64, within the size limit ---
  let imageBase64 = typeof payload.image === "string" ? payload.image : "";
  // Defensive: tolerate an accidental data-URI prefix and stray whitespace.
  imageBase64 = imageBase64.replace(/^data:[^,]*,/, "").replace(/\s/g, "");
  if (!imageBase64) {
    return { ok: false, error: "No image was included in the request." };
  }
  let bytes;
  try {
    bytes = Utilities.base64Decode(imageBase64);
  } catch (decodeErr) {
    return { ok: false, error: "The image could not be decoded as base64." };
  }
  if (!bytes || bytes.length === 0) {
    return { ok: false, error: "The image was empty after decoding." };
  }
  if (bytes.length > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      error: "The image is too large (" + bytes.length + " bytes; the limit is " + MAX_IMAGE_BYTES + ")."
    };
  }

  // --- 5. Build the blob (PNG unless the sender says jpg/jpeg) ---
  const format = typeof payload.format === "string" ? payload.format.trim().toLowerCase() : "png";
  const isJpeg = format === "jpg" || format === "jpeg";
  const contentType = isJpeg ? "image/jpeg" : "image/png";
  const extension = isJpeg ? "jpg" : "png";
  const fileName = "scamguard-" + capturedIso.replace(/[:.]/g, "-") + "." + extension;
  const blob = Utilities.newBlob(bytes, contentType, fileName);

  // --- 6. Save to Drive and make the file viewable by link ---
  const folder = getOrCreateFolder_();
  const file = folder.createFile(blob);
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (sharingErr) {
    // Some Google Workspace domains forbid link sharing. The capture still
    // succeeds, but the dashboard cannot display the image until sharing is
    // fixed by hand (see the troubleshooting table in SETUP.md).
  }
  const screenshotUrl = "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1600";

  // --- 7. OCR (best effort; "" on any failure) ---
  const ocrText = tryOcr_(blob);

  // --- 8. Append the row, serialised with a script lock ---
  const id = Utilities.getUuid();
  // device and ocrText both arrive from the outside world - neutralise formulas in both.
  const row = [id, screenshotUrl, capturedIso, sheetSafe_(device), sheetSafe_(ocrText)];
  const lock = LockService.getScriptLock();
  lock.waitLock(10 * 1000); // throws if another capture holds the lock > 10 s
  try {
    const sheet = getOrCreateSheet_();
    sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }

  // --- 9. Notify the caregiver (a mail failure must never fail the capture) ---
  sendNotification_(device, captured, ocrText, screenshotUrl);

  return { ok: true, id: id, screenshot_url: screenshotUrl };
}

// ====================== VERDICTS (the way back) =============================

/**
 * Records the caregiver's decision so the client PC can act on it.
 * Called by the dashboard when "Mark as scam" / "Mark safe" is tapped.
 *
 * @param {Object} payload { key, action:"verdict", id, device, verdict, message }
 * @return {Object} { ok: true, at } or { ok: false, error }
 */
function handleVerdict_(payload) {
  const secret = effectiveSecretKey_();
  if (secret) {
    if (typeof payload.key !== "string" || payload.key !== secret) {
      return { ok: false, error: "Wrong or missing key." };
    }
  }

  const verdict = String(payload.verdict || "").toLowerCase();
  if (verdict !== "scam" && verdict !== "safe") {
    return { ok: false, error: "verdict must be 'scam' or 'safe'." };
  }

  let device = typeof payload.device === "string" ? payload.device.replace(/\s+/g, " ").trim() : "";
  if (!device) {
    return { ok: false, error: "device is required so we know which PC to warn." };
  }
  if (device.length > 60) device = device.slice(0, 60);

  const screenshotId = typeof payload.id === "string" ? payload.id.slice(0, 80) : "";
  const message = pollSafeText_(payload.message);
  const createdAt = new Date().toISOString();

  const lock = LockService.getScriptLock();
  lock.waitLock(10 * 1000);
  try {
    const sheet = getOrCreateVerdictsSheet_();
    sheet.appendRow([
      Utilities.getUuid(),
      screenshotId,
      sheetSafe_(device),
      verdict,
      sheetSafe_(message),
      createdAt
    ]);
  } finally {
    lock.releaseLock();
  }
  return { ok: true, at: createdAt };
}

/**
 * Answers the client PC's "has anything been flagged for me?" poll.
 * Returns PLAIN TEXT, first line "OK" or "ERR <reason>", then one line per
 * verdict: verdict|iso8601|message  (oldest first).
 *
 * @param {Object} payload { key, action:"poll", device, since }
 * @return {string}
 */
function handlePoll_(payload) {
  const secret = effectiveSecretKey_();
  if (secret) {
    if (typeof payload.key !== "string" || payload.key !== secret) {
      return "ERR wrong or missing key";
    }
  }

  const device = typeof payload.device === "string" ? payload.device.replace(/\s+/g, " ").trim() : "";
  if (!device) return "ERR device is required";

  let sinceMs = 0;
  if (typeof payload.since === "string" && payload.since.trim()) {
    const parsed = new Date(payload.since.trim());
    if (!isNaN(parsed.getTime())) sinceMs = parsed.getTime();
  }
  if (!sinceMs) sinceMs = Date.now() - POLL_DEFAULT_WINDOW_MS;

  const sheet = getOrCreateVerdictsSheet_();
  const lastRow = sheet.getLastRow();
  const lines = ["OK"];
  if (lastRow > 1) {
    const firstRow = Math.max(2, lastRow - POLL_SCAN_ROWS + 1);
    const values = sheet.getRange(firstRow, 1, lastRow - firstRow + 1, VERDICT_HEADER.length).getValues();
    const matches = [];
    for (let i = 0; i < values.length; i++) {
      const row = values[i];
      // Sheets may hand back a Date for the timestamp column, and may keep the
      // leading apostrophe that sheetSafe_ added; normalise both.
      const rowDevice = String(row[2]).replace(/^'/, "");
      if (rowDevice !== device) continue;
      const rawAt = row[5];
      const atIso = (rawAt instanceof Date) ? rawAt.toISOString() : String(rawAt);
      const atMs = new Date(atIso).getTime();
      if (isNaN(atMs) || atMs <= sinceMs) continue;
      const rowVerdict = String(row[3]).toLowerCase();
      if (rowVerdict !== "scam" && rowVerdict !== "safe") continue;
      const rowMessage = pollSafeText_(String(row[4]).replace(/^'/, ""));
      matches.push(rowVerdict + "|" + atIso + "|" + rowMessage);
    }
    const recent = matches.slice(-POLL_MAX_ROWS);
    for (let i = 0; i < recent.length; i++) lines.push(recent[i]);
  }
  return lines.join("\n");
}

/**
 * Makes text safe for the one-line, pipe-delimited poll format: no pipes, no
 * newlines, collapsed whitespace, bounded length.
 */
function pollSafeText_(text) {
  return String(text == null ? "" : text)
    .replace(/[|\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 400);
}

// ============================== HELPERS =====================================

/**
 * The shared key actually in force: the SECRET_KEY Script Property if present,
 * otherwise the (normally empty) constant above. Keeping the real value in
 * Script Properties means it never has to appear in this file.
 */
function effectiveSecretKey_() {
  try {
    const fromProps = PropertiesService.getScriptProperties().getProperty("SECRET_KEY");
    if (fromProps) return String(fromProps).trim();
  } catch (propsErr) {
    // Properties unavailable for some reason; fall back to the constant.
  }
  return SECRET_KEY;
}

/** Wraps a plain object as a JSON HTTP response. */
function jsonOutput_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/** Plain-text HTTP response, used by the client PC's poll. */
function textOutput_(text) {
  return ContentService.createTextOutput(String(text)).setMimeType(
    ContentService.MimeType.TEXT
  );
}

/**
 * Sheets treats cell text that starts with =, +, -, @, or a tab/CR as a
 * formula or command. OCR text and device names arrive from the outside
 * world, so neutralise them with a leading apostrophe - Sheets' own "treat
 * this as text" marker, which is not stored as part of the value. Covers the
 * full OWASP CSV-injection prefix set (a leading "-" e.g. "-URGENT..." would
 * otherwise be read as a formula and show #NAME? instead of the scam text).
 */
function sheetSafe_(text) {
  return /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
}

/**
 * Returns the Drive folder that stores the screenshots, creating it on first
 * use. The folder id is cached in Script Properties; if the cached folder was
 * deleted or trashed, the cache is refreshed (reusing a same-named live
 * folder when one exists, so cleared properties do not spawn duplicates).
 */
function getOrCreateFolder_() {
  const props = PropertiesService.getScriptProperties();
  const cachedId = props.getProperty(FOLDER_ID_PROPERTY);
  if (cachedId) {
    try {
      const cached = DriveApp.getFolderById(cachedId);
      if (!cached.isTrashed()) return cached;
    } catch (gone) {
      // Deleted or inaccessible; fall through and find or create a new one.
    }
  }
  let folder = null;
  const existing = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  while (existing.hasNext()) {
    const candidate = existing.next();
    if (!candidate.isTrashed()) {
      folder = candidate;
      break;
    }
  }
  if (!folder) folder = DriveApp.createFolder(DRIVE_FOLDER_NAME);
  props.setProperty(FOLDER_ID_PROPERTY, folder.getId());
  return folder;
}

/**
 * Returns the sheet that receives capture rows, creating the tab and header
 * if needed.
 *
 * Normal path: this script is container-bound (created via Extensions ->
 * Apps Script inside the spreadsheet), so getActiveSpreadsheet() finds it.
 *
 * Standalone path: if the script was created at script.google.com instead,
 * there is no active spreadsheet. Add a Script Property named SPREADSHEET_ID
 * (Project Settings -> Script properties) holding the target spreadsheet's
 * id - the long string in its URL between /d/ and /edit.
 */
function getOrCreateSheet_() {
  return getOrCreateSheetNamed_(SHEET_NAME, SHEET_HEADER);
}

/** The "Verdicts" tab: what the caregiver decided, for the client PC to read. */
function getOrCreateVerdictsSheet_() {
  return getOrCreateSheetNamed_(VERDICTS_SHEET_NAME, VERDICT_HEADER);
}

/** The spreadsheet this script writes to (see the note on getOrCreateSheet_). */
function getSpreadsheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (spreadsheet) return spreadsheet;
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty(
    SPREADSHEET_ID_PROPERTY
  );
  if (!spreadsheetId) {
    throw new Error(
      "No spreadsheet available. Bind this script to a Google Sheet " +
        "(Extensions -> Apps Script) or add a Script Property named " +
        SPREADSHEET_ID_PROPERTY + " with the spreadsheet id."
    );
  }
  return SpreadsheetApp.openById(spreadsheetId);
}

/** Returns the named tab, creating it with its header row if needed. */
function getOrCreateSheetNamed_(name, header) {
  const spreadsheet = getSpreadsheet_();
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(header);
  return sheet;
}

/**
 * Best-effort server-side OCR. Inserts the image via the advanced Drive
 * service (Drive API v2) with ocr:true, which converts it into a temporary
 * Google Doc; reads the Doc's text; trashes the temporary Doc. Returns ""
 * on any failure, including when the advanced service is not enabled
 * (unenabled advanced services simply do not exist as globals, hence the
 * typeof check).
 */
function tryOcr_(imageBlob) {
  if (!OCR_ENABLED) return "";
  if (typeof Drive === "undefined") return ""; // advanced Drive service not enabled
  let tempDocId = null;
  try {
    const resource = {
      title: "scamguard-ocr-tmp",
      mimeType: "application/vnd.google-apps.document"
    };
    const tempDoc = Drive.Files.insert(resource, imageBlob, {
      ocr: true,
      ocrLanguage: OCR_LANGUAGE
    });
    tempDocId = tempDoc.id;
    let text = DocumentApp.openById(tempDocId).getBody().getText();
    text = (text || "").trim();
    if (text.length > OCR_MAX_CHARS) text = text.slice(0, OCR_MAX_CHARS);
    return text;
  } catch (ocrErr) {
    return "";
  } finally {
    if (tempDocId) {
      try {
        DriveApp.getFileById(tempDocId).setTrashed(true);
      } catch (cleanupErr) {
        // Leaving a stray "scamguard-ocr-tmp" doc behind is untidy but harmless.
      }
    }
  }
}

/**
 * Emails the caregiver about a capture. Wrapped in try/catch because a mail
 * failure (quota, bad address) must never fail the capture itself.
 */
function sendNotification_(device, capturedDate, ocrText, screenshotUrl) {
  try {
    const recipient = NOTIFY_EMAIL || Session.getEffectiveUser().getEmail();
    if (!recipient) return;
    const subject = `ScamGuard: ${device} pressed the red key`;
    const timeText = Utilities.formatDate(
      capturedDate,
      EMAIL_TIMEZONE,
      "EEEE d MMMM yyyy 'at' HH:mm"
    );
    const excerpt = ocrText
      ? ocrText.slice(0, 300)
      : "The text could not be read automatically.";
    const lines = [
      device + " pressed the red key.",
      "",
      "When: " + timeText + " (South Africa time)",
      "Device: " + device,
      "",
      "What the screen said (first part):",
      excerpt,
      "",
      "Screenshot: " + screenshotUrl
    ];
    if (DASHBOARD_URL) {
      lines.push("", "Open the dashboard: " + DASHBOARD_URL);
    }
    MailApp.sendEmail(recipient, subject, lines.join("\n"));
  } catch (mailErr) {
    // Swallowed on purpose: the row and the file already exist, which is
    // what matters. Mail problems surface in the Executions log.
  }
}

// ================================ TEST ======================================

/**
 * A valid 70-byte 1x1 transparent PNG (verified: correct PNG signature and
 * decodes as a 1x1 RGBA image). Used by TEST_endToEnd.
 */
const TEST_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

/**
 * Run this once from the editor to prove the whole pipeline end to end.
 *
 * NOTE: this is a REAL run, not a dry run. It will:
 *   - create a file in the "ScamGuard Screenshots" Drive folder,
 *   - append a row to the "Screenshots" sheet, and
 *   - send a real notification email.
 * Delete the test row and file afterwards if you want a clean slate.
 *
 * The test image is a blank 1x1 pixel, so ocr_text will be empty - that is
 * expected, not a failure. Check the execution log for the result, the
 * appended row, and the screenshot URL.
 */
function TEST_endToEnd() {
  const result = handleCapture_({
    key: effectiveSecretKey_(), // always matches the key actually in force
    device: "Editor test",
    capturedAt: new Date().toISOString(),
    format: "png",
    image: TEST_PNG_BASE64
  });
  Logger.log("Result: " + JSON.stringify(result));
  if (result.ok) {
    const sheet = getOrCreateSheet_();
    const lastRow = sheet
      .getRange(sheet.getLastRow(), 1, 1, SHEET_HEADER.length)
      .getValues()[0];
    Logger.log('Row appended to "' + SHEET_NAME + '": ' + JSON.stringify(lastRow));
    Logger.log("Screenshot URL: " + result.screenshot_url);
  } else {
    Logger.log("Capture failed: " + result.error);
  }
}
