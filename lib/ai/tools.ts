/** FE-07 — tool definitions for the chat model. These run only inside the
 *  server route handler (`app/api/chat`), never on the client. The schemas'
 *  counterparts are shared with the client through `lib/ai/tool-schemas.ts`. */
import { tool } from "ai";
import {
  clearConversationInputSchema,
  clearConversationOutputSchema,
  scoreFeatureInputSchema,
  scoreFeatureOutputSchema,
  type ClearConversationOutput,
  type FeatureId,
  type ScoreFeatureOutput,
} from "@/lib/ai/tool-schemas";

/** Deterministic, hand-written evaluations of the five real CraftUI features
 *  the assistant can be asked about (FE-07). Scores are ground truth, not ML
 *  output, so the tool-result card can always be rendered faithfully. */
const FEATURE_SCORES: Record<FeatureId, ScoreFeatureOutput> = {
  "task-manager": {
    feature: "Task manager",
    score: 92,
    verdict: "excellent",
    summary:
      "Local-persistence task tracking with live filtering and a complete add/toggle/delete loop.",
    strengths: [
      "Tasks survive reloads via localStorage",
      "All / Active / Completed filters",
      "Empty and completed states both accessible",
    ],
    gaps: ["No drag-to-reorder yet"],
  },
  "settings-form": {
    feature: "Settings form",
    score: 95,
    verdict: "excellent",
    summary:
      "Zod-validated preferences form with server-style error presentation and instant saves.",
    strengths: [
      "react-hook-form + zod validation",
      "aria-invalid with focused first error",
      "A11y-correct save/status announcements",
    ],
    gaps: ["No avatar upload yet"],
  },
  "health-check": {
    feature: "API health check",
    score: 88,
    verdict: "good",
    summary:
      "Live ping to the health endpoint with a clear pass/fail presentation and refresh.",
    strengths: [
      "Real API round-trip reported",
      "Failure state explicitly designed",
      "Secondary action refreshes the check",
    ],
    gaps: ["No uptime history chart"],
  },
  "a11y-playground": {
    feature: "A11y playground",
    score: 90,
    verdict: "excellent",
    summary:
      "Side-by-side hand-built and shadcn/ui widgets matched against the ARIA APG examples.",
    strengths: [
      "Modal, tabs, and disclosure patterns",
      "Keyboard-only, scriptable E2E coverage",
      "Compiles to a pre-release APG checklist",
    ],
    gaps: ["Vertical tabs miss a focus-visible cue"],
  },
  "streaming-chat": {
    feature: "Streaming chat",
    score: 85,
    verdict: "good",
    summary:
      "Token-by-token chat over the Anthropic API with mid-stream stop and autoscroll.",
    strengths: [
      "True streaming with a Stop control",
      "Local history survives reloads",
      "Bottom-pinned autoscroll that respects scroll-up",
    ],
    gaps: ["History is browser-local only"],
  },
};

export const chatTools = {
  /** Primary FE-07 tool: returns a structured evaluation of a real CraftUI
   *  feature, rendered on the client as a custom score card component. */
  scoreFeature: tool({
    description:
      "Return a hand-written evaluation of one of CraftUI's real features: a score out of 100, a verdict, a one-line summary, strengths, and gaps. Use when the user asks to evaluate, score, or review a feature of this app.",
    inputSchema: scoreFeatureInputSchema,
    outputSchema: scoreFeatureOutputSchema,
    execute: (input): ScoreFeatureOutput => {
      if (input.flaky === true) {
        throw new Error("Upstream scoring service unreachable (simulated failure).");
      }
      return FEATURE_SCORES[input.feature];
    },
  }),

  /** User-interaction tool: the model asks the user to confirm clearing the
   *  conversation; the actual clear happens client-side (localStorage +
   *  useChat state) so a model agreeing fraudulently can never destroy anything. */
  clearConversation: tool({
    description:
      "Ask the user to confirm that they want to erase the current conversation before it happens. Use when the user asks to clear, reset, wipe, or start over the chat. Do not clear anything directly.",
    inputSchema: clearConversationInputSchema,
    outputSchema: clearConversationOutputSchema,
    execute: (input, { messages }): ClearConversationOutput => ({
      status: "needs_confirmation",
      message: input.reason,
      remainingMessages: messages.filter((message) => message.role === "user").length,
    }),
  }),
};

export type ChatTools = typeof chatTools;