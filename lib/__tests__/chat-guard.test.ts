import { describe, expect, it } from "vitest";
import {
  MAX_MESSAGE_CHARS,
  MAX_MESSAGES,
  MAX_TOTAL_CHARS,
  enforceInputCaps,
  extractMessages,
} from "@/lib/security/chat-guard";

function message(content: string) {
  return { id: "m-1", role: "user", parts: [{ type: "text", text: content }], content };
}

describe("chat input caps", () => {
  it("rejects an empty message list", () => {
    const result = enforceInputCaps([]);
    if ("error" in result) {
      expect(result.error.status).toBe(400);
      expect(result.error.error).toContain("non-empty");
    } else {
      throw new Error("expected an error");
    }
  });

  it("rejects more than the message ceiling", () => {
    const result = enforceInputCaps(Array.from({ length: MAX_MESSAGES + 1 }, () => message("hi")));
    if ("error" in result) {
      expect(result.error.status).toBe(413);
      expect(result.error.error).toContain("Too many messages");
    } else {
      throw new Error("expected an error");
    }
  });

  it("rejects a single oversized message", () => {
    const result = enforceInputCaps([message("a".repeat(MAX_MESSAGE_CHARS + 1))]);
    if ("error" in result) {
      expect(result.error.status).toBe(413);
      expect(result.error.error).toContain("character limit");
    } else {
      throw new Error("expected an error");
    }
  });

  it("counts parts-only payloads (the real client shape)", () => {
    const oversized = {
      id: "m-1",
      role: "user",
      parts: [{ type: "text", text: "z".repeat(MAX_MESSAGE_CHARS + 1) }],
    };
    const result = enforceInputCaps([oversized]);
    if ("error" in result) {
      expect(result.error.status).toBe(413);
    } else {
      throw new Error("expected an error");
    }

    const heavy = Array.from(
      { length: Math.ceil(MAX_TOTAL_CHARS / MAX_MESSAGE_CHARS) + 1 },
      () => ({
        id: "m-x",
        role: "user",
        parts: [{ type: "text", text: "q".repeat(MAX_MESSAGE_CHARS) }],
      }),
    );
    const total = enforceInputCaps(heavy);
    if ("error" in total) {
      expect(total.error.status).toBe(413);
    } else {
      throw new Error("expected an error");
    }
  });

  it("rejects a total size over the combined ceiling", () => {
    const chunk = message("b".repeat(MAX_MESSAGE_CHARS));
    const result = enforceInputCaps(Array.from({ length: Math.ceil(MAX_TOTAL_CHARS / MAX_MESSAGE_CHARS) + 1 }, () => chunk));
    if ("error" in result) {
      expect(result.error.status).toBe(413);
    } else {
      throw new Error("expected an error");
    }
  });

  it("passes a normal conversation through untouched", () => {
    const payload = [
      message("What is CraftUI?"),
      message("Tell me about the task manager."),
    ];
    const result = enforceInputCaps(payload);
    if ("messages" in result) {
      expect(result.messages).toEqual(payload);
    } else {
      throw new Error("expected success");
    }
  });

  it("extracts messages from a request body", () => {
    const messages = [message("hello")];
    expect(extractMessages({ messages })).toEqual(messages);
    expect(extractMessages(null)).toEqual([]);
    expect(extractMessages({})).toEqual([]);
  });
});