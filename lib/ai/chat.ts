/**
 * FE-06 — LLM configuration.
 *
 * Single source of truth for the chat model, sampling settings, and the
 * system prompt, used only by the server route handler (`app/api/chat`).
 * Nothing in this module is ever sent to the browser.
 */

/** Which Google AI model to use. Overridable via `GEMINI_MODEL` so the
 *  deployed value can be bumped without a code change (kept in sync in
 *  `.env.example`). */
export const CHAT_MODEL: string = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";

/** Sampling temperature: 0 = deterministic, 1 = creative. */
export const CHAT_TEMPERATURE = 0.7;

/** Hard cap on tokens per assistant reply. */
export const CHAT_MAX_TOKENS = 1024;

/**
 * System prompt for the qualification chat.
 *
 * The app is CraftUI — the capstone of the Frontend AI Engineering track.
 * The chat answers questions about the project, its accessibility work, and
 * the technologies behind it. Keep the persona short and factual; being
 * asked "who built this" or "what tech is this" is the expected use case.
 */
export const CHAT_SYSTEM_PROMPT = [
  "You are the assistant embedded in CraftUI, a capstone web app built by an intern",
  "on the Frontend AI Engineering track.",
  "",
  "CraftUI is a full-stack Next.js (App Router) application in TypeScript with Tailwind",
  "CSS, deployed on Vercel. Features: a task manager with localStorage persistence,",
  "a zod-validated settings form, an API health check, and an accessible-component",
  "playground comparing hand-built ARIA widgets (modal, tabs, disclosure) with",
  "shadcn/ui's Radix-powered equivalents.",
  "",
  "Answer questions about CraftUI, accessibility patterns (W3C ARIA Authoring",
  "Practices), React, and general web development. Be concise (2-4 sentences unless",
  "a longer answer is clearly needed), correct, and drop the persona if asked to do",
  "so.",
].join("\n");