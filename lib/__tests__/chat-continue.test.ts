import { describe, expect, it } from "vitest";
import type { UIMessage } from "ai";
import { shouldAutoContinueAfterTool } from "@/lib/chat-continue";

function textPart(text: string) {
  return { type: "text", text };
}

function toolPart(toolName: string, state: string) {
  return {
    type: `tool-${toolName}`,
    toolName,
    toolCallId: "call-1",
    state,
    input: {},
    output: {},
  };
}

function message(role: "user" | "assistant", parts: unknown[]): UIMessage {
  return { id: `${role}-1`, role, parts: parts as UIMessage["parts"] };
}

describe("shouldAutoContinueAfterTool", () => {
  it("resumes when the last assistant message ends on a finished scoreFeature with no text", () => {
    const messages = [
      message("user", [textPart("How good is the task manager?")]),
      message("assistant", [toolPart("scoreFeature", "output-available")]),
    ];
    expect(shouldAutoContinueAfterTool(messages)).toBe(true);
  });

  it("does not auto-resume clearConversation, which waits for user confirmation", () => {
    const messages = [
      message("assistant", [toolPart("clearConversation", "output-available")]),
    ];
    expect(shouldAutoContinueAfterTool(messages)).toBe(false);
  });

  it("does not resume once a text summary is already present", () => {
    const messages = [
      message("assistant", [
        toolPart("scoreFeature", "output-available"),
        textPart("It scores 92/100."),
      ]),
    ];
    expect(shouldAutoContinueAfterTool(messages)).toBe(false);
  });

  it("only inspects the last message", () => {
    const messages = [
      message("assistant", [toolPart("scoreFeature", "output-available")]),
      message("user", [textPart("thanks")]),
    ];
    expect(shouldAutoContinueAfterTool(messages)).toBe(false);
  });

  it("ignores in-progress tool states", () => {
    const messages = [
      message("assistant", [toolPart("scoreFeature", "input-streaming")]),
    ];
    expect(shouldAutoContinueAfterTool(messages)).toBe(false);
  });

  it("caps runaway resubmissions", () => {
    const messages = [
      message("assistant", [toolPart("scoreFeature", "output-available")]),
    ];
    expect(shouldAutoContinueAfterTool(messages, 3)).toBe(false);
  });

  it("handles an empty conversation", () => {
    expect(shouldAutoContinueAfterTool([])).toBe(false);
  });
});