# ScamGuard — Design System & Architecture

*Written by Claude Fable 5, 2026-07-06. This is the contract the frontend is built against.
Read this before changing any visual or structural decision.*

## 1. What this product is

An elderly parent has a **physical red key** next to their keyboard. When something on their
screen feels wrong — a popup, an email, a "your account is locked" page — they press it.
A screenshot lands in this dashboard, where their adult child (the *caregiver*) reviews it,
marks it **Safe** or **Scam**, and can leave guidance. The product's promise:

> One button. One scan. One less thing to worry about.

The dashboard's single job: answer **"is Mom okay — what needs my attention?"** in five
seconds, then make the review itself calm and quick.

Market: South Africa first (ZAR, SARS/SASSA/bank-impersonation scams), English UI.

## 2. Design thesis: *scams shout; the guard is quiet*

Scam pages are loud on purpose — countdown timers, flashing red, ALL-CAPS urgency.
ScamGuard is the visual opposite: unhurried, well-set, plain-spoken. The interface itself
models the calm it wants to teach. Concretely:

- No blinking, no gradients, no urgency theater. One orchestrated entrance, then stillness.
- Findings are explained in plain language ("This message pressures you to act immediately —
  real banks don't."), never jargon.
- Red is reserved. When it appears, it means something.

## 3. Tokens

Defined once in `src/styles/tokens.css`. Never hard-code a color or size outside it.

### Color — "civic paper & sealing wax"

| Token        | Hex       | Role |
|--------------|-----------|------|
| `--paper`    | `#F6F6F1` | App ground. Grey-green paper, deliberately cooler than cream. |
| `--card`     | `#FFFFFF` | Raised surfaces. |
| `--ink`      | `#20261E` | Primary text. Green-black, not pure black. |
| `--ink-2`    | `#5B6353` | Secondary text, sage-grey. |
| `--line`     | `#DEE0D3` | Hairlines, borders. |
| `--key-red`  | `#9E2B25` | The Key. Brand accent AND high-risk/scam semantics — one red family, used sparingly: logo, primary CTA, danger chips, SCAM stamp. Hover `#7E211C`. |
| `--red-tint` | `#F7E9E7` | Tinted ground for high-risk chips/panels. |
| `--safe`     | `#3D6B35` | Safe / verified. Garden green. Tint `#EAF0E6`. |
| `--warn`     | `#96690F` | Caution / medium risk. Ochre. Tint `#F5EEDD`. |

Risk levels map: high → key-red family, medium → warn, low → safe-adjacent neutral
(low risk is *rendered quiet*, not celebrated green — only an explicit Safe verdict earns green).

### Type

- **Display: Bitter** (variable slab serif) — civic, sturdy, warm. Weights 550–700.
  Headlines, the status sentence, stamps, Learn-page titles. `text-wrap: balance` on headings.
- **UI & body: Public Sans** (variable) — designed for civic digital services; honest and clear.
  Everything else. `font-variant-numeric: tabular-nums` wherever digits align.
- Scale (rem): 0.8125 (caption) / 0.9375 (ui) / 1.0625 (body) / 1.375 (h3) / 1.75 (h2) /
  2.375 (h1) / 3.25 (landing hero). Line-height 1.15 display, 1.55 body.
- Uppercase eyebrows/labels get `letter-spacing: 0.08em`, weight 600, size 0.8125rem.

Fonts are self-hosted via `@fontsource-variable/bitter` and `@fontsource-variable/public-sans`
imported in `main.tsx`. No font CDNs.

### Space, shape, elevation

- Spacing steps: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 72 px. Layout via flex/grid `gap`, not margins.
- Radius: 10px cards, 8px controls, 999px chips. (No blanket `rounded-lg` sameness — the
  keycap logo and stamps use their own geometry.)
- Elevation: hairline border first (`1px solid var(--line)`); one soft shadow tier for
  the detail panel and menus only: `0 8px 32px rgba(32,38,30,.12)`.
- Content max-width: 1120px shell; running text ~65ch.

### Motion

- Dashboard load: status sentence fades/rises 240ms, cards stagger 30ms each. That is the one
  orchestrated moment.
- Verdict stamp: 180ms scale-settle on apply.
- Everything honors `@media (prefers-reduced-motion: reduce)` → no transforms, opacity only.

### Signature elements (the aesthetic risk, spent in one place)

1. **The keycap logo** — inline SVG: a rounded keycap outline with a solid red dot. Also the
   favicon. The landing hero renders it large.
2. **Verdict stamps** — reviewed cards carry a stamp-like chip (`SAFE` outlined in green,
   `SCAM` in key-red), rotated −2°, slab type, slight ink texture via double border.
   Everything around the stamps stays rectilinear and quiet.

## 4. Information architecture

```
/            Landing — the story: hero (keycap, promise), how it works (3 steps),
             what it watches for (teaser of Learn), honest CTA → /app.
             No fabricated pricing/testimonials (removed deliberately).
/app         Review — the dashboard. Status sentence hero, quiet metrics,
             filter tabs (Needs review / Scams / Safe / All + risk filter),
             card grid, detail panel (right side on desktop, sheet on mobile),
             keyboard triage: j/k move · enter open · s safe · x scam · esc close.
/app/learn   Scam library — one card per scam family: what it looks like, red flags,
             what to tell your parent. Content in src/lib/learnContent.ts.
/app/settings  Data source (Demo / Google Sheet CSV URL), OCR toggle,
             export/import reviews (JSON), clear local data.
*            NotFound — quiet 404.
```

There is **no login**. The old admin/admin gate was security theater (client-side string
compare) and was removed; until a real backend exists, honesty beats a fake lock.
See HANDOFF.md → Roadmap for real auth.

## 5. Architecture

**Frontend-only Vite + React 18 + TypeScript (strict). No backend, no secrets, no Tailwind.**

```
Google Sheet (published CSV, optional)   Demo dataset (bundled)
                 └────────────┬────────────────┘
                     src/lib/sources.ts        ← DataSource adapters
                              │  rows
                     src/lib/engine/*          ← explainable scam analysis (pure, tested)
                              │  + ocr.ts (Tesseract.js, lazy, cached) when a row has no text
                     src/hooks/useScreenshots.ts ← orchestration + state
                              │  merged with
                     src/lib/store.ts          ← reviews/settings in localStorage
                              │
                     pages/ + components/      ← presentation only
```

Key decisions and why:

- **The Flask/Google-Drive backend is gone.** It required OAuth secrets (which leaked) for
  something a published-CSV source does without any secret. The frontend never holds
  credentials of any kind.
- **Analysis is local and explainable.** `engine/patterns.ts` holds weighted, categorized
  signals (urgency, impersonation, payment red flags, prize bait, tech-support, SA-specific:
  SARS, SASSA, bank impersonation, WhatsApp family scams…). `engine/analyze.ts` is a pure
  function returning score, level, and *named reasons with plain-language explanations* —
  the caregiver learns while reviewing. Unit-tested with Vitest.
- **Reviews persist.** The old app lost every review on refresh (state-only). Reviews, notes
  and guidance live in localStorage keyed by screenshot id, merged over source rows; the
  Sheet stays read-only. Export/import JSON for portability.
- **OCR is opt-in and cached.** Tesseract.js loads lazily, only for rows without `ocr_text`,
  results cached in localStorage. Batch OCR never blocks first paint.
- **Dependencies are few on purpose**: react, react-dom, react-router-dom, papaparse,
  tesseract.js, two @fontsource packages. Dev: vite, typescript, eslint, vitest.
  Every removed dependency is one less thing to audit.

### Sheet contract (backwards-compatible with the existing sheet)

Published-CSV columns read: `id`, `screenshot_url`, `timestamp` (ISO), `parent_id`
(device/person label), `ocr_text` (optional — if present, OCR is skipped).
Old columns `risk_level`/`scam_score`/`matched_patterns` are ignored: the local engine
re-analyzes so results are consistent and explainable.

## 6. Copy rules

- The monitored person is "your parent" / their device label ("Mom's PC"). The user is
  "you" — never "caregiver" in UI copy (that's a docs word).
- Verdicts: **Safe** / **Scam** — one syllable each, said plainly.
- Buttons say what happens: "Mark safe", "Mark as scam", "Save note". Toast confirms in the
  same words ("Marked safe").
- Risk explanations name the *manipulation*, not the technology: "pressures you to act
  immediately", "pretends to be your bank", "asks for payment in gift cards".
- Errors: what happened + what to do next. No apologies, no "oops".
