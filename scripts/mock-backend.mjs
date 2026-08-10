/*
 * Local stand-in for the Apps Script backend (appsscript/Code.gs), used to test the
 * whole pipeline without touching Google:
 *
 *   capture-and-send.ps1  →  POST /exec        (same JSON contract as the real doPost)
 *   dashboard             →  GET  /sheet.csv    (same columns as the published sheet)
 *                            GET  /images/<id>.png
 *
 * Run:  node scripts/mock-backend.mjs   (port 8787, state in .mock-data/, gitignored)
 * Because this mock cannot OCR, it stamps a canned scam text into ocr_text — the point
 * is to exercise transport, CSV shape, and the dashboard, not recognition.
 */
import { createServer } from "node:http";
import { mkdirSync, readFileSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const PORT = 8787;
const ROOT = fileURLToPath(new URL("../.mock-data/", import.meta.url));
const IMAGES = ROOT + "images/";
const SHEET = ROOT + "sheet.csv";
const HEADER = "id,screenshot_url,timestamp,parent_id,ocr_text\n";

const CANNED_OCR =
  "SECURITY WARNING. Your computer has been infected. Call this number immediately " +
  "0800 555 0199. Do not shut down your computer. Verify your banking details within 24 hours.";

mkdirSync(IMAGES, { recursive: true });
if (!existsSync(SHEET)) writeFileSync(SHEET, HEADER);

/** In-memory stand-in for the Apps Script "Verdicts" sheet. */
const verdicts = [];

const csvEscape = (s) => `"${String(s).replaceAll('"', '""')}"`;

const json = (res, code, obj) => {
  res.writeHead(code, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(obj));
};

createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === "GET" && url.pathname === "/exec") {
    return json(res, 200, { ok: true, service: "scamguard-mock", time: new Date().toISOString() });
  }

  if (req.method === "GET" && url.pathname === "/sheet.csv") {
    res.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    });
    return res.end(readFileSync(SHEET));
  }

  if (req.method === "GET" && url.pathname.startsWith("/images/")) {
    const name = url.pathname.slice("/images/".length);
    if (!/^[\w-]+\.png$/.test(name) || !existsSync(IMAGES + name)) {
      res.writeHead(404, { "Access-Control-Allow-Origin": "*" });
      return res.end("not found");
    }
    res.writeHead(200, { "Content-Type": "image/png", "Access-Control-Allow-Origin": "*" });
    return res.end(readFileSync(IMAGES + name));
  }

  if (req.method === "POST" && url.pathname === "/exec") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        const p = JSON.parse(body);

        // --- the way back: caregiver verdict, and the PC's poll for it ---
        if (p.action === "verdict") {
          const at = new Date().toISOString();
          const msg = String(p.message ?? "").replace(/[|\r\n\t]+/g, " ").trim().slice(0, 400);
          verdicts.push({ device: String(p.device ?? ""), verdict: String(p.verdict ?? ""), at, message: msg });
          console.log(`[mock] verdict ${p.verdict} for ${p.device}: "${msg}"`);
          return json(res, 200, { ok: true, at });
        }
        if (p.action === "poll") {
          const sinceMs = Date.parse(p.since ?? "") || Date.now() - 10 * 60 * 1000;
          const lines = ["OK"];
          for (const v of verdicts) {
            if (v.device !== p.device) continue;
            if (Date.parse(v.at) <= sinceMs) continue;
            lines.push(`${v.verdict}|${v.at}|${v.message}`);
          }
          res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" });
          return res.end(lines.join("\n"));
        }

        if (typeof p.image !== "string" || p.image.length === 0) {
          return json(res, 200, { ok: false, error: "image missing" });
        }
        const bytes = Buffer.from(p.image, "base64");
        if (bytes.length < 8) return json(res, 200, { ok: false, error: "image not decodable" });
        const id = randomUUID();
        writeFileSync(IMAGES + id + ".png", bytes);
        const device = String(p.device || "Parent PC").slice(0, 60);
        const ts = Number.isNaN(Date.parse(p.capturedAt)) ? new Date().toISOString() : p.capturedAt;
        const rowUrl = `http://localhost:${PORT}/images/${id}.png`;
        appendFileSync(
          SHEET,
          [id, rowUrl, ts, device, CANNED_OCR].map(csvEscape).join(",") + "\n",
        );
        console.log(`[mock] capture from ${device}: ${bytes.length} bytes -> ${id}.png`);
        return json(res, 200, { ok: true, id, screenshot_url: rowUrl });
      } catch (e) {
        return json(res, 200, { ok: false, error: String(e) });
      }
    });
    return;
  }

  res.writeHead(404, { "Access-Control-Allow-Origin": "*" });
  res.end("not found");
}).listen(PORT, () => console.log(`[mock] Apps Script stand-in on http://localhost:${PORT}`));
