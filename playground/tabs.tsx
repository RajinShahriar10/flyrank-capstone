"use client";

import { useId, useRef, useState } from "react";

interface TabItem {
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  label: string;
  items: TabItem[];
}

export function Tabs({ label, items }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function activate(index: number) {
    setActiveIndex(index);
    tabRefs.current[index]?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const count = items.length;
    let next = -1;

    switch (event.key) {
      case "ArrowRight":
        next = (activeIndex + 1) % count;
        break;
      case "ArrowLeft":
        next = (activeIndex - 1 + count) % count;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = count - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    activate(next);
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className="flex gap-1 border-b border-slate-200"
    >
      {items.map((item, index) => {
        const selected = index === activeIndex;
        return (
          <button
            key={item.label}
            type="button"
            role="tab"
            id={`${baseId}-tab-${index}`}
            aria-selected={selected}
            aria-controls={`${baseId}-panel-${index}`}
            tabIndex={selected ? 0 : -1}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            onClick={() => setActiveIndex(index)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              selected
                ? "border-brand-500 text-brand-700"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {item.label}
          </button>
        );
      })}

      {items.map((item, index) => {
        const selected = index === activeIndex;
        return (
          <div
            key={item.label}
            role="tabpanel"
            id={`${baseId}-panel-${index}`}
            aria-labelledby={`${baseId}-tab-${index}`}
            tabIndex={0}
            hidden={!selected}
            className="pt-4 text-sm text-slate-600"
          >
            {item.content}
          </div>
        );
      })}
    </div>
  );
}