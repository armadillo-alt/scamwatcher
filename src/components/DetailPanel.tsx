import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { formatWhen } from "../lib/format";
import type { ScreenshotItem, Verdict } from "../lib/types";
import { RiskChip, VerdictStamp } from "./Badges";

/** Signals at or above this weight get the tinted "grave" treatment. */
const GRAVE_WEIGHT = 16;

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

export function DetailPanel({
  item,
  onClose,
  onVerdict,
  onReopen,
  onSaveNote,
  onSaveGuidance,
}: {
  item: ScreenshotItem;
  onClose: () => void;
  onVerdict: (verdict: Verdict) => void;
  onReopen: () => void;
  onSaveNote: (note: string) => void;
  onSaveGuidance: (guidance: string) => void;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Remember what had focus so we can restore it when the dialog closes.
  useEffect(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => {
      returnFocusRef.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    panelRef.current?.focus();
  }, [item.id]);

  // Trap Tab within the panel; Escape closes. aria-modal promises the outside is inert,
  // so focus must not be allowed to leave.
  const onKeyDown = (e: ReactKeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab" || !panelRef.current) return;
    const nodes = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (nodes.length === 0) {
      e.preventDefault();
      panelRef.current.focus();
      return;
    }
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === panelRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <div className="detail-overlay" onClick={onClose} aria-hidden="true" />
      <aside
        className="detail-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Screenshot from ${item.device}`}
        ref={panelRef}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <header className="detail-head">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <RiskChip analysis={item.analysis} />
            {item.review?.verdict && <VerdictStamp verdict={item.review.verdict} />}
          </div>
          <button className="btn btn-quiet btn-sm" onClick={onClose} aria-label="Close details">
            Close
          </button>
        </header>

        <DetailBody
          key={item.id}
          item={item}
          onSaveNote={onSaveNote}
          onSaveGuidance={onSaveGuidance}
        />

        <footer className="detail-foot">
          {item.review?.verdict ? (
            <button className="btn btn-quiet" onClick={onReopen}>
              Reopen
            </button>
          ) : (
            <>
              <button className="btn btn-safe" onClick={() => onVerdict("safe")}>
                Mark safe
              </button>
              <button className="btn btn-danger" onClick={() => onVerdict("scam")}>
                Mark as scam
              </button>
            </>
          )}
        </footer>
      </aside>
    </>
  );
}

function DetailBody({
  item,
  onSaveNote,
  onSaveGuidance,
}: {
  item: ScreenshotItem;
  onSaveNote: (note: string) => void;
  onSaveGuidance: (guidance: string) => void;
}) {
  const [note, setNote] = useState(item.review?.note ?? "");
  const [guidance, setGuidance] = useState(item.review?.guidance ?? "");
  const [imgFailed, setImgFailed] = useState(false);
  const external = /^https?:\/\//.test(item.screenshotUrl);
  const text = item.ocrText ?? undefined;

  return (
    <div className="detail-scroll">
      <div className="detail-img">
        {imgFailed ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }} className="muted">
            The image couldn’t be displayed here.
            {external && (
              <>
                {" "}
                <a href={item.screenshotUrl} target="_blank" rel="noopener noreferrer">
                  Open it in a new tab
                </a>
                .
              </>
            )}
          </div>
        ) : (
          <img
            src={item.screenshotUrl}
            alt={`Screenshot from ${item.device}, ${formatWhen(item.timestamp)}`}
            onError={() => setImgFailed(true)}
          />
        )}
      </div>

      <div className="detail-kv">
        <span>
          From <b>{item.device}</b>
        </span>
        <span>
          <b>{formatWhen(item.timestamp)}</b>
        </span>
        {external && !imgFailed && (
          <a href={item.screenshotUrl} target="_blank" rel="noopener noreferrer">
            Open original
          </a>
        )}
      </div>

      <section>
        <p className="eyebrow" style={{ marginBottom: 12 }}>
          Why it was flagged
        </p>
        {item.analysis === null ? (
          <p className="muted">
            The text on this screenshot hasn’t been read yet. If this doesn’t change, the image may
            be unreadable — judge it by eye, or check the text-reading setting in Settings.
          </p>
        ) : item.analysis.matches.length === 0 ? (
          <p className="muted">
            Nothing in this screenshot matched a known scam pattern. Trust your eyes too — if
            something still feels wrong, mark it as a scam.
          </p>
        ) : (
          <div className="reason-list">
            {item.analysis.matches.map((m, i) => (
              <div
                key={`${m.categoryId}-${i}`}
                className={`reason-row${m.weight >= GRAVE_WEIGHT ? " grave" : ""}`}
              >
                <span className="reason-cat">{m.categoryLabel}</span>
                <span>
                  {m.explanation} <span className="phrase">Matched: “{m.phrase}”</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {(text || item.analysis) && (
        <details>
          <summary className="eyebrow" style={{ cursor: "pointer" }}>
            Text read from the screenshot
          </summary>
          <div className="ocr-box" style={{ marginTop: 12 }}>
            {text?.trim() ? text : "No text could be read from this image."}
          </div>
        </details>
      )}

      <div className="field">
        <label htmlFor="detail-note">Note to self</label>
        <textarea
          id="detail-note"
          className="textarea"
          placeholder="Anything you want to remember about this one."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div>
          <button
            className="btn btn-quiet btn-sm"
            onClick={() => onSaveNote(note)}
            disabled={note === (item.review?.note ?? "")}
          >
            Save note
          </button>
        </div>
      </div>

      <div className="field">
        <label htmlFor="detail-guidance">What to tell your parent</label>
        <textarea
          id="detail-guidance"
          className="textarea"
          placeholder="Write it the way you’d say it on the phone — you can read it to them later."
          value={guidance}
          onChange={(e) => setGuidance(e.target.value)}
        />
        <div>
          <button
            className="btn btn-quiet btn-sm"
            onClick={() => onSaveGuidance(guidance)}
            disabled={guidance === (item.review?.guidance ?? "")}
          >
            Save guidance
          </button>
        </div>
      </div>
    </div>
  );
}
