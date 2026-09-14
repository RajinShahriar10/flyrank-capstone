"use client";

import Link from "next/link";

/** App-level error boundary (FE-08). Catches unexpected render errors on any
 *  route and offers a recovery path instead of a blank page. */
export default function ErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-md flex-col items-center justify-center gap-3 p-4 text-center">
      <p className="text-sm font-medium text-slate-500">Something went wrong</p>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        This screen failed to load
      </h1>
      <p className="text-sm leading-relaxed text-slate-600">
        An unexpected error interrupted the page. Recovering is safe — try again
        to reload it in place.
      </p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
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