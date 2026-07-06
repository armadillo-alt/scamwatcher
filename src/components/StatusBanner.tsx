import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { formatWhen } from "../lib/format";
import type { useScreenshots } from "../hooks/useScreenshots";

type Shots = ReturnType<typeof useScreenshots>;

/** The dashboard hero: one human sentence first, quiet numbers second. */
export function StatusBanner({ shots }: { shots: Shots }) {
  const { metrics, loading, ocrBusy, sourceError, settings } = shots;

  let sentence: ReactNode;
  let calm = false;

  if (loading) {
    sentence = <>Checking for new screenshots…</>;
  } else if (sourceError) {
    sentence = <>Couldn’t load screenshots.</>;
  } else if (metrics.needsReview === 0) {
    calm = true;
    sentence = (
      <>
        <em>All clear</em> — nothing needs your review.
      </>
    );
  } else if (metrics.dangerous > 0) {
    sentence = (
      <>
        <em>
          {metrics.needsReview} screenshot{metrics.needsReview === 1 ? "" : "s"}
        </em>{" "}
        need{metrics.needsReview === 1 ? "s" : ""} your review —{" "}
        {metrics.dangerous === 1 ? "one looks" : `${metrics.dangerous} look`} dangerous.
      </>
    );
  } else {
    sentence = (
      <>
        <em>
          {metrics.needsReview} screenshot{metrics.needsReview === 1 ? "" : "s"}
        </em>{" "}
        need{metrics.needsReview === 1 ? "s" : ""} your review.
      </>
    );
  }

  const subParts: string[] = [];
  if (sourceError) {
    subParts.push(sourceError);
  } else {
    if (metrics.lastArrival) subParts.push(`Last screenshot ${formatWhen(metrics.lastArrival)}`);
    if (ocrBusy > 0) subParts.push(`reading ${ocrBusy} image${ocrBusy === 1 ? "" : "s"}…`);
    if (settings.source === "demo") subParts.push("showing demo data");
  }

  return (
    <div className="status-banner rise">
      <div>
        <p className={`status-line${calm ? " calm" : ""}`}>{sentence}</p>
        <p className="status-sub">
          {subParts.join(" · ")}
          {sourceError && (
            <>
              {" "}
              <Link to="/app/settings">Check Settings</Link>
            </>
          )}
        </p>
      </div>
      <div className="metricline" aria-label="Totals">
        <div className="metric">
          <b className="tnum">{metrics.thisWeek}</b>
          <span>this week</span>
        </div>
        <div className="metric">
          <b className="tnum">{metrics.scams}</b>
          <span>confirmed scams</span>
        </div>
        <div className="metric">
          <b className="tnum">{metrics.safe}</b>
          <span>marked safe</span>
        </div>
      </div>
    </div>
  );
}
