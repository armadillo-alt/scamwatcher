# HANDOFF — read this first

*Written 2026-07-06 by the session that rebuilt the repo. Updated 2026-07-13 (pipeline),
2026-08-10 (verdict return path + installers) and 2026-09-07 (housekeeping). §1b lists what
each later session added.*

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

## 1b. What happened since

- **2026-07-13 — the whole pipeline.** `capture/` (AutoHotkey hotkey + PowerShell
  capture-and-send with offline queue), `appsscript/` (Drive + OCR + Sheet + email relay),
  `scripts/mock-backend.mjs` (local stand-in), GitHub Pages deploy workflow, PWA manifest
  and service worker, SETUP-GUIDE.md. Four pipeline-review fixes (reliable send, large
  captures). Zero secrets in the repo throughout.
- **2026-08-10 — installers and the way back.** `install.bat`/`uninstall.bat`,
  `make-client-bundle.ps1` (pre-filled bundle that refuses to build inside the repo, after
  an extracted bundle with a real `config.ini` was committed by accident and untracked in
  e10b2d5), configurable `HOTKEY`, AutoHotkey v1 misdetection fixed, `SECRET_KEY` moved
  to Apps Script Script Properties. Then the **verdict return path**: marking a scam in the
  dashboard posts to Apps Script, the parent PC polls every `POLL_SECONDS` and shows a
  full-screen red warning in the caregiver's own words (§4 item 6).
- **2026-09-07 — housekeeping, then Afrikaans.** Docs brought in line with the above,
  stray root files removed, security checklist updated. Verified on a fresh clone: 15/15
  tests, clean `tsc` + build, lint 0 errors, no secrets anywhere in `origin/main` history.
  Then `LANGUAGE=en|af` in `config.ini`: every parent-facing string in
  `scamguard-key.ahk` moved into a two-language table (`STRINGS` + `T()`), offered by
  `install.bat` and `make-client-bundle.ps1 -Language`. Then the macro-keypad variant:
  `HOTKEY=F13,PrintScreen` registers every listed key, a 2 s debounce absorbs a held
  button, docs cover the hardware. Written on Linux, so `AutoHotkey.exe /validate`
  still has to be run on a Windows machine before shipping.

## 2. SECURITY — actions only Dante can do (do these first)

The leaked credentials are **still compromised** even though the files are gone locally —
they were public on GitHub for over a year. Scrubbing history does not un-leak them.
The two Google-side boxes below can only be ticked by Dante — no session can verify them
from the repo. If they are done, tick them here so the next reader stops worrying.

- [ ] **Revoke the app's Drive access**: myaccount.google.com/permissions → remove the app
      tied to project `gen-lang-client-0854224633`. This kills the leaked refresh token.
- [ ] **Delete/rotate the OAuth client + API key**: console.cloud.google.com → project
      `gen-lang-client-0854224633` → Credentials. Delete the OAuth client
      (`184080643974-….apps.googleusercontent.com`) and any API keys.
- [x] **Force-push the scrubbed history** — done. A fresh clone of `origin/main` on
      2026-09-07 has no `credentials.json`/`token.json` in any commit and none of the leaked
      prefixes (`GOCSPX-`, `ya29.`, `AIza`) in any blob. A force-push does not purge old
      commits from GitHub's caches/forks — only GitHub Support can garbage-collect those.
      Rotation above is what actually matters.
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

Since the 2026-07-13 session the repo ships the **whole pipeline**, and since 2026-08-10
the loop closes back to the parent's screen — still with zero secrets in the repo. The one
sensitive string, the Apps Script `/exec` URL, lives only in the parent PC's gitignored
`capture/config.ini` and (optionally, for the return path) in the caregiver's browser
localStorage. **SETUP-GUIDE.md is the map for going live**; deep dives in
`capture/SETUP.md` and `appsscript/SETUP.md`.

