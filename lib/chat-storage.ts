import type { TextUIPart, UIMessage } from "ai";

/**
 * Minimal persisted shape of a chat message — text-only, no tools or
 * reasoning parts — safe to store in localStorage.
 */
export interface StoredChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

/** Parses raw localStorage JSON into valid stored messages, dropping junk. */
export function parseStoredMessages(raw: string | null): StoredChatMessage[] {
  if (raw === null || raw === "") {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter(
    (item): item is StoredChatMessage =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as { id?: unknown }).id === "string" &&
      ((item as { role?: unknown }).role === "user" ||
        (item as { role?: unknown }).role === "assistant") &&
      typeof (item as { text?: unknown }).text === "string",
  );
}

/** Serializes the full conversation (user + assistant text parts only). */
export function serializeStoredMessages(messages: readonly UIMessage[]): string {
  const stored: StoredChatMessage[] = [];

  for (const message of messages) {
    if (message.role !== "user" && message.role !== "assistant") {
      continue;
    }
    const text = message.parts
      .filter((part): part is TextUIPart => part.type === "text")
      .map((part) => part.text)
      .join("");
    if (text === "") {
      continue;
    }
    stored.push({ id: message.id, role: message.role, text });
  }

  return JSON.stringify(stored);
}

/** Rebuilds UIMessage[] from stored messages for `useChat`'s messages init. */
export function storedToUIMessages(stored: StoredChatMessage[]): UIMessage[] {
  return stored.map((message) => ({
    id: message.id,
    role: message.role,
    parts: [{ type: "text", text: message.text, state: "done" } satisfies TextUIPart],
  }));
}