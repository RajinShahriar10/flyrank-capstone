# CraftUI — Capstone Submission

**Track:** Frontend AI Engineering · **Week 8:** Ship It — Your First Production AI Product
**Live:** https://craftui-capstone.vercel.app
**Repository:** https://github.com/RajinShahriar10/flyrank-capstone (branch `main`)

---

## 1. Project Brief

CraftUI is a small, complete, production-deployed web product that proves a frontend
engineer can take an idea from accessible component to shipping, hardened AI API in eight
weeks. It answers a simple, real problem for two audiences at once: for the **intern**
behind it, it is the evidence trail of the whole track — a live portfolio where every
feature (accessible widgets, AI chat, 3D, custom shaders) was built, tested, and deployed
through deliberate human-AI collaboration rather than as a toy; for **anyone evaluating,
hiring, or onboarding that intern**, it is a working app they can click around in minutes
and a README they can run locally in under five. The AI is not a gimmick chat box: the
chat answers questions about the project itself and, through the `scoreFeature` tool,
returns structured, deterministic evaluations of real app features — an honest, useful
way to interrogate a portfolio ("how good is your task manager, and why?") that a generic
assistant could not answer truthfully on its own.

Why this idea: the product *is* the work. Instead of inventing a fake CRM that needs a
fake AI assistant, the app wraps the actual capstone deliverables in a real UI (task
manager, settings, playground, 3D studio, chat, shader hero) with one genuine AI surface
that adds value rather than toast.

---

## 2. Live, deployed application

**URL:** https://craftui-capstone.vercel.app

- **Functional, not a mockup.** Full-stack Next.js on Vercel — one project serves the
  UI and the serverless API routes. Verified live: `/api/health` returns 200; `/api/chat`
  streams real Gemini replies (parts-shaped AI SDK payload → token stream, tested against
  production); input caps return 413 as designed.
- **Accessible (WCAG 2.1 AA).** Lighthouse **Accessibility 100** and axe **0 violations**
  on every audited page (see §6); keyboard-only primary flow verified end-to-end.

---

## 3. Repository with complete README

**Link:** https://github.com/RajinShahriar10/flyrank-capstone

`README.md` covers:
- **Setup & run:** `npm install && npm run dev` — one command each; optional `.env`
  from `.env.example` for the chat.
- **Architecture overview (§ "Architecture"):** route map of all screens, directory
  layout (`app/` pages + API, `components/`, `playground/`, `lib/ai`, `lib/security`,
  `e2e/`), the two decisions that shape the layout (Server Components by default,
  design tokens instead of hex), and the security of `/api/chat`.
- **AI integration explained (§ "Tool contract"):** model, system prompt, and the two
  Zod-validated tools the model can call.
- **Known limitations & future improvements** — consolidated in §4 below.
- **Scripts table, env table, testing conventions, shipping flow.**

Verification that a new dev can run it: `git clone … && npm install && npm run dev`
brings up the whole app including the API route handlers (no separate backend).

---

## 4. Known limitations & future improvements

| Area | Current limitation | Future improvement |
| --- | --- | --- |
| Chat history | Stored in localStorage only (per browser) | Server-side user accounts + persistent history |
| Rate limiting | In-memory, **per serverless instance** (documented trade-off) | Vercel WAF / Upstash global rate limiting |
| Tools | `scoreFeature` returns hand-written ground-truth scores, not live metrics | Connect to real analytics/telemetry for the app |
| “Clear conversation” | Confirmation card is client-side only | Persist the intent server-side |
| 3D studio | Procedural meshes only; no model import (GLB/GLTF) | Add drag-and-drop GLB upload with material preview |
| Task manager | No reordering, no server sync | Drag-to-reorder (FE-AA1 gap noted) + backend persistence |
| Settings | No avatar upload | File upload with client-side image optimization |
| Profile screen | Placeholder page | Filled in when user accounts ship (§3 bullet 1) |
| Tests | `signature-hero-scene` and `playground-demo` are WebGL/three-heavy and lack jsdom unit coverage (covered by Playwright instead) | Extract pure logic (uniform math, palette) into unit-testable modules |
| Monitoring | Health endpoint + Vercel dashboard; no alerting | Uptime alerting (e.g. external ping service) |

---

## 5. AI integration explained

The AI surface is the **streaming chat at `/stream`** (`app/api/chat` route,
`components/chat.tsx` UI). Integration is via the **Vercel AI SDK** (`ai`,
`@ai-sdk/google`) with **Google Gemini** (`gemini-3.6-flash`, overridable with
`GEMINI_MODEL`).

