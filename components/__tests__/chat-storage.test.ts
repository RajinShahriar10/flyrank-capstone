import { describe, expect, it } from "vitest";
import {
  parseStoredMessages,
  serializeStoredMessages,
  storedToUIMessages,
} from "@/lib/chat-storage";

describe("chat-storage", () => {
  const messages = [
    {
      id: "1",
      role: "user",
      parts: [{ type: "text", text: " Hi CraftUI " }],
    },
    {
      id: "2",
      role: "assistant",
      parts: [
        { type: "text", text: "Hello " },
        { type: "text", text: "there." },
      ],
    },
  ] as Parameters<typeof serializeStoredMessages>[0];

  it("serializes only user/assistant text parts", () => {
    const stored = JSON.parse(serializeStoredMessages(messages)) as unknown[];
    expect(stored).toHaveLength(2);
    expect((stored[1] as { role: string }).role).toBe("assistant");
    expect((stored[1] as { text: string }).text).toBe("Hello there.");
  });

  it("drops empty and non-text messages from storage", () => {
    const withJunk = [
      ...messages,
      { id: "3", role: "system", parts: [{ type: "text", text: "skip" }] },
      { id: "4", role: "assistant", parts: [{ type: "text", text: "" }] },
    ] as Parameters<typeof serializeStoredMessages>[0];
    const stored = JSON.parse(serializeStoredMessages(withJunk)) as unknown[];
    expect(stored).toHaveLength(2);
  });

  it("round-trips through parse and rebuilds UIMessages", () => {
    const raw = serializeStoredMessages(messages);
    const parsed = parseStoredMessages(raw);
    const rebuilt = storedToUIMessages(parsed);

    expect(parsed).toHaveLength(2);
    expect(rebuilt[1].role).toBe("assistant");
    const text = rebuilt[1].parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("");
    expect(text).toBe("Hello there.");
  });

  it("returns [] for null, empty, and malformed input", () => {
    expect(parseStoredMessages(null)).toEqual([]);
    expect(parseStoredMessages("")).toEqual([]);
    expect(parseStoredMessages("{not json")).toEqual([]);
    expect(parseStoredMessages('"a string"')).toEqual([]);
    expect(parseStoredMessages('[{"id":1,"role":"user"}]')).toEqual([]);
  });
});