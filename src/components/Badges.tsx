import type { Analysis, Verdict } from "../lib/types";

const RISK_LABEL = { high: "High risk", medium: "Caution", low: "Low risk" } as const;

export function RiskChip({ analysis }: { analysis: Analysis | null }) {
  if (!analysis) {
    return <span className="chip chip-low">Not read yet</span>;
  }
  const { level, score } = analysis;
  return (
    <span className={`chip chip-${level} tnum`}>
      {RISK_LABEL[level]}
      {level === "low" ? "" : ` · ${score}`}
    </span>
  );
}

export function VerdictStamp({ verdict }: { verdict: Verdict }) {
  return (
    <span className={`stamp ${verdict === "safe" ? "stamp-safe" : "stamp-scam"}`}>
      {verdict === "safe" ? "SAFE" : "SCAM"}
    </span>
  );
}
