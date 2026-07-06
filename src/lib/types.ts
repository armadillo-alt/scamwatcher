/** Core domain types. DESIGN.md §5 is the source of truth for how these fit together. */

export type RiskLevel = "high" | "medium" | "low";
export type Verdict = "safe" | "scam";

/** A row from a data source (published Google Sheet CSV or the bundled demo), pre-analysis. */
export interface ScreenshotRow {
  id: string;
  /** Image URL. May be an https URL or a data: URI (demo). */
  screenshotUrl: string;
  /** ISO 8601. */
  timestamp: string;
  /** Human label of the monitored device, e.g. "Mom's PC". */
  device: string;
  /** Text already extracted by the source; when present, client OCR is skipped. */
  ocrText?: string;
}

/** One matched signal — every match must be explainable to a non-technical caregiver. */
export interface SignalMatch {
  categoryId: string;
  categoryLabel: string;
  /** The phrase as matched in the text. */
  phrase: string;
  /** Points this match contributed. */
  weight: number;
  /** Plain language; names the manipulation, not the technology. */
  explanation: string;
}

export interface Analysis {
  /** 0–100, capped. */
  score: number;
  /** score ≥ 45 → high, ≥ 20 → medium, else low. Keep in sync with engine/analyze.ts. */
  level: RiskLevel;
  /** Sorted by weight, descending. */
  matches: SignalMatch[];
  /** One calm sentence for the card/detail header, e.g. "Pretends to be your bank and pressures you to act immediately." */
  summary: string;
}

/** The caregiver's decision about one screenshot. Stored locally, never in the sheet. */
export interface Review {
  /** Absent while a note/guidance exists but no decision has been made yet. */
  verdict?: Verdict;
  /** Private note to self. */
  note?: string;
  /** Message intended for the parent. */
  guidance?: string;
  /** ISO 8601 — last time any part of this review changed. */
  reviewedAt: string;
}

/** Fully hydrated item as the UI renders it. */
export interface ScreenshotItem extends ScreenshotRow {
  /** null until text is available and analyzed. */
  analysis: Analysis | null;
  /** null = still needs review. */
  review: Review | null;
}

export type SourceKind = "demo" | "sheet";

export interface Settings {
  source: SourceKind;
  /** Published-to-web CSV URL of the Google Sheet (no credentials involved). */
  sheetCsvUrl: string;
  /** Run Tesseract.js on rows that arrive without ocr_text. */
  ocrEnabled: boolean;
}
