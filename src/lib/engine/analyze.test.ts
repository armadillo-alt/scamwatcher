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

  it("does not flag a bank's own 'we will never ask' fraud-awareness notice", () => {
    const a = analyzeText(
      "Security notice from your bank. We will never ask you to verify your banking details, " +
        "confirm your PIN, or enter the OTP by phone or email. We will never tell you your " +
        "account has been suspended through a link. Fraudsters may pretend to be us.",
    );
    expect(a.level).toBe("low");
  });

  it("still flags an actionable phish even when it also contains a safe-sounding clause", () => {
    const a = analyzeText(
      "Unusual activity on your FNB account. Verify your banking details within 24 hours " +
        "or your account will be suspended. Click the link to confirm your card number now.",
    );
    expect(a.level).toBe("high");
  });

  it("does not read 'sars' inside unrelated words like SARS-CoV-2", () => {
    const a = analyzeText(
      "Health news: the SARS-CoV-2 virus has been detected in wastewater samples this week.",
    );
    expect(a.level).toBe("low");
  });

  it("scores a courier customs-fee smishing SMS at least medium", () => {
    const a = analyzeText(
      "SA Post Office: your package could not be delivered due to an unpaid customs fee of " +
        "R28.50. Pay the customs fee now to release your parcel.",
    );
    expect(a.level).not.toBe("low");
  });

  it("flags an OTP-harvesting page", () => {
    const a = analyzeText(
      "For your security, please enter the OTP below to verify your identity and keep your account active.",
    );
    expect(a.level).not.toBe("low");
  });

  it("does not flag a legitimate news article that merely mentions gift cards", () => {
    const a = analyzeText(
      "Retail news: gift card sales rose this festive season as shoppers looked for easy presents.",
    );
    expect(a.level).toBe("low");
  });

  /* ---------- v3: signals that reinforce each other ---------- */

  it("scores a bank name next to a deadline higher than the same two signals far apart", () => {
    const filler = " The weather in Bloemfontein was mild for the time of year, with light cloud.".repeat(5);
    const close = analyzeText("Your FNB account will be closed within 24 hours.");
    const apart = analyzeText("Your FNB account has a new statement." + filler + " Reply within 24 hours.");
    expect(close.score).toBeGreaterThan(apart.score);
    const combo = close.matches.find((m) => m.categoryId === "combination");
    expect(combo).toBeDefined();
    expect(combo!.explanation.length).toBeGreaterThan(20);
    expect(apart.matches.find((m) => m.categoryId === "combination")).toBeUndefined();
  });

  it("keeps combinations out of the one-sentence summary", () => {
    const a = analyzeText("Your FNB account will be closed within 24 hours. Verify your banking details now.");
    expect(a.summary).not.toMatch(/together/i);
    expect(a.level).toBe("high");
  });

  /* ---------- v3: web addresses ---------- */

  it("flags a lookalike address that borrows a bank's name", () => {
    const a = analyzeText("Log in at https://fnb-secure-login.co.za to confirm your card number.");
    const look = a.matches.find((m) => m.phrase === "fnb-secure-login.co.za");
    expect(look).toBeDefined();
    expect(look!.categoryId).toBe("impersonation");
    expect(a.level).not.toBe("low");
  });

  it("does not flag a genuine bank address, and lets it discount the bank's name", () => {
    const text =
      "Your FNB account statement is ready at www.fnb.co.za. Noticed unusual activity? " +
      "Call us on the number on the back of your card.";
    const a = analyzeText(text);
    expect(a.matches.find((m) => m.phrase.includes("fnb.co.za"))).toBeUndefined();
    expect(a.level).toBe("low");
    const brand = a.matches.find((m) => m.phrase === "fnb account");
    expect(brand).toBeDefined();
    expect(brand!.weight).toBeLessThan(12);
  });

  it("still scores a phish high when it shows a real address next to a fake request", () => {
    const a = analyzeText(
      "From: FNB <noreply@fnb.co.za>. Unusual activity on your FNB account. " +
        "Verify your banking details within 24 hours or your account will be suspended.",
    );
    expect(a.level).toBe("high");
  });

  it("does not mistake prices or abbreviations for web addresses", () => {
    const a = analyzeText("Special: R28.50 per kg, e.g. lamb chops. See St.Andrews Parish notice.");
    expect(a.matches).toHaveLength(0);
  });

  /* ---------- v3: Afrikaans ---------- */

  it("flags an Afrikaans bank phishing SMS as high risk", () => {
    const a = analyzeText(
      "DRINGEND: U Capitec rekening is opgeskort. Verifieer u bankbesonderhede binne 24 uur " +
        "anders sal u rekening permanent gesluit word.",
    );
    expect(a.level).toBe("high");
    expect(a.matches.length).toBeGreaterThan(2);
  });

  it("flags an Afrikaans 'Hallo Ma' family scam", () => {
    const a = analyzeText(
      "Hallo Ma, dit is my nuwe nommer, my foon is stukkend. Ek het dringend geld nodig - " +
        "kan Ma dit vir my betaal na hierdie rekening?",
    );
    expect(a.level).toBe("high");
    expect(a.matches.some((m) => m.categoryId === "family-impersonation")).toBe(true);
  });

  it("does not flag a bank's Afrikaans 'ons sal nooit vra' notice", () => {
    const a = analyzeText(
      "Veiligheidskennisgewing. Capitec sal u nooit vra om u bankbesonderhede te bevestig, " +
        "u PIN te stuur of die OTP in te voer nie. Ons sal nooit sê dat u rekening opgeskort is nie.",
    );
    expect(a.level).toBe("low");
  });

  it("keeps an Afrikaans news article and a church newsletter at low risk", () => {
    const news = analyzeText(
      "Beurtkrag skuif Donderdag na fase 4. Eskom het gesê instandhouding by twee kragstasies " +
        "sal tot die naweek voortduur.",
    );
    const parish = analyzeText(
      "Gemeentebrief. Sondagdienste om 08:30 en 10:00. Die basaar het R1,840 vir die sopkombuis " +
        "ingesamel - dankie aan elke helper. Resep van die maand: Ouma se melktert.",
    );
    expect(news.level).toBe("low");
    expect(parish.level).toBe("low");
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
