import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  ToolPanel,
  asToolInvocation,
  type ToolInvocationLike,
} from "@/components/tool-panel";

function invocation(overrides: Partial<ToolInvocationLike>): ToolInvocationLike {
  return {
    toolName: "scoreFeature",
    toolCallId: "call-1",
    state: "output-available",
    input: undefined,
    output: undefined,
    errorText: undefined,
    ...overrides,
  };
}

const SCORE_OUTPUT = {
  feature: "Task manager",
  score: 92,
  verdict: "excellent",
  summary: "Local-persistence task tracking with live filtering.",
  strengths: ["Tasks survive reloads via localStorage"],
  gaps: ["No drag-to-reorder yet"],
};

describe("ToolPanel", () => {
  it("renders a running card while the model is still streaming tool inputs", () => {
    render(
      <ToolPanel invocation={invocation({ state: "input-streaming", input: {} })} />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(/running tool/i);
    expect(screen.getByRole("status")).toHaveTextContent(/waiting for the model/i);
  });

  it("renders a distinct card showing the resolved inputs once input is available", () => {
    render(
      <ToolPanel
        invocation={invocation({
          state: "input-available",
          input: { feature: "task-manager" },
        })}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(/feature: task-manager/i);
  });

  it("renders the score card component for scoreFeature output", () => {
    render(
      <ToolPanel
        invocation={invocation({
          state: "output-available",
          input: { feature: "task-manager" },
          output: SCORE_OUTPUT,
        })}
      />,
    );

    expect(screen.getByText("Task manager")).toBeInTheDocument();
    expect(screen.getByText("excellent")).toBeInTheDocument();
    expect(screen.getByText("92")).toBeInTheDocument();
    expect(screen.getByText(/survive reloads/i)).toBeInTheDocument();
    expect(screen.queryByText(/NO DRAG/i)).toBeInTheDocument();
  });

  it("falls back to a designed empty card when tool output does not match the contract", () => {
    render(
      <ToolPanel
        invocation={invocation({
          state: "output-available",
          output: { not: "the contract" },
        })}
      />,
    );

    expect(screen.getByText(/unexpected shape/i)).toBeInTheDocument();
  });

  it("renders the designed error card with the error text on output-error", () => {
    render(
      <ToolPanel
        invocation={invocation({
          state: "output-error",
          errorText: "Upstream scoring service unreachable (simulated failure).",
        })}
      />,
    );

    expect(screen.getByText("scoreFeature failed")).toBeInTheDocument();
    expect(screen.getByText(/unreachable \(simulated failure\)/i)).toBeInTheDocument();
  });

  it("shows a confirmation card for clearConversation and only clears on confirm", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();

    render(
      <ToolPanel
        invocation={invocation({
          toolName: "clearConversation",
          state: "output-available",
          input: { reason: "start fresh" },
          output: { status: "needs_confirmation", message: "start fresh", remainingMessages: 3 },
        })}
        onClearConversation={onClear}
      />,
    );

    expect(screen.getByText(/clear conversation/i)).toBeInTheDocument();
    expect(screen.getByText(/3 user messages/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /keep chat/i }));
    expect(onClear).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /yes, clear it/i }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});

describe("asToolInvocation", () => {
  it("recognizes dynamic tool part types at runtime", () => {
    const part = {
      type: "tool-scoreFeature",
      toolName: "scoreFeature",
      toolCallId: "call-1",
      state: "output-available",
    };
    expect(asToolInvocation(part as never)).not.toBeNull();
  });

  it("returns null for text parts", () => {
    const part = { type: "text", text: "hello" };
    expect(asToolInvocation(part as never)).toBeNull();
  });
});