```
capture/scamguard-key.ahk        parent PC (AutoHotkey v2): the hotkey (default PrintScreen,
  │                              HOTKEY= in config.ini) plus a watcher for alert.txt
  ├─ capture-and-send.ps1        screenshots all monitors, POSTs {device, capturedAt,
  │                              image b64} to the /exec URL; offline queue + retry in
  │                              %LOCALAPPDATA%\ScamGuard (watcher.ps1 = no-AHK variant)
  └─ check-verdicts.ps1          every POLL_SECONDS (default 45): POSTs {action:"poll",
                                 device, since}; a "scam" line → alert.txt → the .ahk
                                 shows a full-screen red warning in the caregiver's words
appsscript/Code.gs               runs as Dante's Google account; doPost routes on `action`:
                                 (absent) capture: PNG → Drive, server-side OCR (Drive
                                          API v2), row → "Screenshots" tab
                                          (id|screenshot_url|timestamp|parent_id|ocr_text),
                                          email → Android pings
                                 verdict  from the dashboard's "Mark as scam" → row in the
                                          append-only "Verdicts" tab
                                 poll     plain-text `verdict|iso|message` lines for one
                                          device; a first-ever poll sees only the last 10 min
                                 Shared key: SECRET_KEY Script Property, never in source.
Google Sheet → published CSV  →  the dashboard (installable PWA; GitHub Pages workflow
                                 in .github/workflows/deploy.yml)
Dashboard "Mark as scam" ──────▶ POST action=verdict to the /exec URL saved in Settings
Local stand-in for the Google side: scripts/mock-backend.mjs (port 8787) — capture,
verdict and poll, so the whole loop can be e2e-tested without touching Google.
Installers: capture/install.bat (+uninstall.bat, setup-autohotkey.ps1) and
scripts/make-client-bundle.ps1, which writes a pre-filled bundle to the Desktop.
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
6. **Verdict return path** — `src/lib/verdicts.ts` `sendScamWarning()`: when a "scam"
   verdict is recorded and Settings holds an `/exec` URL, it POSTs `{action:"verdict", id,
   device, verdict, message}`, where `message` is the guidance already saved for that
   screenshot (the detail panel says so next to the guidance box). "Safe" sends nothing —
   a popup for good news would only teach the parent to dismiss popups. The request uses
   `Content-Type: text/plain` so it stays a simple CORS request; Apps Script does not
   answer preflights. A toast reports whether it got through. `endpointUrl`/`endpointKey`
   live in `scamguard.settings.v1` with the other settings and never leave the browser.

Routes: `/` landing (the story) · `/app` review dashboard · `/app/learn` scam guide
(8 SA-grounded entries in `src/lib/learnContent.ts`, each with a quotable "say it like
this" line) · `/app/settings` source/OCR/data controls + "Warning their PC" · `*` 404.

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

Already done since this list was first written: the capture side and PWA (2026-07-13),
the one-file installer and pre-filled bundle (2026-08-10), and the verdict return path that
warns the parent's PC (2026-08-10). What's left:

1. **Capture-side polish.** ~~An Afrikaans option for the parent-facing text~~ (done
   2026-09-07 — validate the .ahk on Windows and have a native speaker read the eleven
   strings once); ~~a macro-keypad variant~~ (done 2026-09-07: `HOTKEY` takes a
   comma-separated list, presses are debounced for 2 s, and capture/SETUP.md step H
   explains buying a R150–R300 pad and programming it to F13 — same .ahk validation
   caveat); code-signing the PowerShell scripts so the antivirus exclusion becomes
   optional.
2. **Dev-dependency advisories (low priority).** GitHub Dependabot flags vite/vitest/esbuild.
   All are **devDependencies** affecting only the local dev server and test runner — none ship
   in the built static site, so production risk is nil. The fix is a major bump (vite 5→8,
   vitest 2→3) that needs a full re-verify pass; do it deliberately, not via `audit fix --force`.
   (The larger Dependabot count on GitHub is inflated by the old lockfile history and will
   settle after a rescan.)
3. **Engine v3**: co-occurrence boosts (impersonation + urgency in proximity), Afrikaans
   patterns, allowlist of known-legit SA domains to cut false positives on real bank pages.
   The negation guard (analyze.ts) is a first step toward context-awareness — extend it
   rather than reverting to bare substring hits.
4. **Self-host the OCR WASM** so the app is fully offline/self-contained (currently
   Tesseract.js pulls its WASM from jsdelivr on first use — the one external code fetch).
5. **A real backend, only when needed** (accounts, multiple caregivers, private image
   storage). Supabase/Firebase tier is enough. Auth belongs there — never client-side.
6. **Weekly digest** — "3 screenshots this week, 1 confirmed scam" as email/WhatsApp; needs
   the backend above. Caregivers won't open a dashboard daily forever.

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
- **The /exec URL now has two homes outside the repo**: `capture/config.ini` on the parent
  PC and the caregiver's browser localStorage (`scamguard.settings.v1`, via Settings →
  Warning their PC). Neither belongs in git. A filled-in `config.ini` was once committed
  inside an extracted bundle (untracked in e10b2d5) — that is why `make-client-bundle.ps1`
  refuses to build inside the repo and `.gitignore` covers the bundle output. If you add a
  new place the URL gets written, gitignore it in the same commit.
- **SECRET_KEY belongs in Apps Script Script Properties**, not in `Code.gs`. The constant
  in the file stays empty; the script prefers the property. Don't "simplify" this back to
  a constant — a key typed into Code.gs got committed twice during development.
- The dashboard's verdict POST uses `Content-Type: text/plain` on purpose. Switching it to
  `application/json` triggers a CORS preflight that Apps Script never answers, and the
  warning silently stops reaching the PC. The PC-side poll (PowerShell, no browser) sends
  JSON and is unaffected.
- The `Verdicts` tab is created on first use. A PC with no watermark only sees verdicts
  from the last 10 minutes (`POLL_DEFAULT_WINDOW_MS`), so a reinstall cannot replay old
  warnings. `POLL_SECONDS=0` in `config.ini` switches the return path off, and the .ahk
  also stays quiet if `check-verdicts.ps1` is missing next to it.
- Validate `scamguard-key.ahk` with `AutoHotkey.exe /validate` after every edit — a syntax
  error there breaks the red key itself, not just the warning. **The 2026-09-07 language
  edit has not yet been validated** (no Windows in that session); do it before shipping.
- Parent-facing words live only in the `STRINGS` table at the top of `scamguard-key.ahk`;
  add a language by adding a Map there and accepting its code where `msgLang` is set.
  Keep the file ASCII (the Afrikaans deliberately avoids diacritics) so it never depends
  on how AutoHotkey guesses the file's encoding. Caregiver-facing setup errors stay English.

## 10. Where everything is

| Question | Answer |
| --- | --- |
| Visual/copy rules | `DESIGN.md` (binding) |
| Rules for Claude sessions | `CLAUDE.md` |
| User-facing docs | `README.md` |
| Going-live map (capture → backend → phone) | `SETUP-GUIDE.md` |
| Parent-PC capture scripts | `capture/` (config.ini is gitignored — it holds the /exec URL) |
| Return path, PC side | `capture/check-verdicts.ps1` + the alert watcher in `capture/scamguard-key.ahk` |
| Return path, dashboard side | `src/lib/verdicts.ts` + Settings → "Warning their PC" |
| Installers / bundle | `capture/install.bat`, `capture/uninstall.bat`, `capture/setup-autohotkey.ps1`, `scripts/make-client-bundle.ps1` |
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
