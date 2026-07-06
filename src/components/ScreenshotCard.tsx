import type { CSSProperties } from "react";
import { formatWhen } from "../lib/format";
import type { ScreenshotItem, Verdict } from "../lib/types";
import { RiskChip, VerdictStamp } from "./Badges";

export function ScreenshotCard({
  item,
  index,
  selected,
  onOpen,
  onVerdict,
  onReopen,
}: {
  item: ScreenshotItem;
  index: number;
  selected: boolean;
  onOpen: () => void;
  onVerdict: (verdict: Verdict) => void;
  onReopen: () => void;
}) {
  const level = item.analysis?.level ?? "low";
  const verdict = item.review?.verdict;

  return (
    <article
      className={`shot-card risk-${level} rise${selected ? " is-selected" : ""}`}
      style={{ "--i": Math.min(index, 12) } as CSSProperties}
      data-shot-id={item.id}
    >
      <button
        className="shot-hit"
        onClick={onOpen}
        aria-label={`Open screenshot from ${item.device}, ${formatWhen(item.timestamp)}`}
      >
        <div className="shot-thumb">
          <img src={item.screenshotUrl} alt="" loading="lazy" />
          {verdict && <VerdictStamp verdict={verdict} />}
        </div>
        <div className="shot-body">
          <div className="shot-meta">
            <span>
              {item.device} · {formatWhen(item.timestamp)}
            </span>
            <RiskChip analysis={item.analysis} />
          </div>
          <p className="shot-summary">
            {item.analysis
              ? item.analysis.summary
              : item.ocrText === ""
                ? "Couldn’t read the text on this image."
                : "Reading the text on this screenshot…"}
          </p>
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
