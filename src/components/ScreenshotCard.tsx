import { useState, type CSSProperties } from "react";
import { formatWhen } from "../lib/format";
import type { ScreenshotItem, Verdict } from "../lib/types";
import { RiskChip, VerdictStamp } from "./Badges";

const RISK_WORD = { high: "high risk", medium: "caution", low: "low risk" } as const;

export function ScreenshotCard({
  item,
  index,
  selected,
  ocrEnabled,
  onOpen,
  onVerdict,
  onReopen,
}: {
  item: ScreenshotItem;
  index: number;
  selected: boolean;
  ocrEnabled: boolean;
  onOpen: () => void;
  onVerdict: (verdict: Verdict) => void;
  onReopen: () => void;
}) {
  const level = item.analysis?.level ?? "low";
  const verdict = item.review?.verdict;
  const [thumbFailed, setThumbFailed] = useState(false);

  const statusText = item.analysis
    ? item.analysis.summary
    : item.ocrText === ""
      ? "Couldn’t read the text on this image."
      : ocrEnabled
        ? "Reading the text on this screenshot…"
        : "Not checked — turn on text reading in Settings, or judge it by eye.";

  const label = [
    `Screenshot from ${item.device}, ${formatWhen(item.timestamp)}.`,
    item.analysis ? `${RISK_WORD[level]}.` : "",
    verdict ? `Marked ${verdict}.` : "",
    statusText,
    "Activate to open details.",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className={`shot-card risk-${level} rise${selected ? " is-selected" : ""}`}
      style={{ "--i": Math.min(index, 12) } as CSSProperties}
      data-shot-id={item.id}
    >
      <button className="shot-hit" onClick={onOpen} aria-label={label}>
        <div className="shot-thumb">
          {thumbFailed ? (
            <div className="shot-thumb-fallback">Preview unavailable</div>
          ) : (
            <img
              src={item.screenshotUrl}
              alt=""
              loading="lazy"
              onError={() => setThumbFailed(true)}
            />
          )}
          {verdict && <VerdictStamp verdict={verdict} />}
        </div>
        <div className="shot-body">
          <div className="shot-meta">
            <span>
              {item.device} · {formatWhen(item.timestamp)}
            </span>
            <RiskChip analysis={item.analysis} />
          </div>
          <p className="shot-summary">{statusText}</p>
        </div>
      </button>
      <div className="shot-actions">
        {verdict ? (
          <button className="btn btn-quiet btn-sm" onClick={onReopen}>
            Reopen
          </button>
        ) : (
          <>
            <button className="btn btn-safe btn-sm" onClick={() => onVerdict("safe")}>
              Mark safe
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => onVerdict("scam")}>
              Mark as scam
            </button>
          </>
        )}
      </div>
    </article>
  );
}
