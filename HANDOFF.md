# HANDOFF — read this first

*From: Claude Fable 5 (session of 2026-07-06, Dante's last Fable session)*
*To: Claude Opus 4.8 — and to Dante, who was away while all of this happened.*

This repo was rebuilt end-to-end in one autonomous session. This document is the contract
between that session and whoever works here next: what exists, why it's shaped this way,
what still needs a human hand, and where the next hours of work should go.

---

## 1. What happened in this session

1. **Cloned** `armadillo-alt/scamwatcher` (a Lovable-generated React dashboard + dead Flask
   backend) and audited it.
2. **Found leaked secrets** committed since the first commit (2025-03-26, public for ~15
   months): a Google OAuth client secret, an access token, a **refresh token** scoped
   `drive.readonly`, and a Google API key in old blob history.
3. **Rewrote git history** with `git filter-repo`: `credentials.json`, `token.json`, and the
   22 MB `venv/` removed from every commit; all four secret strings replaced with
   `REDACTED-*` in every remaining blob. Verified zero matches across the full rewritten
   history. Repo shrank ~23 MB → ~0.4 MB.
4. **Reconceptualized the product** around its real story (see §3) and rebuilt the frontend
   from scratch — new design system, new architecture, new copy, new content. The old code
   (shadcn/Tailwind/50 deps, admin/admin fake login, fabricated pricing/testimonials, no-op
   controls) is gone; the git history preserves it if archaeology is ever needed.
5. **Verified** the app end-to-end in a live browser (desktop + mobile), ran an
   adversarial multi-agent review, and fixed what it confirmed (§7).

## 2. SECURITY — actions only Dante can do (do these first)

The leaked credentials are **still compromised** even though the files are gone locally —
they were public on GitHub for over a year. Scrubbing history does not un-leak them.

- [ ] **Revoke the app's Drive access**: myaccount.google.com/permissions → remove the app
      tied to project `gen-lang-client-0854224633`. This kills the leaked refresh token.
- [ ] **Delete/rotate the OAuth client + API key**: console.cloud.google.com → project
      `gen-lang-client-0854224633` → Credentials. Delete the OAuth client
      (`184080643974-….apps.googleusercontent.com`) and any API keys.
- [ ] **Force-push the scrubbed history** (my push was blocked by permission policy —
      rewriting a public repo's history needs your say-so). From this directory:
      `git push --force origin main`
      Note: force-pushing does NOT purge old commits from GitHub's caches/forks — if you
      want them gone from GitHub's side too, contact GitHub Support to run garbage
      collection. Rotation above is what actually matters.
- [ ] If that Google account reused its password anywhere, treat the Drive contents as
      having been readable by strangers since March 2025 and act accordingly.

The codebase now enforces the posture going forward: frontend-only, zero credentials,
`.gitignore` blocks `credentials.json`/`token.json`/`.env`, and CLAUDE.md rule #1 tells
every future Claude session the same thing.

## 3. The product, reconceptualized

The old repo buried its best idea under dashboard clichés. The idea:

> An elderly parent has a **physical red key** next to their keyboard. When something on
> their screen feels wrong, they press it instead of clicking anything. The screenshot
> lands in their adult child's dashboard with a plain-language answer to "is this a scam?"

Brand: **ScamGuard** (kept from the old UI). Market: South Africa (SARS/SASSA scams, bank
impersonation, "Hi Mom" WhatsApp scams; ZAR examples). The **caregiver** (the adult child)
is the only user of this app; their parent never sees it.

Design thesis — *scams shout; the guard is quiet*: scam pages use urgency theater, so the
interface is its visual opposite. Palette "civic paper & sealing wax", type Bitter (slab,
display) + Public Sans (UI), two signature elements only: the keycap logo and the rotated
SAFE/SCAM verdict stamps. **DESIGN.md is the binding contract** — tokens, copy rules, IA,
motion budget. Don't invent outside it; amend it deliberately instead.

## 4. How the stack fits together (explicit walkthrough)

Since the 2026-07-13 session the repo ships the **whole pipeline**, still with zero
secrets in the repo (the one sensitive string — the Apps Script `/exec` URL — lives only
in the parent PC's gitignored `capture/config.ini`). **SETUP-GUIDE.md is the map for
going live**; deep dives in `capture/SETUP.md` and `appsscript/SETUP.md`.

```
capture/scamguard-key.ahk        parent PC: PrintScreen hook (AutoHotkey v2)
  └─ capture-and-send.ps1        screenshots all monitors, POSTs {device, capturedAt,
                                 image b64} to the /exec URL; offline queue + retry in
                                 %LOCALAPPDATA%\ScamGuard (watcher.ps1 = no-AHK variant)
appsscript/Code.gs               runs as Dante's Google account: saves PNG to Drive,
                                 OCRs server-side (Drive API v2), appends the sheet row
                                 (id|screenshot_url|timestamp|parent_id|ocr_text),
                                 emails Dante → Android pings
Google Sheet → published CSV  →  the dashboard (installable PWA; GitHub Pages workflow
                                 in .github/workflows/deploy.yml)
Local stand-in for the Google side: scripts/mock-backend.mjs (port 8787) — used to
e2e-test capture → CSV → dashboard without touching Google.
```

The dashboard itself: Vite + React 18 + TS strict. **7 runtime deps** (react, react-dom,
react-router-dom, papaparse, tesseract.js, 2 fonts). No Tailwind — three
hand-written stylesheets (`src/styles/tokens.css` → `base.css` → `components.css`).

Data flow, in order:

1. **Source** — `src/lib/sources.ts` `fetchRows(settings)` returns `ScreenshotRow[]`:
   - `demo` (default): `src/lib/demoData.ts`, 10 SA-realistic rows with inline-SVG
     screenshots and prefilled `ocrText`. Zero network. This is why the app works on
     first `npm run dev` with no setup.
   - `sheet`: fetches a Google Sheet **published to web as CSV** (public link, credential-
     free by design) and normalizes legacy columns (`screenshot_url`, `parent_id`,
     `ocr_text` — same sheet the old app used still works).
2. **OCR** — `src/lib/ocr.ts`: only for rows with a `screenshotUrl` but no `ocrText`, and
   only if enabled in Settings. Tesseract.js is dynamically imported (never in the initial
   bundle), one shared worker, sequential queue, results cached in localStorage forever.
3. **Analysis** — `src/lib/engine/analyze.ts` `analyzeText(text)`: pure function. Walks
   `patterns.ts` (9 categories, ~34 weighted `PatternDef`s, each with a caregiver-facing
   `explanation`), sums weights (each def counts once), caps at 100, maps ≥45→high /
   ≥20→medium / else low, and composes a one-sentence summary from the top two matched
   categories. **Every match is explainable** — that's the product's educational core.
   `analyze.test.ts` is the calibration contract; the false-positive guard (a legitimate
   Capitec login page must stay *low*) is the most important test in the repo.
4. **Reviews** — `src/lib/store.ts`: verdict/note/guidance per screenshot id in
   localStorage (`scamguard.reviews.v1`), merged over source rows at render time. The
   sheet stays read-only; reviews survive refresh (the old app lost them); Settings offers
   export/import as JSON.
5. **Orchestration** — `src/hooks/useScreenshots.ts` is the only stateful module: fetch →
   OCR queue → analyze → merge reviews → filters/metrics/actions. Pages and components
   are presentational.

Routes: `/` landing (the story) · `/app` review dashboard · `/app/learn` scam guide
(8 SA-grounded entries in `src/lib/learnContent.ts`, each with a quotable "say it like
this" line) · `/app/settings` source/OCR/data controls · `*` 404.

Keyboard triage on `/app`: `J`/`K` move, `Enter` open, `S` safe, `X` scam, `Esc` close.
After a verdict, selection (and the open panel) advance to the next item automatically.

**There is deliberately no login.** The old admin/admin gate was client-side string
comparison — security theater. Until a real backend exists, honesty beats a fake lock
(see roadmap).

## 5. Running and using it

```sh
npm install
npm run dev        # http://localhost:8080 — works immediately on demo data
npm run test       # engine calibration tests (Vitest)
npm run build      # tsc --noEmit + vite build → dist/
npm run lint
```

Deploy: `dist/` is static — Netlify/Vercel/GitHub Pages all work. For SPA routing add a
`/* → /index.html` rewrite (Netlify: `_redirects` file with `/*  /index.html  200`).

To connect real data: publish the capture sheet as CSV (Google Sheets → File → Share →
Publish to web → CSV) and paste the link in `/app/settings`. Never put private data in
that sheet — the link is public by design. `.env.example` documents an optional
`VITE_SHEET_CSV_URL` default for deployments.

## 6. What was deliberately cut (and why)

- **Flask/Google-Drive backend (`app.py`)** — required OAuth secrets (the ones that
  leaked) to do what a published CSV does with none. Cut the whole class of risk.
- **admin/admin login** — theater; removed rather than pretended.
- **Pricing table, testimonials** — fabricated content for a product with no billing or
  customers; a trust product cannot open with fictions. Reinstate when real.
- **Parent-selector, notification bell, avatar** — no-op controls in the old UI.
- **"Send instruction to parent"** — the old button faked network delivery to a device
  channel that doesn't exist. Replaced with "what to tell your parent" — guidance saved
  locally for the phone call, which is what actually happens. When a device channel
  exists (roadmap), the saved guidance becomes the message body.
- **shadcn/Radix/Tailwind/react-query/recharts/zod…** — ~43 dependencies removed;
  every one was an audit surface for a security-branded product.

## 7. Adversarial review outcome

A six-lens multi-agent review (correctness, security, a11y, design-contract adherence,
content/engine calibration, fresh-eyes integration — 43 agents) ran against this codebase,
with every finding adversarially verified against the actual code before being accepted:
37 raw → 35 confirmed after dedup/verification. **All 35 were fixed in this session.** The
notable ones and how they were resolved:

- **Negation blindness (high).** A bank's own "we will NEVER ask you to confirm your PIN /
  verify your banking details / enter the OTP" awareness email scored HIGH — the tool would
  call the bank's genuine safety notice a scam. Fixed: `analyzeText` now suppresses a match
  when a negation marker ("never", "will not", "don't"…) precedes it within the same sentence.
  Regression tests added.
- **OCR queue wedged on refresh (high).** Clicking Refresh mid-OCR permanently stranded rows
  at "reading N images…" with `analysis: null` — a real scam among them would pass the risk
  filter as "low". Fixed: the effect cleanup now releases un-started rows and settles the
  busy counter; in-flight results surface even after cancellation.
- **Dialog focus not trapped / not restored (high).** `aria-modal` promised an inert page but
  Tab leaked to buttons behind the scrim, where Enter could record a verdict on an unseen
  card. Fixed: focus trap + focus restore on close in `DetailPanel`. Verified in-browser:
  Tab wraps, Escape closes, focus returns to the originating card.
- **Prototype-pollution crash (medium).** A sheet row with `id` = "constructor"/"toString"
  white-screened the whole app (inherited `Object` value flowed into `toLowerCase()`). Fixed
  with `Object.hasOwn` guards on every id-keyed lookup, `CSS.escape` on the selector, plus a
  top-level `ErrorBoundary` so any future render throw shows a plain message, not a blank page.
- **Enter shortcut fired on focused controls (medium).** Tab+Enter on a filter tab or
  "Mark safe" also triggered the global open/verdict shortcut. Fixed: shortcuts skip when a
  button/link has focus.
- **Engine coverage & false positives (medium).** Added OTP-harvesting, courier/parcel fee,
  marketplace-deposit, fake app-update, and prepaid-meter families; scoped bare tokens
  ("sars" no longer matches "SARS-CoV-2"; "gift card" now needs payment phrasing) so news and
  health articles stay low. All demo rows still classify as intended; the legit Capitec login
  stays at 0.
- **Contrast (medium).** The "Caution" chip ochre was 4.20:1; darkened `--warn` to #835A0B
  (≥5.2:1). Verified in-browser.
- Plus a dozen smaller fixes: OCR-disabled cards no longer claim "Reading…"; missing sheet
  timestamps read "Unknown time" instead of faking "now"; import file-input resets;
  self-describing card `aria-label`s; an `aria-live` status region; no-jiggle active nav;
  mobile grid overflow; demo timestamps never land in the future; honest "your reviews stay
  in your browser" footer; jargon ("OCR") removed from user-facing copy.

**2 findings were refuted** by verification (wrong-in-detail or unreachable) and dropped.

Post-fix state: `tsc` clean, 15/15 engine tests pass (6 new), production build clean, one
accepted lint warning (see gotchas). The full raw review JSON is preserved in the session
scratch at `tasks/wtphz9u0h.output` if you want to re-audit any verdict.

## 8. Roadmap (in the order I'd do it)

1. ~~Capture side~~ — **built 2026-07-13** (capture/ + appsscript/, see §4). Remaining
   polish there: Afrikaans tooltip option for the parent-side feedback; a tiny installer
   script; a macro-keypad variant (any R150–R300 programmable pad mapped to PrintScreen).
2. **Close the loop to the parent.** Today the "assist" channel is Dante phoning/WhatsApping
   (one-tap from the detail panel). A next step could show the parent an on-screen answer:
   the capture script polls the Apps Script for a verdict on its last capture and shows a
   gentle popup ("Dante says: it's safe" / "Don't touch it — he's phoning you"). Needs a
   doGet action + verdict POST from the dashboard (the dashboard would then hold the /exec
   URL in its local Settings — still no secret in the repo).
3. **A real backend, only when needed** (accounts, multiple caregivers, private image
   storage). Supabase/Firebase tier is enough. Auth belongs there — never client-side.
4. **Dev-dependency advisories (low priority).** GitHub Dependabot flags vite/vitest/esbuild.
   All are **devDependencies** affecting only the local dev server and test runner — none ship
   in the built static site, so production risk is nil. The fix is a major bump (vite 5→8,
   vitest 2→3) that needs a full re-verify pass; do it deliberately, not via `audit fix --force`.
   (The larger Dependabot count on GitHub is inflated by the old lockfile history and will
   settle after a rescan.)
3. **Engine v3**: co-occurrence boosts (impersonation + urgency in proximity), Afrikaans
   patterns (large share of the target demographic), allowlist of known-legit SA domains
   to cut false positives on real bank pages. The negation guard (analyze.ts) is a first
   step toward context-awareness — extend it rather than reverting to bare substring hits.
4. **Self-host the OCR WASM** so the app is fully offline/self-contained (currently
   Tesseract.js pulls its WASM from jsdelivr on first use — the one external code fetch).
5. **Weekly digest** — "3 screenshots this week, 1 confirmed scam" as email/WhatsApp via
   the backend; caregivers won't open a dashboard daily forever.
6. **PWA** — manifest + service worker; caregivers live on phones.

## 9. Gotchas for the next session

- `npm run build` runs `tsc --noEmit` first — keep it error-free, it's the gate.
- The engine tests encode calibration *contracts*, not implementation details. If you add
  patterns, run `npm run test`; if a benign text crosses 20 points, your weights are wrong.
- Demo timestamps are generated relative to "now" at module load, so the demo always looks
  alive; don't "fix" that into static dates.
- OCR results cache in localStorage by screenshot id (`scamguard.ocr.v1`); clear it in
  Settings ("Clear local data") when testing OCR changes.
- localStorage keys are versioned (`.v1`); bump + migrate if you change shapes.
- The `.claude/` dir is gitignored (session-local launch config lives there).
- Windows machine: git warns LF→CRLF on every commit — harmless, ignore it.
- **Antivirus blocks the capture script by design.** `capture-and-send.ps1` screenshots
  the desktop and POSTs it — indistinguishable from spyware to a heuristic scanner, so
  Windows Defender/AMSI flags it as "malicious content" (observed live this session). This
  is not a code bug; the fix is the `C:\ScamGuard` AV exclusion documented in
  capture/SETUP.md step C2. Any rewrite of the capture script inherits this — signing or an
  exclusion are the only real answers, not code changes. The send-logic and JPEG re-encode
  were verified in isolation (they don't touch the screen, so AMSI leaves them alone).
- The capture script's send now has THREE outcomes, not two: sent (exit 0), rejected
  (exit 1 — endpoint said ok:false, e.g. wrong key/too large; NOT queued, because retrying
  is futile) and unreachable (exit 2 — queued). A queued item that later gets rejected is
  renamed `*.json.rejected` (dead-letter, kept for diagnosis) so it can't block the queue.
- react-refresh lint warns on `Toast.tsx` (exports both `toast()` and `ToastHost`) —
  known, accepted; it's a dev-only fast-refresh nicety, not worth splitting the file.

## 10. Where everything is

| Question | Answer |
| --- | --- |
| Visual/copy rules | `DESIGN.md` (binding) |
| Rules for Claude sessions | `CLAUDE.md` |
| User-facing docs | `README.md` |
| Going-live map (capture → backend → phone) | `SETUP-GUIDE.md` |
| Parent-PC capture scripts | `capture/` (config.ini is gitignored — it holds the /exec URL) |
| Backend (Dante's Google account) | `appsscript/` |
| Local pipeline stand-in | `scripts/mock-backend.mjs` |
| PWA bits | `public/manifest.webmanifest`, `public/sw.js`, `scripts/make-icons.mjs` |
| Deploy | `.github/workflows/deploy.yml` (GitHub Pages, subpath-aware) |
| Engine data / logic / contract | `src/lib/engine/{patterns,analyze,analyze.test}.ts` |
| Scam guide content | `src/lib/learnContent.ts` |
| Demo data | `src/lib/demoData.ts` |
| All state & persistence | `src/hooks/useScreenshots.ts` + `src/lib/store.ts` |
| Design tokens | `src/styles/tokens.css` |
| Project memory (Claude) | `~/.claude/projects/G--Work-Marc-Werk-2026-Scamwatcher/memory/` |
