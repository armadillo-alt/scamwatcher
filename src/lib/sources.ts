import Papa from "papaparse";
import { DEMO_ROWS } from "./demoData";
import type { ScreenshotRow, Settings } from "./types";

/** djb2 over the row's content; falls back to position only for entirely empty rows. */
function stableId(seed: string, index: number): string {
  if (!seed) return `row-${index + 1}`;
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h + seed.charCodeAt(i)) >>> 0;
  }
  return `r-${h.toString(36)}`;
}

/**
 * Data sources. "demo" is the bundled dataset; "sheet" is a Google Sheet published
 * to the web as CSV (a public link — no credentials anywhere in this app).
 * Column names accept both the legacy sheet (screenshot_url, parent_id, ocr_text)
 * and camelCase variants.
 */
export async function fetchRows(settings: Settings): Promise<ScreenshotRow[]> {
  if (settings.source === "demo") return DEMO_ROWS;

  const url = settings.sheetCsvUrl.trim();
  if (!url) {
    throw new Error("No sheet link is set. Add one in Settings, or switch to demo data.");
  }

  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new Error("Could not reach the sheet. Check your connection and the link in Settings.");
  }
  if (!res.ok) {
    throw new Error(
      `The sheet link answered with status ${res.status}. Re-publish the sheet as CSV and update Settings.`,
    );
  }

  const csv = await res.text();
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  const rows = parsed.data
    .map((r, i): ScreenshotRow => {
      const pick = (...keys: string[]): string => {
        for (const k of keys) {
          const v = r[k];
          if (typeof v === "string" && v.trim()) return v.trim();
        }
        return "";
      };
      const screenshotUrl = pick("screenshot_url", "screenshotUrl", "image", "url");
      const ocrText = pick("ocr_text", "ocrText");
      return {
        // Reviews are keyed by id, so ids must survive sheet re-ordering: when the sheet
        // has no id column, derive one from the row's own content, not its position.
        id: pick("id") || stableId(screenshotUrl || ocrText, i),
        screenshotUrl,
        // Leave blank when the sheet has no time — the UI shows "Unknown time" rather than
        // fabricating "now", which would wrongly inflate the this-week and last-arrival metrics.
        timestamp: pick("timestamp", "createdTime"),
        device: pick("parent_id", "device", "parent") || "Unknown device",
        ocrText: ocrText || undefined,
      };
    })
    .filter((r) => r.screenshotUrl !== "" || r.ocrText !== undefined);

  if (rows.length === 0) {
    throw new Error(
      "The sheet was reached but had no usable rows. It needs at least a screenshot_url or ocr_text column.",
    );
  }
  return rows;
}
