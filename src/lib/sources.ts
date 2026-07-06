import Papa from "papaparse";
import { DEMO_ROWS } from "./demoData";
import type { ScreenshotRow, Settings } from "./types";

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
      return {
        id: pick("id") || `row-${i + 1}`,
        screenshotUrl: pick("screenshot_url", "screenshotUrl", "image", "url"),
        timestamp: pick("timestamp", "createdTime") || new Date().toISOString(),
        device: pick("parent_id", "device", "parent") || "Unknown device",
        ocrText: pick("ocr_text", "ocrText") || undefined,
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
