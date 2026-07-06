import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "../components/Toast";
import { analyzeText } from "../lib/engine/analyze";
import { extractText, getCachedText } from "../lib/ocr";
import { fetchRows } from "../lib/sources";
import { loadReviews, loadSettings, saveReviews } from "../lib/store";
import type {
  Review,
  RiskLevel,
  ScreenshotItem,
  ScreenshotRow,
  Verdict,
} from "../lib/types";

export type StatusFilter = "needs" | "scam" | "safe" | "all";

export interface Filters {
  status: StatusFilter;
  risk: RiskLevel | "all";
  sort: "newest" | "oldest";
}

/**
 * The one orchestrator (DESIGN.md §5): fetch rows from the configured source,
 * OCR rows that arrived without text (lazy, sequential, cached), analyze locally,
 * merge with locally-stored reviews, expose triage state and actions.
 */
export function useScreenshots() {
  const settings = useMemo(loadSettings, []);
  const [rows, setRows] = useState<ScreenshotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Record<string, Review>>(loadReviews);
  const [ocrTexts, setOcrTexts] = useState<Record<string, string>>({});
  const [ocrBusy, setOcrBusy] = useState(0);
  const [reloadNonce, setReloadNonce] = useState(0);
  const ocrAttempted = useRef(new Set<string>());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchRows(settings)
      .then((r) => {
        if (cancelled) return;
        setRows(r);
        setSourceError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setRows([]);
        setSourceError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [settings, reloadNonce]);

  useEffect(() => {
    if (!settings.ocrEnabled) return;
    const pending = rows.filter(
      (r) =>
        !r.ocrText &&
        r.screenshotUrl &&
        getCachedText(r.id) === undefined &&
        !ocrAttempted.current.has(r.id),
    );
    if (pending.length === 0) return;
    for (const r of pending) ocrAttempted.current.add(r.id);

    let cancelled = false;
    setOcrBusy((n) => n + pending.length);
    (async () => {
      for (const row of pending) {
        if (cancelled) return;
        try {
          const text = await extractText(row.id, row.screenshotUrl);
          if (!cancelled) setOcrTexts((prev) => ({ ...prev, [row.id]: text }));
        } catch {
          // Mark as attempted-but-unreadable; the UI shows "couldn't read this image".
          if (!cancelled) setOcrTexts((prev) => ({ ...prev, [row.id]: "" }));
        } finally {
          if (!cancelled) setOcrBusy((n) => Math.max(0, n - 1));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rows, settings.ocrEnabled]);

  const items: ScreenshotItem[] = useMemo(
    () =>
      rows.map((r) => {
        // "" means OCR was attempted and found nothing — distinct from undefined (not read yet).
        const text = r.ocrText ?? ocrTexts[r.id] ?? getCachedText(r.id);
        return {
          ...r,
          ocrText: text,
          analysis: text ? analyzeText(text) : null,
          review: reviews[r.id] ?? null,
        };
      }),
    [rows, ocrTexts, reviews],
  );

  /* ---------- Actions ---------- */

  const applyReview = useCallback((id: string, patch: Partial<Review>) => {
    setReviews((prev) => {
      const next: Record<string, Review> = {
        ...prev,
        [id]: { ...prev[id], ...patch, reviewedAt: new Date().toISOString() },
      };
      saveReviews(next);
      return next;
    });
  }, []);

  const setVerdict = useCallback(
    (id: string, verdict: Verdict) => {
      applyReview(id, { verdict });
      toast(verdict === "safe" ? "Marked safe" : "Marked as scam");
    },
    [applyReview],
  );

  const reopen = useCallback(
    (id: string) => {
      applyReview(id, { verdict: undefined });
      toast("Reopened for review");
    },
    [applyReview],
  );

  const saveNote = useCallback(
    (id: string, note: string) => {
      applyReview(id, { note: note.trim() || undefined });
      toast("Note saved");
    },
    [applyReview],
  );

  const saveGuidance = useCallback(
    (id: string, guidance: string) => {
      applyReview(id, { guidance: guidance.trim() || undefined });
      toast("Guidance saved");
    },
    [applyReview],
  );

  const refresh = useCallback(() => setReloadNonce((n) => n + 1), []);

  /* ---------- Derived ---------- */

  const metrics = useMemo(() => {
    const needs = items.filter((i) => !i.review?.verdict);
    const weekAgo = Date.now() - 7 * 86_400_000;
    return {
      total: items.length,
      needsReview: needs.length,
      dangerous: needs.filter((i) => i.analysis?.level === "high").length,
      thisWeek: items.filter((i) => new Date(i.timestamp).getTime() >= weekAgo).length,
      scams: items.filter((i) => i.review?.verdict === "scam").length,
      safe: items.filter((i) => i.review?.verdict === "safe").length,
      lastArrival:
        items.length > 0
          ? items.reduce(
              (max, i) => (i.timestamp > max ? i.timestamp : max),
              items[0].timestamp,
            )
          : null,
    };
  }, [items]);

  const [filters, setFilters] = useState<Filters>({
    status: "needs",
    risk: "all",
    sort: "newest",
  });

  const filtered = useMemo(() => {
    let out = items;
    if (filters.status === "needs") out = out.filter((i) => !i.review?.verdict);
    if (filters.status === "scam") out = out.filter((i) => i.review?.verdict === "scam");
    if (filters.status === "safe") out = out.filter((i) => i.review?.verdict === "safe");
    if (filters.risk !== "all") {
      out = out.filter((i) => (i.analysis?.level ?? "low") === filters.risk);
    }
    return [...out].sort((a, b) =>
      filters.sort === "newest"
        ? b.timestamp.localeCompare(a.timestamp)
        : a.timestamp.localeCompare(b.timestamp),
    );
  }, [items, filters]);

  return {
    settings,
    items,
    filtered,
    filters,
    setFilters,
    metrics,
    loading,
    ocrBusy,
    sourceError,
    setVerdict,
    reopen,
    saveNote,
    saveGuidance,
    refresh,
  };
}
