"use client";

import { useCallback, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";

/** FE-AA1 — a button that communicates its whole lifecycle instead of snapping
 *  between states. Faces crossfade/slide inside a fixed-size body so no label
 *  swap ever forces layout (all motion is transform/opacity). */
export type ManagedButtonState = "idle" | "loading" | "success" | "error";
export type ManagedButtonVariant = "brand" | "ink";

const SUCCESS_HOLD_MS = 900;
const SHAKE_CLEAR_MS = 450;

// Entrance: 220ms cubic-bezier(0.22,1,0.36,1) — fast start, soft landing.
// Exit: 120ms cubic-bezier(0.55,0,0.85,0.36) — quick retreat, nothing lingers.
// Timing/easing live in the literal classes below (Tailwind scans literals only).

export interface StatefulButtonProps {
  action: () => Promise<void>;
  defaultLabel: string;
  loadingLabel?: string;
  successLabel?: string;
  errorLabel?: string;
  variant?: ManagedButtonVariant;
  disabled?: boolean;
  type?: "button" | "submit";
  widthClassName?: string;
}

export function StatefulButton({
  action,
  defaultLabel,
  loadingLabel = "Sending…",
  successLabel = "Sent",
  errorLabel = "Try again",
  variant = "brand",
  disabled = false,
  type = "button",
  widthClassName = "w-36",
}: StatefulButtonProps) {
  const [state, setState] = useState<ManagedButtonState>("idle");
  const [shaking, setShaking] = useState(false);
  const inFlight = useRef(false);
  const actionRef = useRef(action);
  actionRef.current = action;

  const currentLabel =
    state === "loading"
      ? loadingLabel
      : state === "success"
        ? successLabel
        : state === "error"
          ? errorLabel
          : defaultLabel;

  const run = useCallback(async () => {
    if (inFlight.current) {
      return;
    }
    inFlight.current = true;
    setShaking(false);
    setState("loading");
    try {
      await actionRef.current();
      setState("success");
      await new Promise<void>((resolve) => window.setTimeout(resolve, SUCCESS_HOLD_MS));
      if (inFlight.current) {
        setState("idle");
      }
    } catch {
      setShaking(true);
      setState("error");
      window.setTimeout(() => setShaking(false), SHAKE_CLEAR_MS);
    } finally {
      inFlight.current = false;
    }
  }, []);

  const busy = state === "loading" || state === "success";
  const background =
    state === "success"
      ? "bg-emerald-600"
      : state === "error"
        ? "bg-rose-600"
        : variant === "ink"
          ? "bg-slate-900"
          : "bg-brand-600";

  const face = (active: boolean) =>
    active
      ? "absolute inset-0 flex items-center justify-center gap-1.5 whitespace-nowrap transition-[transform,opacity] motion-reduce:transition-none motion-reduce:transform-none opacity-100 translate-y-0 scale-100 duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
      : "absolute inset-0 flex items-center justify-center gap-1.5 whitespace-nowrap transition-[transform,opacity] motion-reduce:transition-none motion-reduce:transform-none opacity-0 -translate-y-1 scale-75 duration-[120ms] ease-[cubic-bezier(0.55,0,0.85,0.36)]";

  return (
    <button
      type={type}
      onClick={() => void run()}
      disabled={disabled || busy}
      data-state={state}
      aria-label={currentLabel}
      aria-busy={state === "loading"}
      className={[
        "relative inline-flex h-11 select-none items-center justify-center rounded-md text-sm font-medium text-white shadow-sm",
        "transition-[transform,filter,background-color,box-shadow] duration-200",
        "hover:-translate-y-px active:translate-y-px hover:brightness-105 hover:shadow-md",
        "motion-reduce:transition-none motion-reduce:transform-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        shaking ? "animate-shake motion-reduce:animate-none" : "",
        background,
        widthClassName,
      ].join(" ")}
    >
      <span className="relative block h-full w-full overflow-hidden">
        <span aria-hidden="true" className={face(state === "idle" || state === "error")}>
          {state === "error" ? errorLabel : defaultLabel}
        </span>
        <span aria-hidden="true" className={face(state === "loading")}>
          <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          {loadingLabel}
        </span>
        <span aria-hidden="true" className={face(state === "success")}>
          <Check className="size-4" aria-hidden="true" />
          {successLabel}
        </span>
        <span role="status" className="sr-only">
          {state === "idle" ? "" : currentLabel}
        </span>
      </span>
    </button>
  );
}