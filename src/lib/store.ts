import type { Review, Settings } from "./types";

/** All persistence is localStorage on the caregiver's own device — no server, no secrets. */

const REVIEWS_KEY = "scamguard.reviews.v1";
const SETTINGS_KEY = "scamguard.settings.v1";
const OCR_KEY = "scamguard.ocr.v1";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...(JSON.parse(raw) as T) } : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode / quota). The app still works, just without persistence.
  }
}

/* ---------- Reviews ---------- */

export function loadReviews(): Record<string, Review> {
  return read<Record<string, Review>>(REVIEWS_KEY, {});
}

export function saveReviews(reviews: Record<string, Review>): void {
  write(REVIEWS_KEY, reviews);
}

/* ---------- Settings ---------- */

const DEFAULT_SETTINGS: Settings = {
  source: "demo",
  sheetCsvUrl: (import.meta.env.VITE_SHEET_CSV_URL as string | undefined) ?? "",
  ocrEnabled: true,
};

export function loadSettings(): Settings {
  return read<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS);
}

export function saveSettings(settings: Settings): void {
  write(SETTINGS_KEY, settings);
}

/* ---------- OCR cache ---------- */

export function loadOcrCache(): Record<string, string> {
  return read<Record<string, string>>(OCR_KEY, {});
}

export function cacheOcrText(id: string, text: string): void {
  const cache = loadOcrCache();
  cache[id] = text;
  write(OCR_KEY, cache);
}

/* ---------- Export / import / reset ---------- */

interface ExportFile {
  app: "scamguard";
  version: 1;
  exportedAt: string;
  reviews: Record<string, Review>;
}

export function exportReviews(): string {
  const payload: ExportFile = {
    app: "scamguard",
    version: 1,
    exportedAt: new Date().toISOString(),
    reviews: loadReviews(),
  };
  return JSON.stringify(payload, null, 2);
}

/** Returns how many reviews were imported. Throws with a readable message on bad input. */
export function importReviews(json: string): number {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("That file is not valid JSON.");
  }
  const file = parsed as Partial<ExportFile>;
  if (file.app !== "scamguard" || typeof file.reviews !== "object" || file.reviews === null) {
    throw new Error("That file was not exported by ScamGuard.");
  }
  const merged = { ...loadReviews(), ...file.reviews };
  saveReviews(merged);
  return Object.keys(file.reviews).length;
}

export function clearAllLocalData(): void {
  try {
    localStorage.removeItem(REVIEWS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(OCR_KEY);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}
