# CLAUDE.md

Capstone project for the Frontend AI Engineering track. A full-stack Next.js application hosted entirely on Vercel. This file documents the stack and conventions for AI-assisted development.

## Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript (strict mode, no `any`)
- **UI:** React with Tailwind CSS
- **Backend:** Next.js Route Handlers in `app/api/*` (deployed as Vercel serverless functions)
- **Package manager:** npm
- **Testing:** Vitest + React Testing Library (unit), Playwright (E2E)
- **Linting/formatting:** ESLint (`next/core-web-vitals`) + Prettier
- **Hosting:** Vercel — one project serves frontend and API

## Commands

- `npm install` — install dependencies
- `npm run dev` — start dev server on http://localhost:3000
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run test` — unit tests (Vitest)
- `npm run e2e` — Playwright tests

## Conventions

- **Commits:** Conventional Commits 1.0.0. Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`, `build`, `ci`, `perf`. Optional scope, e.g. `feat(api): ...`.
- **Branching:** short-lived feature branches off `main`, merged via PR.
- **Components:** co-locate under `components/`; one component per file; default exports for pages, named exports for components.
- **Types:** shared types in `types/`; reuse a single contract between frontend and API route handlers.
- **Styling:** Tailwind utilities only; no inline styles.
- **Design tokens:** Tailwind v4 CSS-first tokens in `app/globals.css` (`--color-brand-*`, `--color-ink`, `--color-paper`) — reference tokens, never raw hex values.
- **Server/client split (FE-04):** Server Components by default. A component becomes `"use client"` only for interactivity — forms (RHF), `usePathname` (nav), list state. Route map lives in `README.md`; `app/api/health` is the reference API handler.
- **E2E:** Playwright in `e2e/` — screens load without horizontal overflow at 375px and 1280px; run `npm run e2e`.
- **Accessibility:** semantic HTML, alt text, and keyboard navigation.
- **Verification:** run `npm run lint` and `npm run build` before declaring a change complete.

## Guidance for AI assistants

- Read this file before making changes.
- Respect existing patterns; do not introduce a new framework or library without confirmation.
- Keep diffs minimal and scoped to the request.
- Never commit secrets; document env vars in `.env.example` only.

## Form conventions (learned in FE-03)

- All forms use `react-hook-form` + `zod` with `zodResolver`, and the `<form>` sets `noValidate` so custom errors own the UI. Hand-rolled `useState`/`onChange` form state fails review.
- Normalize user text at parse time in the zod schema — `trim()` names, `trim()` + `toLowerCase()` emails — never in a separate handler after the fact.
- Every error-emitting control needs `aria-invalid` and an `aria-describedby` pointing at its labelled error; failed submissions focus the first invalid field. A form without these fails review.
- Ephemeral save/status messages use `role="status"` and clear once the user edits again.
- New features ship with Vitest + RTL tests covering validation, the success path, and accessibility (labels, focus, `role`); `npm run test` must pass before a change is complete.