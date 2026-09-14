"use client";

import { useCallback } from "react";
import { StatefulButton } from "@/components/stateful-button";

/** "Send message" style button whose action resolves. */
function succeed() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, 900);
  });
}

/** "Send message" style button whose action rejects. */
function fail() {
  return new Promise<void>((_, reject) => {
    window.setTimeout(() => reject(new Error("Simulated failure")), 700);
  });
}

/** The example brief: random delay, ~20% failure rate. */
function randomOutcome() {
  return new Promise<void>((resolve, reject) => {
    window.setTimeout(() => {
      if (Math.random() < 0.2) {
        reject(new Error("Simulated failure"));
      } else {
        resolve();
      }
    }, 700 + Math.random() * 900);
  });
}

export default function MicrointeractionsPage() {
  const randomAction = useCallback(() => randomOutcome(), []);
  const successAction = useCallback(() => succeed(), []);
  const failureAction = useCallback(() => fail(), []);
  const saveAction = useCallback(() => succeed(), []);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Buttons with a Brain</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        A stateful button that choreographs idle → hover/focus → loading →
        success/error and back, so every state change is a transition instead of
        a snap. Use the forced-outcome buttons to review each state on demand.
      </p>

      <section className="mt-8 max-w-2xl">
        <h2 className="text-lg font-medium">Random outcome (approx. 20% failures)</h2>
        <p className="mt-1 text-sm text-slate-500">
          Random delay between 0.7s and 1.6s. Spam-click it to check it stays
          interruptible.
        </p>
        <div className="mt-3">
          <StatefulButton
            action={randomAction}
            defaultLabel="Send message"
            loadingLabel="Sending…"
            successLabel="Sent"
            errorLabel="Try again"
          />
        </div>
      </section>

      <section className="mt-8 max-w-2xl">
        <h2 className="text-lg font-medium">Forced outcomes</h2>
        <p className="mt-1 text-sm text-slate-500">
          Reviewers can see each state on demand, not just by luck.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <StatefulButton
            action={successAction}
            defaultLabel="Force success"
            loadingLabel="Working…"
            successLabel="Success"
            errorLabel="Try again"
          />
          <StatefulButton
            action={failureAction}
            defaultLabel="Force error"
            loadingLabel="Working…"
            successLabel="Success"
            errorLabel="Try again"
          />
        </div>
      </section>

      <section className="mt-8 max-w-2xl">
        <h2 className="text-lg font-medium">The same motion language, a second button</h2>
        <p className="mt-1 text-sm text-slate-500">
          The system is prop-driven: swap labels and the ink variant and the
          choreography stays identical.
        </p>
        <div className="mt-3">
          <StatefulButton
            action={saveAction}
            variant="ink"
            defaultLabel="Save changes"
            loadingLabel="Saving…"
            successLabel="Saved"
            errorLabel="Try again"
          />
        </div>
      </section>

      <section className="mt-8 max-w-2xl">
        <h2 className="text-lg font-medium">Motion notes</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>
            Entrances run <strong>220ms</strong> on{" "}
            <code>cubic-bezier(0.22, 1, 0.36, 1)</code> — fast start, soft
            landing; it reads as arrival.
          </li>
          <li>
            Exits run <strong>120ms</strong> on{" "}
            <code>cubic-bezier(0.55, 0, 0.85, 0.36)</code> — things leave quickly
            so users never wait on a retreat.
          </li>
          <li>
            Success holds <strong>900ms</strong> so the checkmark registers, then
            eases back to idle.
          </li>
          <li>
            Error shakes <strong>400ms</strong> on a pure <code>translateX</code>{" "}
            keyframe, skipped entirely under reduced motion; the error color stays
            so feedback is never removed.
          </li>
          <li>
            Only <code>transform</code>, <code>opacity</code>, color and filter
            animate. The body is a fixed width, so label swaps cause no reflow at
            all.
          </li>
          <li>
            A ref guard plus <code>disabled</code> make repeat clicks during
            loading/success a no-op; <code>prefers-reduced-motion</code> drops the
            motion but keeps label, color and a live-region announcement.
          </li>
        </ul>
      </section>
    </div>
  );
}