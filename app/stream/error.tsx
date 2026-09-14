"use client";

import Link from "next/link";

/** Route-level error boundary for the AI chat screen (FE-08). Chat failures
 *  are normally handled inside the component itself via useChat's error state;
 *  this boundary covers render-time failures of the /stream route. */
export default function StreamErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-md flex-col items-center justify-center gap-3 p-4 text-center">
      <p className="text-sm font-medium text-rose-500">AI chat</p>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        The chat could not start
      </h1>
      <p className="text-sm leading-relaxed text-slate-600">
        Something interrupted the conversation screen. Reloading it is safe and
        your history is preserved.
      </p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}