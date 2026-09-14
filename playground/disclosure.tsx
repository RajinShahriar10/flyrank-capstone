"use client";

import { useId, useState } from "react";

interface DisclosureProps {
  summary: string;
  children: React.ReactNode;
}

export function Disclosure({ summary, children }: DisclosureProps) {
  const [open, setOpen] = useState(false);
  const buttonId = useId();
  const regionId = useId();

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <h3 className="m-0">
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={regionId}
          onClick={() => setOpen((current) => !current)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-medium"
        >
          <span>{summary}</span>
          <span
            aria-hidden="true"
            className={`text-slate-400 transition-transform ${open ? "" : "rotate-90"}`}
          >
            ›
          </span>
        </button>
      </h3>
      <div
        id={regionId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className="border-t border-slate-100 px-4 pb-4 pt-3 text-sm text-slate-600"
      >
        {children}
      </div>
    </div>
  );
}