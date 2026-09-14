"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import {
  ArrowDownIcon,
  RotateCcwIcon,
  SquareIcon,
} from "lucide-react";
import { useChatScroll } from "@/components/chat-scroll";
import { ToolPanel, asToolInvocation } from "@/components/tool-panel";
import { shouldAutoContinueAfterTool } from "@/lib/chat-continue";
import {
  parseStoredMessages,
  serializeStoredMessages,
  storedToUIMessages,
} from "@/lib/chat-storage";

const STORAGE_KEY = "craftui:chat:v1";

/** Click-to-fill prompts shown in the first-run empty state. They are
 *  onboarding, not decoration: each one loads into the input so a first-time
 *  user can reach a useful response in one click. */
const SUGGESTIONS = [
  "How good is the task manager?",
  "What tech is this built with?",
  "Clear the conversation",
] as const;

/** Map raw failure messages to deliberate, actionable copy. Anything unknown
 *  passes through untouched so the real cause is never hidden. */
function friendlyError(error: Error): string {
  const message = error.message || "";
  if (/429|rate\s*limit/i.test(message)) {
    return "Rate limit reached. Wait a moment, then try again.";
  }
  if (/timed?\s*out|abort|network|fetch|failed to fetch/i.test(message)) {
    return "The connection dropped. Check your network, then retry.";
  }
  if (/503|not configured/i.test(message)) {
    return "The chat server is not configured yet. Add your Gemini API key to Vercel and redeploy.";
  }
  return message || "Something went wrong while streaming your last reply.";
}

function textOf(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

/** Pending-state skeleton. Sized to roughly match a short assistant bubble so
 *  the handoff to real content doesn't cause a visible layout shift (CLS). */
function ThinkingSkeleton() {
  return (
    <div
      role="status"
      className="w-fit max-w-[85%] self-start animate-in fade-in-0 duration-150 motion-reduce:animate-none rounded-xl rounded-bl-sm bg-slate-100 px-4 py-3"
    >
      <span className="sr-only">Thinking…</span>
      <div className="h-3 w-28 animate-pulse rounded-md bg-slate-200" />
      <div className="mt-2 h-3 w-44 animate-pulse rounded-md bg-slate-200" />
      <div className="mt-2 h-3 w-16 animate-pulse rounded-md bg-slate-200" />
    </div>
  );
}

export default function Chat() {
  const autoContinueAttempts = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { messages, sendMessage, stop, regenerate, status, error, clearError, setMessages } =
    useChat({
      // After a finished scoreFeature step the stream ends with no summary yet;
      // resubmit once so the model turns the tool result into prose. Counted
      // and reset per user turn to cap runaway tool loops.
      sendAutomaticallyWhen: ({ messages: current }) => {
        if (!shouldAutoContinueAfterTool(current, autoContinueAttempts.current)) {
          return false;
        }
        autoContinueAttempts.current += 1;
        return true;
      },
    });

  const [input, setInput] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [retrying, setRetrying] = useState(false);
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
    autoContinueAttempts.current = 0;
    const text = input.trim();
    setInput("");
    void sendMessage({ text });
  }

  function applySuggestion(text: string) {
    setInput(text);
    inputRef.current?.focus();
  }

  function handleRetry() {
    if (retrying) {
      return;
    }
    setRetrying(true);
    void regenerate().finally(() => setRetrying(false));
  }

  function handleClearConversation() {
    window.localStorage.removeItem(STORAGE_KEY);
    setMessages([]);
  }

  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;
  const lastAssistantText =
    lastMessage && lastMessage.role === "assistant" ? textOf(lastMessage) : "";
  const lastMessageIsMostlyTool =
    lastMessage !== undefined &&
    lastMessage.role === "assistant" &&
    lastMessage.parts.length > 0 &&
    lastMessage.parts.every((part) => part.type !== "text");
  const showThinking =
    active &&
    !lastMessageIsMostlyTool &&
    (lastMessage === undefined || lastMessage.role !== "assistant" || lastAssistantText === "");

  return (
    // dvh keeps the box inside the dynamic viewport so mobile Safari's toolbar
    // and the on-screen keyboard never push the composer out of reach.
    <div className="mx-auto flex h-[min(80dvh,40rem)] min-h-[20rem] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="relative min-h-0 flex-1">
        <div
          ref={viewportRef}
          onScroll={handleScroll}
          role="log"
          aria-label="Chat conversation"
          className="overscroll-contain flex h-full flex-col gap-4 overflow-y-auto p-4"
        >
          {messages.length === 0 && (
            <div className="m-auto w-full max-w-xs space-y-3 text-center">
              <p className="text-sm text-slate-500">
                Start a conversation about CraftUI. Or jump in with a question:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => applySuggestion(suggestion)}
                    className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => {
            const isAssistant = message.role === "assistant";
            return message.parts.map((part, index) => {
              if (part.type === "text") {
                const text = part.text;
                if (isAssistant && text === "") {
                  return null;
                }
                return (
                  <div
                    key={`${message.id}-${index}`}
                    className={`max-w-[85%] whitespace-pre-wrap break-words rounded-xl px-4 py-2.5 text-sm ${
                      isAssistant
                        ? "self-start rounded-bl-sm bg-slate-100 text-slate-800"
                        : "self-end rounded-br-sm bg-brand-600 text-white"
                    }`}
                  >
                    {text}
                  </div>
                );
              }
              const tool = asToolInvocation(part);
              if (tool) {
                return (
                  <ToolPanel
                    key={tool.toolCallId}
                    invocation={tool}
                    onClearConversation={handleClearConversation}
                  />
                );
              }
              return null;
            });
          })}

          {showThinking && <ThinkingSkeleton />}
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
          ref={inputRef}
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
        <div
          role="alert"
          className="animate-in fade-in-0 duration-200 motion-reduce:animate-none border-t border-rose-200 bg-rose-50 px-4 py-3"
        >
          <p className="text-sm font-semibold text-rose-800">
            The last reply was interrupted.
          </p>
          <p className="mt-0.5 text-xs text-rose-600">{friendlyError(error)}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {messages.length > 0 && (
              <button
                type="button"
                disabled={active || retrying}
                onClick={handleRetry}
                className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                <RotateCcwIcon className="size-3.5" aria-hidden="true" />
                Retry last message
              </button>
            )}
            <button
              type="button"
              onClick={() => clearError()}
              className="inline-flex items-center rounded-md border border-rose-300 px-3 py-1.5 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}