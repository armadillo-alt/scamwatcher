import { describe, expect, it } from "vitest";
import { analyzeText, levelFromScore } from "./analyze";

describe("levelFromScore", () => {
  it("maps the documented thresholds", () => {
    expect(levelFromScore(0)).toBe("low");
    expect(levelFromScore(19)).toBe("low");
    expect(levelFromScore(20)).toBe("medium");
    expect(levelFromScore(44)).toBe("medium");
    expect(levelFromScore(45)).toBe("high");
    expect(levelFromScore(100)).toBe("high");
  });
});

describe("analyzeText", () => {
  it("returns a quiet result for empty text", () => {
    const a = analyzeText("");
    expect(a.score).toBe(0);
    expect(a.level).toBe("low");
    expect(a.matches).toHaveLength(0);
    expect(a.summary.length).toBeGreaterThan(0);
  });

  it("keeps a legitimate banking login below medium — the false-positive guard", () => {
    const a = analyzeText(
      "Capitec. Sign in to Internet Banking. Remember my details. Never share your PIN with anyone. Forgot your password?",
    );
    expect(a.level).toBe("low");
  });

  it("keeps an ordinary news article at low risk", () => {
    const a = analyzeText(
      "Load shedding moves to stage 4 on Thursday. Eskom said maintenance at two power stations would continue into the weekend.",
    );
    expect(a.level).toBe("low");
  });

  it("flags urgency plus account-threat wording as high risk", () => {
    const a = analyzeText(
      "URGENT: your account has been suspended. Verify your banking details within 24 hours or your account will be closed.",
    );
    expect(a.level).toBe("high");
    expect(a.matches.length).toBeGreaterThan(1);
  });

  it("treats gift-card payment demands as a grave signal", () => {
    const a = analyzeText("You must pay the processing fee with a gift card today. Act now.");
    const giftCard = a.matches.find((m) => m.phrase.includes("gift card"));
    expect(giftCard).toBeDefined();
    expect(giftCard!.weight).toBeGreaterThanOrEqual(16);
    expect(a.level).not.toBe("low");
  });

  it("is case-insensitive", () => {
    const lower = analyzeText("you have won a prize. claim your prize now.");
    const upper = analyzeText("YOU HAVE WON A PRIZE. CLAIM YOUR PRIZE NOW.");
    expect(upper.score).toBe(lower.score);
    expect(upper.score).toBeGreaterThan(0);
  });

  it("caps the score at 100 and sorts matches by weight, descending", () => {
    const a = analyzeText(
      [
        "Your computer has been infected. Call this number immediately.",
        "Your account has been suspended. Verify your banking details within 24 hours.",
        "You have won! Claim your prize. Pay the processing fee with a gift card or voucher.",
        "Guaranteed returns. Act now, limited time. Do not tell anyone.",
        "SARS eFiling refund. Your account will be closed. Unusual activity detected.",
      ].join(" "),
    );
    expect(a.score).toBeLessThanOrEqual(100);
    expect(a.level).toBe("high");
    for (let i = 1; i < a.matches.length; i++) {
      expect(a.matches[i - 1].weight).toBeGreaterThanOrEqual(a.matches[i].weight);
    }
  });

  it("every match carries a plain-language explanation", () => {
    const a = analyzeText("Verify your banking details immediately or your account will be closed.");
    expect(a.matches.length).toBeGreaterThan(0);
    for (const m of a.matches) {
      expect(m.explanation.length).toBeGreaterThan(20);
      expect(m.categoryLabel.length).toBeGreaterThan(2);
    }
  });
});
