/* ---------- input caps ---------- */

export const MAX_MESSAGES = 60;
export const MAX_MESSAGE_CHARS = 12_000;
export const MAX_TOTAL_CHARS = 80_000;

export type PayloadError = { error: string; status: number };
export type GuardedPayload = { error: PayloadError } | { messages: unknown[] };

export function extractMessages(body: unknown): unknown[] {
  if (typeof body !== "object" || body === null) {
    return [];
  }
  return (body as { messages?: unknown }).messages as unknown[] ?? [];
}

/**
 * Reject payloads that are too large or structurally suspicious before the
 * prompt is even constructed. Every number here is a generous ceiling for
 * normal human chat; the point is to block bot-sized dumps and attacks that
 * would blow through Google AI credits if they reached the model.
 */
export function enforceInputCaps(messages: unknown[]): GuardedPayload {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { error: { error: "Send a non-empty messages array.", status: 400 } };
  }

  if (messages.length > MAX_MESSAGES) {
    return {
      error: {
        error: `Too many messages. Maximum per request is ${MAX_MESSAGES}.`,
        status: 413,
      },
    };
  }

  let totalChars = 0;

  for (const msg of messages) {
    if (typeof msg !== "object" || msg === null) {
      return { error: { error: "Each message must be an object.", status: 400 } };
    }

    const record = msg as Record<string, unknown>;
    // Measure what will actually reach the model, in both shapes the client
    // can produce: the legacy `content` string or the AI SDK `parts` array.
    let text = "";
    if (typeof record.content === "string") {
      text = record.content;
    } else {
      const parts = record.parts;
      if (Array.isArray(parts)) {
        for (const part of parts) {
          const p = part as Record<string, unknown> | null;
          if (typeof p?.text === "string") {
            text += p.text;
          }
        }
      }
    }

    if (text.length > MAX_MESSAGE_CHARS) {
      return {
        error: {
          error: `A message exceeds the ${MAX_MESSAGE_CHARS.toLocaleString()} character limit.`,
          status: 413,
        },
      };
    }
    totalChars += text.length;
  }

  if (totalChars > MAX_TOTAL_CHARS) {
    return {
      error: {
        error: `Total request body exceeds the ${MAX_TOTAL_CHARS.toLocaleString()} character limit.`,
        status: 413,
      },
    };
  }

  return { messages };
}