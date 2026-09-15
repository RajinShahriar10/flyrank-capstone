import {
  CircleCheckIcon,
  CircleMinusIcon,
  QuoteIcon,
} from "lucide-react";
import type { ScoreFeatureOutput } from "@/lib/ai/tool-schemas";

const VERDICT_STYLES: Record<ScoreFeatureOutput["verdict"], string> = {
  excellent: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  good: "bg-sky-50 text-sky-700 ring-sky-200",
  "needs-work": "bg-amber-50 text-amber-700 ring-amber-200",
};

/** Real component rendering of the `scoreFeature` tool's output. Receives a
 *  schema-validated result (the ToolPanel validates before calling this). */
export function ScoreCard({ result }: { result: ScoreFeatureOutput }) {
  return (
    <div className="w-full min-w-[16rem] max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 pb-3 pt-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Feature score
          </p>
          <h3 className="mt-0.5 truncate text-base font-semibold text-slate-900">
            {result.feature}
          </h3>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${VERDICT_STYLES[result.verdict]}`}
        >
          {result.verdict}
        </span>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <p className="text-4xl font-bold tracking-tight text-brand-700">
            {result.score}
            <span className="text-sm font-medium text-slate-500">/100</span>
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-600"
              style={{ width: `${result.score}%` }}
            />
          </div>
        </div>

        <p className="text-sm leading-relaxed text-slate-600">{result.summary}</p>

        {result.strengths.length > 0 && (
          <ul className="space-y-1.5">
            {result.strengths.map((strength) => (
              <li key={strength} className="flex items-start gap-2 text-sm text-slate-700">
                <CircleCheckIcon
                  className="mt-0.5 size-4 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
                {strength}
              </li>
            ))}
          </ul>
        )}

        {result.gaps.length > 0 && (
          <ul className="space-y-1.5">
            {result.gaps.map((gap) => (
              <li key={gap} className="flex items-start gap-2 text-sm text-slate-700">
                <CircleMinusIcon
                  className="mt-0.5 size-4 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                {gap}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function ScoreCardEmpty() {
  return (
    <div className="flex w-full min-w-[16rem] max-w-sm items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
      <QuoteIcon className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
      <span>That tool returned an unexpected shape, so the score card could not be built.</span>
    </div>
  );
}