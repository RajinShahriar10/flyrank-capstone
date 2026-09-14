import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { UIMessage } from "ai";
import Chat from "@/components/chat";

const chatMock = vi.hoisted(() => ({
  messages: [] as UIMessage[],
  status: "ready" as "submitted" | "streaming" | "ready" | "error",
  error: undefined as Error | undefined,
  sendMessage: vi.fn<(args: { text: string }) => Promise<void>>(),
  stop: vi.fn<() => Promise<void>>(),
  regenerate: vi.fn<() => Promise<void>>(),
  clearError: vi.fn(),
  setMessages: vi.fn(),
}));

vi.mock("@ai-sdk/react", () => ({
  useChat: () => ({
    messages: chatMock.messages,
    status: chatMock.status,
    error: chatMock.error,
    sendMessage: chatMock.sendMessage,
    stop: chatMock.stop,
    regenerate: chatMock.regenerate,
    clearError: chatMock.clearError,
    setMessages: chatMock.setMessages,
  }),
}));

function uiMessage(role: "user" | "assistant", text: string): UIMessage {
  return {
    id: role === "user" ? "user-1" : "assistant-1",
    role,
    parts: [{ type: "text", text, state: role === "assistant" ? "done" : undefined }],
  } as UIMessage;
}

function setup() {
  const user = userEvent.setup();
  const view = render(<Chat />);
  return { user, ...view };
}

describe("Chat", () => {
  it("renders an empty state with the send button disabled", () => {
    chatMock.status = "ready";
    chatMock.messages = [];
    setup();

    expect(screen.getByText(/start a conversation/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
  });

  it("enables send on input and calls sendMessage with the trimmed text", async () => {
    chatMock.status = "ready";
    chatMock.messages = [];
    chatMock.sendMessage.mockResolvedValue(undefined);
    const { user } = setup();

    const input = screen.getByLabelText("Message");
    await user.type(input, "  hello  ");
    const send = screen.getByRole("button", { name: /send/i });
    expect(send).toBeEnabled();

    await user.click(send);
    expect(chatMock.sendMessage).toHaveBeenCalledWith({ text: "hello" });
    expect(input).toHaveValue("");
  });

  it("shows a Thinking indicator before the first token and a Stop button while streaming", async () => {
    chatMock.status = "submitted";
    chatMock.messages = [uiMessage("user", "hi")];
    chatMock.stop.mockResolvedValue(undefined);
    const { user } = setup();

    expect(screen.getByRole("status")).toHaveTextContent(/thinking/i);
    await user.click(screen.getByRole("button", { name: /stop/i }));
    expect(chatMock.stop).toHaveBeenCalled();
  });

  it("hides the indicator once tokens stream and keeps the partial response after stop", () => {
    chatMock.status = "streaming";
    chatMock.messages = [
      uiMessage("user", "hi"),
      uiMessage("assistant", "Hello there"),
    ];
    const { rerender } = setup();

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByText("Hello there")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /stop/i })).toBeInTheDocument();

    // Stop mid-stream → status ready, partial text persists, send re-enables.
    chatMock.status = "ready";
    chatMock.messages = [
      uiMessage("user", "hi"),
      uiMessage("assistant", "Hello there"),
    ];
    rerender(<Chat />);

    expect(screen.getByText("Hello there")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /stop/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
  });

  it("renders distinct user and assistant bubbles", () => {
    chatMock.status = "ready";
    chatMock.messages = [uiMessage("user", "user text"), uiMessage("assistant", "assistant text")];
    setup();

    const userBubble = screen.getByText("user text");
    const assistantBubble = screen.getByText("assistant text");
    expect(userBubble).toHaveClass("self-end");
    expect(assistantBubble).toHaveClass("self-start");
  });

  it("surfaces server errors and dismisses them", async () => {
    chatMock.status = "error";
    chatMock.messages = [];
    chatMock.error = new Error("boom");
    const { user } = setup();

    expect(screen.getByRole("alert")).toHaveTextContent("The last reply was interrupted.");
    expect(screen.getByRole("alert")).toHaveTextContent("boom");
    // With no prior message there is nothing to retry.
    expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(chatMock.clearError).toHaveBeenCalled();
  });

  it("retries the interrupted reply and guards against a double click", async () => {
    chatMock.status = "error";
    chatMock.messages = [uiMessage("user", "hello"), uiMessage("assistant", "partial")];
    chatMock.error = new Error("stream interrupted");
    let releaseRegenerate: () => void = () => undefined;
    chatMock.regenerate.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          releaseRegenerate = resolve;
        }),
    );
    const { user } = setup();

    const retry = screen.getByRole("button", { name: /retry last message/i });
    expect(retry).toBeEnabled();

    await user.click(retry);
    expect(chatMock.regenerate).toHaveBeenCalledTimes(1);
    // The button locks while a retry is in flight so the terminal message is
    // never resubmitted twice.
    expect(screen.getByRole("button", { name: /retry last message/i })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /retry last message/i }));
    expect(chatMock.regenerate).toHaveBeenCalledTimes(1);

    releaseRegenerate();
  });

  it("renders clickable suggestions that fill the input on first run", async () => {
    chatMock.status = "ready";
    chatMock.messages = [];
    const { user } = setup();

    await user.click(
      screen.getByRole("button", { name: /how good is the task manager/i }),
    );
    expect(screen.getByLabelText("Message")).toHaveValue("How good is the task manager?");
  });

  it("releases the bottom pin when the user scrolls up and jumps back on demand", async () => {
    chatMock.status = "ready";
    chatMock.messages = [uiMessage("user", "first"), uiMessage("assistant", "second")];
    const { user } = setup();

    const viewport = screen.getByRole("log");
    Object.defineProperty(viewport, "scrollHeight", { value: 1000, configurable: true });
    Object.defineProperty(viewport, "clientHeight", { value: 100, configurable: true });
    viewport.scrollTop = 0;

    expect(screen.queryByRole("button", { name: /jump to latest/i })).not.toBeInTheDocument();

    fireEvent.scroll(viewport);
    expect(screen.getByRole("button", { name: /jump to latest/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /jump to latest/i }));
    expect(viewport.scrollTop).toBe(1000);
    expect(screen.queryByRole("button", { name: /jump to latest/i })).not.toBeInTheDocument();
  });
});