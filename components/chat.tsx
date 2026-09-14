"use client";

import { useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { ArrowDownIcon, Loader2Icon, SquareIcon } from "lucide-react";
import { useChatScroll } from "@/components/chat-scroll";
import {
  parseStoredMessages,
  serializeStoredMessages,
  storedToUIMessages,
} from "@/lib/chat-storage";

const STORAGE_KEY = "craftui:chat:v1";

function textOf(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function ThinkingIndicator() {
  return (
    <div
      role="status"
      className="flex w-fit items-center gap-2 rounded-xl rounded-bl-sm bg-slate-100 px-4 py-2.5 text-sm text-slate-500"
    >
      <span aria-hidden="true" className="flex gap-1">
        <span className="size-1.5 animate-pulse rounded-full bg-slate-400" />
        <span className="size-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:150ms]" />
        <span className="size-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:300ms]" />
      </span>
      Thinking…
    </div>
  );
}

export default function Chat() {
  const { messages, sendMessage, stop, status, error, clearError, setMessages } =
    useChat();

  const [input, setInput] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const {
    viewportRef,
    pinnedToBottom,
    handleScroll,
    jumpToLatest,
    scrollToBottomIfPinned,
  } = useChatScroll();

  const active = status === "submitted" || status === "streaming";
  const canSend = input.trim().length > 0 && !active;

  // Restore a persisted conversation exactly once on mount (after hydration,
  // so SSR and client renders agree and no localStorage is read during render).
  useEffect(() => {
    const stored = parseStoredMessages(window.localStorage.getItem(STORAGE_KEY));
    if (stored.length > 0) {
      setMessages(storedToUIMessages(stored));
    }
    setHydrated(true);
  }, [setMessages]);

  // Persist every change once the restored conversation has settled.
  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEY, serializeStoredMessages(messages));
    }
  }, [messages, hydrated]);

  // Auto-scroll only while the user is already pinned to the bottom.
  useEffect(() => {
    scrollToBottomIfPinned();
  }, [scrollToBottomIfPinned, messages, active]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) {
      return;
    }
    const text = input.trim();
    setInput("");
    void sendMessage({ text });
  }

  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;
  const lastAssistantText =
    lastMessage && lastMessage.role === "assistant" ? textOf(lastMessage) : "";
  const showThinking =
    active &&
    (lastMessage === undefined || lastMessage.role !== "assistant" || lastAssistantText === "");

  return (
    <div className="mx-auto flex h-[70vh] min-h-[28rem] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="relative flex-1">
        <div
          ref={viewportRef}
          onScroll={handleScroll}
          role="log"
          aria-label="Chat conversation"
          className="flex h-full flex-col gap-4 overflow-y-auto p-4"
        >
          {messages.length === 0 && (
            <p className="m-auto max-w-xs text-center text-sm text-slate-500">
              Start a conversation about CraftUI — try “What tech is this built
              with?”
            </p>
          )}

          {messages.map((message) => {
            const isAssistant = message.role === "assistant";
            const text = textOf(message);
            if (isAssistant && text === "") {
              return null;
            }
            return (
              <div
                key={message.id}
                className={`max-w-[85%] whitespace-pre-wrap break-words rounded-xl px-4 py-2.5 text-sm ${
                  isAssistant
                    ? "self-start rounded-bl-sm bg-slate-100 text-slate-800"
                    : "self-end rounded-br-sm bg-brand-600 text-white"
                }`}
              >
                {text}
              </div>
            );
          })}

          {showThinking && <ThinkingIndicator />}
        </div>

        {!pinnedToBottom && (
          <button
            type="button"
            onClick={jumpToLatest}
            className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg transition-opacity hover:opacity-90"
          >
            <ArrowDownIcon className="size-3.5" aria-hidden="true" />
            Jump to latest
          </button>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex items-center gap-2 border-t border-slate-200 p-3"
      >
        <label htmlFor="chat-input" className="sr-only">
          Message
        </label>
        <input
          id="chat-input"
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about CraftUI…"
          autoComplete="off"
          enterKeyHint="send"
          className="h-11 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        {active ? (
          <button
            type="button"
            onClick={() => void stop()}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-medium text-white"
          >
            <SquareIcon className="size-3.5" aria-hidden="true" />
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!canSend}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-medium text-white transition-opacity disabled:opacity-50"
          >
            <span className="sr-only">Send message</span>
            Send
          </button>
        )}
      </form>

      {status === "error" && error !== undefined && (
        <p role="alert" className="flex items-center gap-2 border-t border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          <Loader2Icon className="size-4" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            {error.message || "Something went wrong while streaming."}
          </span>
          <button
            type="button"
            onClick={() => clearError()}
            className="shrink-0 rounded-md border border-rose-300 px-2 py-1 text-xs font-medium"
          >
            Dismiss
          </button>
        </p>
      )}
    </div>
  );
}