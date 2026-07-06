/** The keycap mark — DESIGN.md §3, signature element #1. */
export function KeycapMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect
        x="5"
        y="5"
        width="54"
        height="54"
        rx="13"
        fill="var(--card)"
        stroke="var(--ink)"
        strokeWidth="4"
      />
      <circle cx="32" cy="32" r="11" fill="var(--key-red)" />
    </svg>
  );
}

/** Large illustrative keycap for the landing hero: top face raised off a keycap base. */
export function HeroKeycap() {
  return (
    <svg
      width="240"
      height="240"
      viewBox="0 0 200 200"
      role="img"
      aria-label="A keyboard key with a red dot on it"
    >
      <rect x="22" y="34" width="156" height="152" rx="26" fill="#d9dbcd" />
      <rect
        x="14"
        y="14"
        width="156"
        height="152"
        rx="24"
        fill="var(--card)"
        stroke="var(--ink)"
        strokeWidth="5"
      />
      <circle cx="92" cy="90" r="30" fill="var(--key-red)" />
      <circle cx="82" cy="79" r="9" fill="#c8564f" opacity="0.85" />
    </svg>
  );
}
