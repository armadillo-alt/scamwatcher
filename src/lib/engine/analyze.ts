import { PATTERN_LIBRARY } from "./patterns";
import type { Analysis, RiskLevel, SignalMatch } from "../types";

/** Keep thresholds in sync with the comment in types.ts. */
const HIGH_AT = 45;
const MEDIUM_AT = 20;

export function levelFromScore(score: number): RiskLevel {
  if (score >= HIGH_AT) return "high";
  if (score >= MEDIUM_AT) return "medium";
  return "low";
}

/** How each category reads inside the one-sentence summary. */
const SUMMARY_FRAGMENTS: Record<string, string> = {
  urgency: "pressures you to act immediately",
  impersonation: "pretends to be a trusted organisation",
  credentials: "asks for login or banking details",
  "payment-red-flags": "asks for payment in an unusual way",
  "prize-bait": "promises money or a prize",
  "delivery-fee": "invents a parcel fee",
  "tech-support": "claims the computer has a problem",
  "family-impersonation": "pretends to be a family member",
  investment: "promises guaranteed investment returns",
  threats: "threatens fines or legal trouble",
  secrecy: "tells you to keep it secret",
};

function summarize(matches: SignalMatch[]): string {
  if (matches.length === 0) {
    return "Nothing suspicious found in this screenshot.";
  }
  const seen = new Set<string>();
  const fragments: string[] = [];
  for (const m of matches) {
    if (seen.has(m.categoryId)) continue;
    seen.add(m.categoryId);
    fragments.push(SUMMARY_FRAGMENTS[m.categoryId] ?? m.categoryLabel.toLowerCase());
    if (fragments.length === 2) break;
  }
  const sentence = fragments.join(" and ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

/**
 * Negation guard: banks' own safety notices say "we will NEVER ask you to …" followed by
 * the very phrases scammers use. A match is suppressed when a negation marker appears
 * shortly before it in the same sentence, so genuine fraud-awareness text stays quiet.
 */
const NEGATION_WINDOW = 90;
const NEGATION_RE = /(?:\bnever\b|\bwill not\b|\bwon'?t\b|\bdo(?:es)? not\b|\bdon'?t\b|\bno\b)/i;

function isNegated(text: string, matchIndex: number): boolean {
  const windowStart = Math.max(0, matchIndex - NEGATION_WINDOW);
  let scope = text.slice(windowStart, matchIndex);
  const sentenceBreak = Math.max(
    scope.lastIndexOf("."),
    scope.lastIndexOf("!"),
    scope.lastIndexOf("?"),
  );
  if (sentenceBreak >= 0) scope = scope.slice(sentenceBreak + 1);
  return NEGATION_RE.test(scope);
}

/** First occurrence of the phrase that is NOT negated, or -1. */
function findAffirmative(text: string, phrase: string): number {
  let idx = text.indexOf(phrase);
  while (idx !== -1 && isNegated(text, idx)) {
    idx = text.indexOf(phrase, idx + phrase.length);
  }
  return idx;
}

/**
 * Pure, explainable analysis of OCR text against the pattern library.
 * A PatternDef contributes at most once, using the first phrase that matches
 * affirmatively (negated mentions — "we will never ask you to…" — don't count).
 */
export function analyzeText(raw: string): Analysis {
  const text = raw.toLowerCase();
  const matches: SignalMatch[] = [];

  for (const category of PATTERN_LIBRARY) {
    for (const def of category.patterns) {
      const phrase = def.phrases.find((p) => findAffirmative(text, p) !== -1);
      if (phrase) {
        matches.push({
          categoryId: category.id,
          categoryLabel: category.label,
          phrase,
          weight: def.weight,
          explanation: def.explanation,
        });
      }
    }
  }

  matches.sort((a, b) => b.weight - a.weight);
  const score = Math.min(
    100,
    matches.reduce((sum, m) => sum + m.weight, 0),
  );

  return { score, level: levelFromScore(score), matches, summary: summarize(matches) };
}
