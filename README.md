# CraftUI

A full-stack web application built with [Next.js](https://nextjs.org) (App Router), React, and TypeScript — the capstone project for the Frontend AI Engineering track at FlyRank.

## Stack

- **Framework:** Next.js (App Router)
- **UI:** React + TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Next.js API Route Handlers (`app/api/*`)
- **Hosting:** Vercel (single project serves frontend + serverless API)

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Live preview

Deployed on Vercel from the `main` branch; every push also builds an isolated preview URL.

**Production preview:** https://craftui-capstone.vercel.app

## Screens

| Route | Screen | Notes |
| --- | --- | --- |
| `/` | Home | Landing with links to every screen |
| `/tasks` | Task manager | Add/toggle/delete tasks, filters, localStorage persistence |
| `/settings` | Settings | Profile form with zod validation |
| `/profile` | Profile | Placeholder |
| `/health` | Health check | Renders live data fetched from `/api/health` |
| `/playground` | Playground | Hand-built modal/tabs/disclosure next to shadcn/ui equivalents; keyboard-only e2e |
| `/stream` | AI chat | Token-by-token streaming chat with Gemini via the Vercel AI SDK, with two server tools rendered as real components |
| `/microinteractions` | Buttons with a Brain | Stateful button demo (FE-AA1): idle → loading → success/error lifecycle with forced-outcome triggers |
| `/3d` | 3D product studio | React Three Fiber product stage (FE-AA2): orbit/zoom, tap-to-select parts, material configurator; lazy-loaded with reduced-motion fallback |
| `/hero` | Signature hero | Fullscreen aurora fragment shader (FE-AA3) with headline overlay; `u_time`/`u_resolution`/`u_mouse`, DPR capped, pauses when hidden, `prefers-reduced-motion` falls back to a static gradient |

## Tool contract (`/stream`)

The chat model has access to two tools (full Zod schemas in `lib/ai/tool-schemas.ts`,
definitions in `lib/ai/tools.ts`). Schemas are shared between the server route and the
client tool-result components, so a rendered shape is always validated against the
server's declared contract.

| Tool | Purpose | Input | Output |
| --- | --- | --- | --- |
| `scoreFeature` | Evaluates a real CraftUI feature | `feature` (`'task-manager'` \| `'settings-form'` \| `'health-check'` \| `'a11y-playground'` \| `'streaming-chat'`), optional `flaky` (`boolean`, simulates a failure to show the designed error state) | `{ feature, score (0–100), verdict ('excellent'\|'good'\|'needs-work'), summary, strengths[], gaps[] }` — rendered as the **ScoreCard** component |
| `clearConversation` | Requests confirmation before clearing chat history | `reason` (string, 1–140 chars) | `{ status: 'needs_confirmation', message, remainingMessages }` — rendered as a **confirm/cancel card**; clearing happens client-side only |

Tool parts render as distinct cards for each AI SDK state: *input-streaming*, *input-available*,
*output-available*, and *output-error*.

## Testing (FE-09)

Tests are the contract for verified AI-assisted changes. Every component is
queried the way a user queries the page (role/label, never test IDs), the AI
route is always mocked at the transport boundary (`@ai-sdk/react` in Vitest,
`page.route` in Playwright) so the real Gemini API is never called, and
`npm run lint`, `npm run build`, `npm run test` and `npm run e2e` all run in
CI on push and block the merge.

- `components/__tests__/chat.test.tsx` — the highest-risk UI: empty, pending,
  streaming, stop, error and retry states.
- `components/__tests__/settings-form.test.tsx`, `task-form.test.tsx` — validated
  forms (zod, `noValidate`, a11y attributes).
- `components/__tests__/tool-panel.test.tsx` — tool-result component across every
  tool-part state.
- `e2e/chat-error.spec.ts` (mock-served failure → retry) and `e2e/chat.spec.ts`
  (primary chat flow) cover the primary flow end-to-end.

## Repository layout

```
app/          Next.js App Router pages and routes
app/api/      API Route Handlers (Vercel serverless functions)
components/   Reusable React components (client components only where needed)
e2e/          Playwright tests (responsive + keyboard-only accessibility)
playground/   Hand-built ARIA component implementations and notes
components/ui shadcn/ui registry components (Radix-powered dialog/tabs)
lib/ai       LLM config, tool definitions, and shared tool schemas (server + client)
types/       Shared TypeScript contracts between UI and API
```

See [CLAUDE.md](CLAUDE.md) for the full stack and conventions.

## Project status

## Env vars

See [.env.example](.env.example). `GOOGLE_GENERATIVE_AI_API_KEY` is required for `/stream`
(the server route handler reads it; it never reaches the browser). Get a free key at
https://aistudio.google.com/apikey — no billing required.

> **Week 6 · FE-06 streaming AI chat** — Gemini-powered conversation via the
> AI SDK (`app/api/chat` + `components/chat.tsx`): token-by-token streaming,
> Stop mid-stream, localStorage persistence, and bottom-pinned auto-scroll
> with a jump-to-latest affordance.
>
> **FE-07 tool results & structured output** — `scoreFeature` (typed Zod input,
> deterministic output) renders as a bespoke score card; `clearConversation` is
> a user-interaction tool with a confirmation card; every tool-part state has a
> distinct, designed treatment including a failure card.
>
> **FE-AA2 First 3D experience** — `/3d` renders a staged product scene in
> React Three Fiber: orbit/zoom, tap-to-select any of four parts, and a
> configurator that restyles the material (color, metalness, roughness,
> wireframe) plus auto-rotate speed. **Perf note:** the scene is entirely
> procedural primitives — no external GLB/DRACO bytes — and the whole Three.js
> stack is dynamic-imported only after clicking "Launch 3D studio", so the page
> shell never pays for it. The canvas caps pixel ratio at 2 and keeps the scene
> to a handful of meshes, one shadow-casting light and a cursor light. It also
> respects `prefers-reduced-motion` and a WebGL support check with a static
> fallback card. **With more time:** load a real DRACO-compressed GLB with a
> drag-and-drop viewer, add env-mapped reflections via drei `<Environment>`, and
> report live FPS in the corner (FE-10 lens).
>
> **FE-AA3 Signature hero** — `/hero` is a fullscreen personalised aurora painted
> by a hand-written fragment shader (`signature-hero-scene.tsx`). All three core
> uniforms are wired: `u_time` drives slow-scrolling noise, `u_resolution` keeps
> the field aspect-correct on every viewport, and `u_mouse` gently leans the flow
> toward the cursor while placing a soft glow under the pointer. The palette is a
> brand-remixed ramp (deep indigo → indigo → violet accent) with a film-grain pass
> on top and a vignette that keeps overlaid text readable. **Perf fallback:** DPR is
> capped at 1.75, the timeline pauses when the tab is hidden (`document.hidden`),
> and `prefers-reduced-motion` or missing WebGL swap the canvas for a static
> gradient in the same palette so the headline still shows.
>
> **FE-AA1 Buttons with a Brain** — `components/stateful-button.tsx` choreographs
> idle → hover/focus → loading → success/error → back to idle with a fixed-width
> FSM and transform/opacity-only transitions (220ms easeOutQuint entrances,
> 120ms ease-in exits, 900ms success hold, 400ms error shake). Spam-click safe,
> keyboard focused with a visible ring, and `prefers-reduced-motion` drops motion
> but never feedback. Demo page `/microinteractions` ships forced success/error
> triggers.
>
> **FE-08 error, empty & edge states** — mid-stream failure renders a designed
> error banner with a "Retry last message" that re-runs only the interrupted
> reply (double-click safe) plus Dismiss; route-level error boundaries in
> `app/error.tsx` / `app/stream/error.tsx`; a layout-matched thinking skeleton;
> first-run empty state with click-to-fill suggestions; and mobile Safari fixes
> (`dvh` height, `overscroll-contain`). Automated sabotage covered in
> `e2e/chat-error.spec.ts`.
>
> **Week 5 · FE-05 accessible component fundamentals** — hand-built modal,
> tabs, and disclosure (W3C APG patterns) with keyboard-only Playwright
> coverage and a playground comparing against shadcn/ui's Radix dialog/tabs.