import {
  BRAND_TOKENS,
  COMBINATIONS,
  LEGIT_DOMAINS,
  LEGIT_DOMAIN_NOTE,
  LOOKALIKE_EXPLANATION,
  LOOKALIKE_WEIGHT,
  PATTERN_LIBRARY,
} from "./patterns";
import type { Analysis, RiskLevel, SignalMatch } from "../types";

/** Keep thresholds in sync with the comment in types.ts. */
const HIGH_AT = 45;
const MEDIUM_AT = 20;

export function levelFromScore(score: number): RiskLevel {
  if (score >= HIGH_AT) return "high";
  if (score >= MEDIUM_AT) return "medium";
  return "low";
}

/** Category id given to matches that come from two signals reinforcing each other. */
export const COMBINATION_CATEGORY = "combination";
const COMBINATION_LABEL = "Two signals together";

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
    // Combinations restate categories already present; the summary names the manipulations.
    if (m.categoryId === COMBINATION_CATEGORY) continue;
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
 * Afrikaans markers ("nooit", "sal nie", "geen") are included; the bare particle "nie"
 * is not, because it closes almost every Afrikaans sentence and would silence real scams.
 */
const NEGATION_WINDOW = 90;
const NEGATION_RE =
  /(?:\bnever\b|\bwill not\b|\bwon'?t\b|\bdo(?:es)? not\b|\bdon'?t\b|\bno\b|\bnooit\b|\bsal nie\b|\bsal nooit\b|\bgeen\b)/i;

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

/* ---------- Web addresses ---------- */

// Something that looks like a domain: labels joined by dots, ending in a 2+ letter TLD,
// not glued to other address characters. Runs on lower-cased text. "R28.50" has no
// letters in its last label, "e.g." has only one, so neither qualifies.
const DOMAIN_RE = /(?<![a-z0-9.-])(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?![a-z0-9-])/g;

function isLegitDomain(domain: string): boolean {
  return LEGIT_DOMAINS.some((d) => domain === d || domain.endsWith("." + d));
}

interface DomainScan {
  legit: string[];
  lookalike: string[];
}

/** Every domain-shaped token in the text, sorted into genuine and lookalike. */
function scanDomains(text: string): DomainScan {
  const legit: string[] = [];
  const lookalike: string[] = [];
  for (const m of text.matchAll(DOMAIN_RE)) {
    const domain = m[0];
    if (isLegitDomain(domain)) {
      if (!legit.includes(domain)) legit.push(domain);
    } else if (BRAND_TOKENS.some((b) => domain.includes(b))) {
      if (!lookalike.includes(domain)) lookalike.push(domain);
    }
  }
  return { legit, lookalike };
}

/* ---------- Analysis ---------- */

interface Positioned extends SignalMatch {
  /** Where in the text the phrase was found — used only for proximity. */
  index: number;
  /** A brand mention halved by a genuine address; it does not reinforce other signals. */
  discounted?: boolean;
}

/**
 * Pure, explainable analysis of OCR text against the pattern library.
 *
 * 1. Every PatternDef contributes at most once, using the first phrase that matches
 *    affirmatively (negated mentions — "we will never ask you to…" — don't count).
 * 2. A web address that borrows a bank's or an official name without being the real
 *    address scores as impersonation. A genuine address halves the "named bank" def.
 * 3. Two categories found close together (COMBINATIONS) add a further explained match:
 *    a bank name next to a deadline is worth more than either alone.
 */
export function analyzeText(raw: string): Analysis {
  const text = raw.toLowerCase();
  const domains = scanDomains(text);
  const discountBrand = domains.legit.length > 0 && domains.lookalike.length === 0;
  const found: Positioned[] = [];

  for (const category of PATTERN_LIBRARY) {
    for (const def of category.patterns) {
      let index = -1;
      const phrase = def.phrases.find((p) => (index = findAffirmative(text, p)) !== -1);
      if (!phrase) continue;
      const discounted = discountBrand && def.kind === "brand";
      found.push({
        categoryId: category.id,
        categoryLabel: category.label,
        phrase,
        weight: discounted ? Math.round(def.weight / 2) : def.weight,
        explanation: discounted ? `${def.explanation} ${LEGIT_DOMAIN_NOTE}` : def.explanation,
        index,
        discounted,
      });
    }
  }

  if (domains.lookalike.length > 0) {
    const domain = domains.lookalike[0];
    found.push({
      categoryId: "impersonation",
      categoryLabel: "Pretending to be a bank or SARS",
      phrase: domain,
      weight: LOOKALIKE_WEIGHT,
      explanation: LOOKALIKE_EXPLANATION,
      index: text.indexOf(domain),
    });
  }

  const combos: Positioned[] = [];
  for (const combo of COMBINATIONS) {
    const [catA, catB] = combo.categories;
    let best: [Positioned, Positioned] | null = null;
    let bestDistance = Infinity;
    for (const a of found) {
      if (a.categoryId !== catA || a.discounted) continue;
      for (const b of found) {
        if (b.categoryId !== catB || b.discounted) continue;
        const distance = Math.abs(a.index - b.index);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = [a, b];
        }
      }
    }
    if (best && bestDistance <= combo.within) {
      const [a, b] = best;
      combos.push({
        categoryId: COMBINATION_CATEGORY,
        categoryLabel: COMBINATION_LABEL,
        phrase: `${a.phrase} … ${b.phrase}`,
        weight: combo.weight,
        explanation: combo.explanation,
        index: Math.min(a.index, b.index),
      });
    }
  }

  const matches: SignalMatch[] = [...found, ...combos]
    .sort((a, b) => b.weight - a.weight)
    .map(({ categoryId, categoryLabel, phrase, weight, explanation }): SignalMatch => ({
      categoryId,
      categoryLabel,
      phrase,
      weight,
      explanation,
    }));

  const score = Math.min(
    100,
    matches.reduce((sum, m) => sum + m.weight, 0),
  );

  return { score, level: levelFromScore(score), matches, summary: summarize(matches) };
}
