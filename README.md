# ScamGuard

Your parent presses one red key when something on their screen feels wrong. The screenshot
lands here — with a plain-language answer to *“is this a scam?”*

> One button. One scan. One less thing to worry about.

This is the caregiver-facing web app: a calm triage dashboard for reviewing those
screenshots, an explainable scam-risk analysis that runs entirely in the browser, and a
plain-language guide to the scams that actually circulate in South Africa (SARS refunds,
SASSA grants, bank impersonation, “Hi Mom” WhatsApp messages…).

**Design and architecture are documented in [DESIGN.md](DESIGN.md).
If you are picking this project up, start with [HANDOFF.md](HANDOFF.md).
To put the whole pipeline live — red key on the parent's PC, Google-side backend,
the app on your Android — follow [SETUP-GUIDE.md](SETUP-GUIDE.md).**

## Run it

```sh
npm install
npm run dev        # → http://localhost:8080
```

That's all — the app starts on bundled demo data. No accounts, no keys, no backend.

| Script          | What it does                          |
| --------------- | ------------------------------------- |
| `npm run dev`   | Dev server on port 8080               |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run test`  | Unit tests for the scam-analysis engine |
| `npm run lint`  | ESLint                                |

## How it fits together

```
Parent presses the red key (capture/) ──▶ Apps Script backend (appsscript/)
        ▲                                     │ Drive image + OCR + email ping
        │ red warning on their screen         ▼
        │ (check-verdicts.ps1 polls the       │
        │  same Apps Script every 45 s)       │
        └── "Mark as scam" posts the verdict ◀┘ (src/lib/verdicts.ts, optional)
                                              ▼
Google Sheet (published CSV, optional) ──┐
Bundled demo data ───────────────────────┤
                                         ▼
                          src/lib/sources.ts   (fetch + normalize rows)
                          src/lib/ocr.ts       (Tesseract.js, lazy, cached — only for rows without text)
                          src/lib/engine/      (explainable risk analysis, pure + unit-tested)
                          src/lib/store.ts     (reviews & settings in localStorage)
                                         ▼
                          src/hooks/useScreenshots.ts  (one orchestrator)
                                         ▼
                          pages/ + components/          (presentation only)
```

- **`/`** — the story (landing page)
- **`/app`** — review dashboard: status sentence, filters, cards, detail panel,
  keyboard triage (<kbd>J</kbd>/<kbd>K</kbd> move, <kbd>Enter</kbd> open,
  <kbd>S</kbd> safe, <kbd>X</kbd> scam)
- **`/app/learn`** — the scam guide
- **`/app/settings`** — data source, OCR toggle, export/import reviews, and the
  optional Apps Script link that lets "Mark as scam" warn the parent's PC

## Connecting real data

Point Settings → *A Google Sheet* at a sheet published to the web as CSV
(File → Share → Publish to web → CSV). Columns understood:
`id`, `screenshot_url`, `timestamp` (ISO), `parent_id` (device label), `ocr_text` (optional).
The link is public by design — it involves **no credentials**, so never put private
information in that sheet. Reviews and notes never leave the caregiver's browser, with
one opt-in exception: a *scam* verdict plus its guidance sentence can be posted back to
the caregiver's own Apps Script so the parent's PC shows a warning (see SETUP-GUIDE.md).

## Security posture

- Frontend-only; **no secrets exist anywhere in this codebase** and none may be added.
  The Apps Script `/exec` URL and shared key live only on the parent's PC (`config.ini`,
  gitignored), in the caregiver's browser storage, and in Apps Script Script Properties.
- Google OAuth credentials were leaked in this repo's early history; the history has been
  rewritten to purge them. The credentials themselves must be treated as compromised and
  revoked — see [HANDOFF.md](HANDOFF.md) → *Security*.
- `.gitignore` blocks `credentials.json` / `token.json` / `.env` patterns permanently.