- **What the prompt is.** A short, factual system prompt (`lib/ai/chat.ts`) frames the
  assistant as the one embedded in CraftUI: it answers questions about the project, the
  accessibility work, and the tech stack; it is instructed to be concise (2–4 sentences),
  correct, and to drop the persona if asked. Nothing in the module is ever sent to the
  browser.
- **Why the model adds value (not a gimmick).** Two Zod-validated tools
  (`lib/ai/tools.ts`, schemas shared with the client in `lib/ai/tool-schemas.ts`):
  - `scoreFeature` — the model asks for a real feature (task manager, settings form,
    etc.) and receives a **deterministic, hand-written evaluation** (score/100, verdict,
    strengths, gaps) rendered as a bespoke **ScoreCard** component. This turns the chat
    from a parrot into a structured, truthful portfolio reviewer — a testable, shaped
    answer with a typed contract.
  - `clearConversation` — user-interaction tool: the model may only *ask* for
    confirmation; the destructive action happens client-side, so a misbehaving model can
    never erase anything.
  We chose **structured output** (AI SDK `tool` + Zod in, typed schema out) over raw
  text so we can render results faithfully and validate every surface of the contract
  (FE-07 lesson applied).
- **Resilience & error states.** Every state of a tool part and of the stream
  (input-streaming, input-available, output-available, **output-error**) has a designed
  treatment; a mid-stream failure renders an error banner with a double-click-safe
  retry; error boundaries exist at app and route level (`app/error.tsx`). All tests mock
  the AI at the transport boundary — the real API is never called during CI.
- **Abuse defence.** The route is server-side, `runtime = "nodejs"`, `maxDuration = 60`,
  and is protected by a 20 req/IP/60s in-memory limiter plus hard input caps (12k
  chars/message, 80k total) so even a limiter bypass can only burn bounded credits.

---

## 6. Testing & audits

### Unit tests — Vitest + React Testing Library
- **75 tests / 14 files, all passing.** Coverage (`npm run test:coverage`) across
  `components/` + `lib/`: **64.6% statements/lines, 86.3% branches, 82% functions** —
  comfortably above the ≥50% component bar.
- High-value components are the most covered: `chat.tsx` (87%), `settings-form.tsx`
  (99%), `task-form` / `task-list` / `score-card` (100%), `stateful-button.tsx` (98%),
  `site-nav.tsx` (100%). Coverage is measured with `@vitest/coverage-v8` (**`text` +
  `html` reporters**), the HTML report is regenerated locally at `coverage/index.html`.
  The remaining 0% spots are WebGL/three.js scene components exercised by Playwright
  instead.
- Conventions (per learned form/a11y rules): query by role/label, `noValidate` forms
  with RHF+zod, `aria-invalid`/`aria-describedby`, `role="status"` messages, focus to
  the first invalid field on a failed submit.

### End-to-end — Playwright (4 projects)
- **132 tests / 7 specs, all passing** — Chromium, Firefox, WebKit desktop, and WebKit
  mobile (Safari); screens load without horizontal overflow at 375px and 1280px;
  keyboard-only coverage of the playground; mocked-chat success, error, and retry flows;
  WebGL specs gate on actual engine support (headless Firefox reports no WebGL → assert
  the designed fallback instead).
