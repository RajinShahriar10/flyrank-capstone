import type { UIMessage } from "ai";

const MAX_AUTO_CONTINUATIONS = 3;

/** Decides whether the chat should automatically resume the model after a
 *  finished tool step.
 *
 *  When the model stops after a completed `scoreFeature` call, its
 *  natural-language summary has not been generated yet — the client must
 *  resubmit once (via `sendAutomaticallyWhen`) so Gemini turns the tool
 *  result into prose. `clearConversation` is deliberately excluded: it waits
 *  for an explicit user confirmation instead of auto-resuming.
 */
export function shouldAutoContinueAfterTool(
  messages: UIMessage[],
  attempts = 0,
): boolean {
  if (attempts >= MAX_AUTO_CONTINUATIONS) {
    return false;
  }
  const last = messages[messages.length - 1];
  if (!last || last.role !== "assistant") {
    return false;
  }
  let finishedScore = false;
  let hasText = false;
  for (const part of last.parts) {
    if (part.type === "text") {
      if (part.text.length > 0) {
        hasText = true;
      }
    } else {
      const tool = part as { toolName?: string; state?: string };
      if (tool.toolName === "scoreFeature" && tool.state === "output-available") {
        finishedScore = true;
      }
    }
  }
  return finishedScore && !hasText;
}