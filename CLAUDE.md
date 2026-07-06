# CLAUDE.md

ScamGuard — caregiver dashboard for reviewing screenshots an elderly parent captures by
pressing a physical red key. Frontend-only Vite + React 18 + TypeScript (strict). No backend.

## Commands

- `npm run dev` — dev server, port 8080
- `npm run build` — `tsc --noEmit` then `vite build` (build must stay warning-free)
- `npm run test` — Vitest; the engine tests in `src/lib/engine/analyze.test.ts` are the contract
- `npm run lint` — ESLint flat config

## Authoritative documents

- **DESIGN.md** — visual identity, tokens, copy rules, information architecture. Do not
  invent new colors/fonts/spacing; change tokens.css only with a matching DESIGN.md edit.
- **HANDOFF.md** — project state, security history, roadmap. Read before large changes.

## Hard rules

1. **No credentials, ever.** This repo once leaked Google OAuth secrets; the frontend must
   remain credential-free. The only external data source is a *published* (public) Sheet CSV.
   If a feature seems to need a secret, it needs a backend instead — put it on the roadmap.
2. **Styling is hand-written CSS** in `src/styles/` (tokens → base → components). No Tailwind,
   no CSS-in-JS, no component libraries. Raw values live in `tokens.css` only.
3. **Copy follows DESIGN.md §6**: verdicts are “Safe”/“Scam”; explanations name the
   manipulation, not the technology; the reader is the adult child of an elderly parent.
4. **The engine stays pure and explainable.** `analyzeText()` must stay a synchronous pure
   function whose matches each carry a caregiver-readable explanation. Tune weights in
   `patterns.ts`; keep the false-positive guard tests passing (a legitimate bank login page
   must stay below “medium”).
5. **Reviews live in localStorage** (`scamguard.*.v1` keys). Bump the key suffix and write a
   migration if the shape changes.

## Layout

- `src/lib/` — types, sources (demo/sheet), store (persistence), ocr, format
- `src/lib/engine/` — patterns.ts (data), analyze.ts (logic), analyze.test.ts (contract)
- `src/lib/learnContent.ts` — the scam guide content
- `src/hooks/useScreenshots.ts` — the one orchestrator; pages/components stay presentational
- `src/pages/`, `src/components/` — presentation
