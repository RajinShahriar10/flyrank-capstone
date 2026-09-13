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

## Repository layout

```
app/          Next.js App Router pages and routes
app/api/      API Route Handlers (Vercel serverless functions)
components/   Reusable React components
types/        Shared TypeScript contracts between UI and API
```

See [CLAUDE.md](CLAUDE.md) for the full stack and conventions.

## Project status

> **Week 1 · Setup** — repository scaffolding only. Application code lands in later weeks.