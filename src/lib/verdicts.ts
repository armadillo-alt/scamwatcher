import type { ScreenshotItem, Settings, Verdict } from "./types";

/**
 * Sends a verdict back to the monitored PC, so the person sitting at it can be
 * warned off a scam they are in the middle of.
 *
 * The Apps Script web app is the relay: this posts the verdict, the PC polls
 * for it a few seconds later. Only "scam" is sent — a "safe" verdict has
 * nothing to tell them, and popping up a box for good news would just train
 * them to dismiss popups.
 *
 * The request deliberately uses Content-Type: text/plain. That keeps it a
 * "simple" cross-origin request, so the browser skips the CORS preflight that
 * Apps Script does not answer. (Verified against a live deployment.)
 */
export interface VerdictSendResult {
  /** false when the warning definitely did not reach the relay. */
  ok: boolean;
  /** Set when nothing was attempted, e.g. no endpoint configured. */
  skipped?: boolean;
  /** Caregiver-readable reason, present when ok is false. */
  error?: string;
}

export async function sendScamWarning(
  settings: Settings,
  item: ScreenshotItem,
  verdict: Verdict,
): Promise<VerdictSendResult> {
  if (verdict !== "scam") return { ok: true, skipped: true };

  const url = settings.endpointUrl.trim();
  if (!url) return { ok: true, skipped: true };

  const payload = {
    key: settings.endpointKey,
    action: "verdict",
    id: item.id,
    device: item.device,
    verdict,
    // Whatever you have already saved as guidance becomes the words on their
    // screen; the PC falls back to a firm default when this is empty.
    message: item.review?.guidance ?? "",
  };

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, error: "no connection" };
  }

  if (!res.ok) return { ok: false, error: `the relay answered ${res.status}` };

  try {
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (data.ok) return { ok: true };
    return { ok: false, error: data.error ?? "the relay refused it" };
  } catch {
    // Reached the relay but the reply was unreadable; the verdict has most
    // likely been recorded, so do not claim failure.
    return { ok: true };
  }
}
