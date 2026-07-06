import { useCallback, useEffect, useMemo, useState } from "react";
import { DetailPanel } from "../components/DetailPanel";
import { EmptyState } from "../components/EmptyState";
import { FilterTabs } from "../components/FilterTabs";
import { ScreenshotCard } from "../components/ScreenshotCard";
import { StatusBanner } from "../components/StatusBanner";
import { useScreenshots } from "../hooks/useScreenshots";
import { loadSettings, saveSettings } from "../lib/store";
import type { Verdict } from "../lib/types";

export default function Dashboard() {
  const shots = useScreenshots();
  const {
    items,
    filtered,
    filters,
    setFilters,
    metrics,
    loading,
    sourceError,
    setVerdict,
    reopen,
    saveNote,
    saveGuidance,
    refresh,
  } = shots;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelId, setPanelId] = useState<string | null>(null);

  const panelItem = useMemo(
    () => items.find((i) => i.id === panelId) ?? null,
    [items, panelId],
  );

  // Keep the keyboard selection pointing at something visible.
  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!filtered.some((i) => i.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  /** The item to land on after a verdict removes `id` from a triage list. */
  const nextAfter = useCallback(
    (id: string): string | null => {
      const idx = filtered.findIndex((i) => i.id === id);
      if (idx === -1) return filtered[0]?.id ?? null;
      return filtered[idx + 1]?.id ?? filtered[idx - 1]?.id ?? null;
    },
    [filtered],
  );

  const verdictAndAdvance = useCallback(
    (id: string, verdict: Verdict, fromPanel: boolean) => {
      const nextId = nextAfter(id);
      setVerdict(id, verdict);
      setSelectedId(nextId);
      if (fromPanel) setPanelId(nextId);
    },
    [nextAfter, setVerdict],
  );

  // Keyboard triage: j/k move · enter open · s safe · x scam · esc close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (
        t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.tagName === "SELECT" ||
        t.isContentEditable
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // When a button or link has focus, let its own Enter/Space activation win — otherwise
      // Tab+Enter on "Mark safe" or a filter tab would also fire a global shortcut.
      const onControl = t.closest("button, a, [role='button']") !== null;

      const move = (delta: number) => {
        if (filtered.length === 0) return;
        const idx = filtered.findIndex((i) => i.id === selectedId);
        const next = filtered[Math.min(filtered.length - 1, Math.max(0, idx + delta))];
        if (!next) return;
        setSelectedId(next.id);
        if (panelId) setPanelId(next.id);
        document
          .querySelector(`[data-shot-id="${CSS.escape(next.id)}"]`)
          ?.scrollIntoView({ block: "nearest" });
      };

      const act = (verdict: Verdict) => {
        const targetId = panelId ?? selectedId;
        if (!targetId) return;
        const target = items.find((i) => i.id === targetId);
        if (!target || target.review?.verdict) return;
        verdictAndAdvance(targetId, verdict, panelId !== null);
      };

      switch (e.key) {
        case "j":
          move(1);
          break;
        case "k":
          move(-1);
          break;
        case "Enter":
          if (!onControl && selectedId && !panelId) setPanelId(selectedId);
          break;
        case "Escape":
          setPanelId(null);
          break;
        case "s":
          if (!onControl) act("safe");
          break;
        case "x":
          if (!onControl) act("scam");
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered, items, selectedId, panelId, verdictAndAdvance]);

  const switchToDemo = () => {
    saveSettings({ ...loadSettings(), source: "demo" });
    location.reload();
  };

  return (
    <>
      <h1 className="visually-hidden">Review screenshots</h1>
      <StatusBanner shots={shots} />
      <FilterTabs
        filters={filters}
        setFilters={setFilters}
        counts={{
          needs: metrics.needsReview,
          scam: metrics.scams,
          safe: metrics.safe,
          all: metrics.total,
        }}
        onRefresh={refresh}
      />

      {sourceError ? (
        <EmptyState title="Couldn’t load screenshots">
          <p>{sourceError}</p>
          <div className="btn-row">
            <button className="btn btn-quiet" onClick={switchToDemo}>
              Use demo data instead
            </button>
          </div>
        </EmptyState>
      ) : loading ? (
        <EmptyState title="Fetching screenshots…" />
      ) : filtered.length === 0 ? (
        filters.status === "needs" && filters.risk === "all" ? (
          <EmptyState title="All caught up">
            <p>
              Every screenshot has been reviewed. Your decisions are under the Scams and Safe
              tabs.
            </p>
          </EmptyState>
        ) : (
          <EmptyState title="Nothing here">
            <p>No screenshots match these filters.</p>
          </EmptyState>
        )
      ) : (
        <div className="card-grid">
          {filtered.map((item, index) => (
            <ScreenshotCard
              key={item.id}
              item={item}
              index={index}
              selected={item.id === selectedId}
              ocrEnabled={shots.settings.ocrEnabled}
              onOpen={() => {
                setSelectedId(item.id);
                setPanelId(item.id);
              }}
              onVerdict={(v) => verdictAndAdvance(item.id, v, false)}
              onReopen={() => reopen(item.id)}
            />
          ))}
        </div>
      )}

      <p className="kbd-hints">
        <span>
          <span className="kbd">J</span> <span className="kbd">K</span> move
        </span>
        <span>
          <span className="kbd">Enter</span> open
        </span>
        <span>
          <span className="kbd">S</span> mark safe
        </span>
        <span>
          <span className="kbd">X</span> mark as scam
        </span>
        <span>
          <span className="kbd">Esc</span> close
        </span>
      </p>

      {panelItem && (
        <DetailPanel
          item={panelItem}
          onClose={() => setPanelId(null)}
          onVerdict={(v) => verdictAndAdvance(panelItem.id, v, true)}
          onReopen={() => reopen(panelItem.id)}
          onSaveNote={(note) => saveNote(panelItem.id, note)}
          onSaveGuidance={(g) => saveGuidance(panelItem.id, g)}
        />
      )}
    </>
  );
}
