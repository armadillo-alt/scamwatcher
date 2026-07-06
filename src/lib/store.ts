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

const UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/** Accepts only well-formed review entries; anything else is silently dropped. */
function sanitizeReview(value: unknown): Review | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  const verdict = v.verdict === "safe" || v.verdict === "scam" ? v.verdict : undefined;
  const note = typeof v.note === "string" ? v.note : undefined;
  const guidance = typeof v.guidance === "string" ? v.guidance : undefined;
  if (verdict === undefined && note === undefined && guidance === undefined) return null;
  const reviewedAt =
    typeof v.reviewedAt === "string" ? v.reviewedAt : new Date().toISOString();
  return { verdict, note, guidance, reviewedAt };
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
  const merged = loadReviews();
  let count = 0;
  for (const [id, raw] of Object.entries(file.reviews)) {
    if (UNSAFE_KEYS.has(id)) continue;
    const review = sanitizeReview(raw);
    if (review) {
      merged[id] = review;
      count += 1;
    }
  }
  if (count === 0) {
    throw new Error("That file contained no usable reviews.");
  }
  saveReviews(merged);
  return count;
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