- **CI evidence** (healthy on `main` after PR #16): green run
  https://github.com/RajinShahriar10/flyrank-capstone/actions/runs/35003560445

### Performance & accessibility audit
Full report: **`AUDIT.md`** (Lighthouse 12.8.2 mobile preset + axe-core + keyboard-only
pass against the live URL), before/after screenshots in-repo (`lh-before-*.png`,
`lh-after-*.png`).

| Metric | Before | After |
| --- | --- | --- |
| Accessibility | 95–96 | **100** (all pages) |
| Best Practices | 96 | **100** |
| Performance | 97–99 | 97–99 (CLS 0, TBT < 200 ms) |
| axe violations | contrast, landmarks, ARIA | **0** |
| __One concrete improvement from the audit:__ raised nav-link contrast from **4.46:1 to ~7.2:1** (`bg-brand-500 → bg-brand-600`), fixed the missing-favicon console error, deduplicated `<main>`, and corrected `tablist`/`tabpanel` nesting — moving a11y 95→100 with zero violations. | | |

---

## 7. Deployment & operation

### Deployment checklist (signed off 2026-09-15)

| # | Item | Status |
| --- | --- | --- |
| 1 | Vercel project connected to GitHub (`main` = Production, PRs = Preview) | ✅ |
| 2 | Env vars set in Production **and** Preview: `GOOGLE_GENERATIVE_AI_API_KEY`, `NEXT_PUBLIC_APP_URL`; `GEMINI_MODEL` optional | ✅ |
| 3 | Route handlers configured: Node.js runtime, `maxDuration = 60` | ✅ |
| 4 | CI gate: `npm run lint`, `npm run build`, `npm run test`, `npm run e2e` on push/PR, installs Chromium+Firefox+WebKit, uploads Playwright artifacts on failure | ✅ |
| 5 | Cross-browser E2E passes on the merge commit (132/132) | ✅ |
| 6 | Production deploy verified after merge: `/api/health` 200; `/api/chat` streams (parts payload); caps → 413 | ✅ |
| 7 | `.env.example` documents every variable; nothing secret committed | ✅ |
| 8 | Secrets never logged or sent to the browser (server-only reads) | ✅ |

**Signed off by:** MD. Rajin Shahriar (2026-09-15) · **Sequence:** feature branch →
PR → CI + Vercel preview → squash-merge → auto-deploy from `main`.

### How it fails safely (error states present, not imagined)
- `/api/chat` missing key → **503 with JSON message**; rate-limited → **429 + Retry-After**;
  over the caps → **400/413**; tool failure → designed output-error card; stream failure
  mid-flight → **error banner + double-click-safe "Retry last message"**; route-error
  boundaries render a layout-matched screen instead of crashing the shell.
- `/health` is a live liveness check with pass/fail UI; chat empty state, task empty
  state, 3D reduced-motion/WebGL fallbacks, and shader static-gradient fallback are all
  designed and E2E-covered.

### Rollback & monitoring
- **Rollback:** push/merge to `main` redeploys instantly; reverting is `git revert` of
  the offending merge then redeploy from `main` (Vercel keeps previous production
  deployments selectable for point-and-click rollback). Nothing is stateful server-side
  except the in-memory rate-limit window, so rollback is clean.
- **Monitoring:** `https://craftui-capstone.vercel.app/api/health` (status, uptime,
  region, node version) + Vercel Analytics/Dashboard (runtime logs, function duration,
  cold starts, errors). Documented next step: external uptime alerting.

---

## 8. Reflection (≤ 1 page)

**What was hardest?** Getting the streaming chat to behave like a real product, not a
demo. That meant: a deterministic, typed tool-contract that the model could not break
(Zod in, schema out) and a full catalog of states (streaming, tool-input/output/error,
mid-stream failure, retry, empty, edge). The retry flow especially — a misclick or double
click can re-send a pending message; making retry double-click-safe and covering it in
tests took far longer than the happy path. Second: the last-mile *verification* work for
FE-11. Cross-browser CI kept failing not because the app was wrong but because
**headless Firefox on CI has no WebGL** — the app was correctly rendering its static
fallback while the test demanded a canvas. That forced me to learn that a "flaky test"
can actually be an honest test of a real environment gap; the fix was to gate assertions
on engine capability rather than to paper over the failure with timeouts.

**What would you do differently next time?** (1) Add coverage measurement from the
start, not at the capstone deadline — I'd have written the `signature-hero-scene` pure
logic into separately testable modules instead of leaving a 0% WebGL file. (2) Build the
chat tool contract and error states before decorating the UI, so FE-07 didn't have to
retrofit structure onto a working stream. (3) Pin CI worker count and browser
capabilities earlier — the WebGL gating and `retries`/worker tuning arrived only after a
two-hour CI chase. (4) Iterate against real Lighthouse/axe from week one of a visual
feature, since contrast/nesting fixes are cheap when the component is new and expensive
when it's shipped.

**What surprised me?** How much of "production readiness" is about *not trusting the 
maybe*: the biggest real bug in the final stretch was that a hand-rolled "fill the chat
input then assert" E2E flaked because it wrote to a controlled React input *before React
hydrated* — so the framework wiped my own test's keystrokes. Fixing tests was never about
the app; it was about proving the *environment* is deterministic. The second surprise
was that the AI model itself was the most predictable part of the stack: given a strict
Zod schema and a constrained system prompt, its tool calls were rock-solid, while my own
test harness, CI runner, and WebGL detection — supposedly the boring parts — produced
nearly all the drama. I shipped slower than I expected, but the slow parts (rate limiting,
input caps, error states, honest tests, a checklist) are exactly what make this feel like
a product rather than a project.

---

*This file is part of the FE-11/Final capstone submission. Verification commands:
`npm run lint && npm run build && npm run test && npm run e2e` all green on `main`
(CI run 35003560445 green; unit coverage report via `npm run test:coverage`).*