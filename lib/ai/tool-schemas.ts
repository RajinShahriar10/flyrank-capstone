/** FE-07 — chunk the zod schemas and types that both the server route (tool
 *  definitions) and the client (tool-result rendering) depend on. Keep this
 *  module free of server-only imports (zod only) so the browser bundle stays
 *  lean. */
import { z } from "zod";

export const FEATURE_IDS = [
  "task-manager",
  "settings-form",
  "health-check",
  "a11y-playground",
  "streaming-chat",
] as const;
export type FeatureId = (typeof FEATURE_IDS)[number];

export const scoreFeatureInputSchema = z.object({
  feature: z
    .enum(FEATURE_IDS)
    .describe("The real CraftUI feature to evaluate."),
  flaky: z
    .boolean()
    .optional()
    .describe(
      "Simulate a backend failure so the UI can demonstrate its designed error state.",
    ),
});
export type ScoreFeatureInput = z.infer<typeof scoreFeatureInputSchema>;

export const scoreFeatureOutputSchema = z.object({
  feature: z.string(),
  score: z.number().min(0).max(100),
  verdict: z.enum(["excellent", "good", "needs-work"]),
  summary: z.string(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
});
export type ScoreFeatureOutput = z.infer<typeof scoreFeatureOutputSchema>;

export const clearConversationInputSchema = z.object({
  reason: z
    .string()
    .min(1)
    .max(140)
    .describe("Why the user wants to start a fresh conversation."),
});
export type ClearConversationInput = z.infer<typeof clearConversationInputSchema>;

export const clearConversationOutputSchema = z.object({
  status: z.literal("needs_confirmation"),
  message: z.string(),
  remainingMessages: z.number().int().min(0),
});
export type ClearConversationOutput = z.infer<typeof clearConversationOutputSchema>;