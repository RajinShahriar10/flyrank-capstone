# FlyRank Capstone

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

**Production preview:** https://flyrank-capstone-blue.vercel.app

## Screens

| Route | Screen | Notes |
| --- | --- | --- |
| `/` | Home | Landing with links to every screen |
| `/tasks` | Task manager | Add/toggle/delete tasks, filters, localStorage persistence |
| `/settings` | Settings | Profile form with zod validation |
| `/profile` | Profile | Placeholder |
| `/health` | Health check | Renders live data fetched from `/api/health` |

## Repository layout

```
app/          Next.js App Router pages and routes
app/api/      API Route Handlers (Vercel serverless functions)
components/   Reusable React components (client components only where needed)
e2e/          Playwright smoke tests (responsive at 375px and 1280px)
types/        Shared TypeScript contracts between UI and API
```

See [CLAUDE.md](CLAUDE.md) for the full stack and conventions.

## Project status

> **Week 3 · Skeleton deployed** — routed screens, design tokens, health check, and git-connected Vercel previews.