"use client";

import type { ReactNode } from "react";
import type { UIMessage } from "ai";
import {
  CheckIcon,
  EraserIcon,
  Loader2Icon,
  TriangleAlertIcon,
  WrenchIcon,
  XIcon,
} from "lucide-react";
import { ScoreCard, ScoreCardEmpty } from "@/components/score-card";
import {
  clearConversationOutputSchema,
  scoreFeatureOutputSchema,
} from "@/lib/ai/tool-schemas";

/** Structural projection of a tool-invocation UI part (AI SDK v7 renders these
 *  with a dynamic `type` of `tool-<name>` so they need a runtime type guard). */
export interface ToolInvocationLike {
  toolName: string;
  toolCallId: string;
  state: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
}

/** Type guard for local use in `chat.tsx`: pulls a tool part out of a UIMessage
 *  part (or null when it is a text step). */
export function asToolInvocation(
  part: UIMessage["parts"][number],
): ToolInvocationLike | null {
  if (
    part.type === "dynamic-tool" ||
    (typeof part.type === "string" && part.type.startsWith("tool-"))
  ) {
    return part as unknown as ToolInvocationLike;
  }
  return null;
}

function Shell({
  opportunisticWork,
  children,
}: {
  opportunisticWork: string;
  children: ReactNode;
}) {
  return (
    <div
      role="status"
      aria-busy={opportunisticWork !== "" && opportunisticWork !== "done"}
      className="animate-in fade-in-0 zoom-in-95 duration-200 motion-reduce:animate-none"
    >
      {children}
    </div>
  );
}

function SummaryPill({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
      {label}
    </span>
  );
}

function resolvedInputSummary(invocation: ToolInvocationLike): string[] {
  const chips: string[] = [];
  if (typeof invocation.input !== "object" || invocation.input === null) {
    if (typeof invocation.input === "string" && invocation.input.length > 0) {
      chips.push(invocation.input);
    }
    return chips;
  }
  for (const [key, value] of Object.entries(invocation.input as Record<string, unknown>)) {
    if (typeof value === "string" && value.length > 0 && chips.length < 4) {
      chips.push(`${key}: ${value}`);
    }
  }
  return chips;
}

function StreamingCard({ label, note }: { label: string; note: string }) {
  return (
    <div className="flex w-full min-w-[16rem] max-w-sm items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <Loader2Icon className="size-4 shrink-0 animate-spin text-brand-600" aria-hidden="true" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-800">{label}</p>
        <p className="truncate text-xs text-slate-400">{note}</p>
      </div>
    </div>
  );
}

function ClearConversationCard({
  invocation,
  onClearConversation,
}: {
  invocation: ToolInvocationLike;
  onClearConversation?: () => void;
}) {
  const parsed = clearConversationOutputSchema.safeParse(invocation.output);
  return (
    <div className="w-full min-w-[16rem] max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <EraserIcon className="size-4 text-slate-500" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-slate-900">Clear conversation?</h3>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
        {parsed.success
          ? `The assistant suggests clearing because "${parsed.data.message}".`
          : "The assistant is asking to start over."}
      </p>
      {parsed.success && parsed.data.remainingMessages > 0 && (
        <p className="mt-1 text-xs text-slate-400">
          This removes the {parsed.data.remainingMessages} user message
          {parsed.data.remainingMessages === 1 ? "" : "s"} so far. This cannot be undone.
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onClearConversation}
          disabled={!onClearConversation}
          className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <CheckIcon className="size-3.5" aria-hidden="true" />
          Yes, clear it
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <XIcon className="size-3.5" aria-hidden="true" />
          Keep chat
        </button>
      </div>
    </div>
  );
}

function ErrorCard({ invocation }: { invocation: ToolInvocationLike }) {
  return (
    <div className="w-full min-w-[16rem] max-w-sm rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2">
        <TriangleAlertIcon className="size-4 shrink-0 text-rose-600" aria-hidden="true" />
        <p className="text-sm font-semibold text-rose-800">
          {invocation.toolName} failed
        </p>
      </div>
      <p className="mt-1 text-sm text-rose-700">
        {invocation.errorText ?? "The tool hit an unexpected error."}
      </p>
      <p className="mt-1.5 text-xs text-rose-500">
        Try reframing the request, then ask again.
      </p>
    </div>
  );
}

function CompletedCard({ invocation }: { invocation: ToolInvocationLike }) {
  return (
    <div className="flex w-full min-w-[16rem] max-w-sm items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-50">
        <CheckIcon className="size-3.5 text-emerald-600" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-800">{invocation.toolName}</p>
        <p className="truncate text-xs text-slate-400">Completed</p>
      </div>
    </div>
  );
}

/** Renders a raw tool-invocation part from the chat stream. The four AI SDK
 *  states get visually distinct treatments, and each known tool renders its
 *  own bespoke card at `output-available`. */
export function ToolPanel({
  invocation,
  onClearConversation,
}: {
  invocation: ToolInvocationLike;
  onClearConversation?: () => void;
}) {
  switch (invocation.state) {
    case "input-streaming":
      return (
        <Shell opportunisticWork="streaming">
          <StreamingCard label="Running tool…" note="Waiting for the model’s inputs" />
        </Shell>
      );
    case "input-available": {
      const chips = resolvedInputSummary(invocation);
      return (
        <Shell opportunisticWork="running">
          <div className="flex w-full min-w-[16rem] max-w-sm items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <WrenchIcon className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800">
                Running <span className="font-semibold">{invocation.toolName}</span>
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {chips.length > 0 ? (
                  chips.map((chip) => <SummaryPill key={chip} label={chip} />)
                ) : (
                  <SummaryPill label="processing request" />
                )}
              </div>
            </div>
          </div>
        </Shell>
      );
    }
    case "output-available": {
      if (invocation.toolName === "scoreFeature") {
        const result = scoreFeatureOutputSchema.safeParse(invocation.output);
        return (
          <Shell opportunisticWork="done">
            {result.success ? <ScoreCard result={result.data} /> : <ScoreCardEmpty />}
          </Shell>
        );
      }
      if (invocation.toolName === "clearConversation") {
        return (
          <Shell opportunisticWork="done">
            <ClearConversationCard
              invocation={invocation}
              onClearConversation={onClearConversation}
            />
          </Shell>
        );
      }
      return (
        <Shell opportunisticWork="done">
          <CompletedCard invocation={invocation} />
        </Shell>
      );
    }
    case "output-error":
      return (
        <Shell opportunisticWork="">
          <ErrorCard invocation={invocation} />
        </Shell>
      );
    default:
      return null;
  }
}