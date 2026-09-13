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
- **Accessibility:** semantic HTML, alt text, and keyboard navigation.
- **Verification:** run `npm run lint` and `npm run build` before declaring a change complete.

## Guidance for AI assistants

- Read this file before making changes.
- Respect existing patterns; do not introduce a new framework or library without confirmation.
- Keep diffs minimal and scoped to the request.
- Never commit secrets; document env vars in `.env.example` only.