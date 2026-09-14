"use client";

import type { Task, TaskFilter } from "@/types/task";
import TaskItem from "./task-item";

const FILTERS: { value: TaskFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Done" },
];

export default function TaskList({
  tasks,
  filter,
  onFilterChange,
  onToggle,
  onDelete,
}: {
  tasks: Task[];
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const visible = tasks.filter((task) =>
    filter === "all"
      ? true
      : filter === "active"
        ? !task.completed
        : task.completed,
  );
  const remaining = tasks.filter((task) => !task.completed).length;

  return (
    <section aria-labelledby="task-list-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="task-list-heading" className="text-lg font-medium">
          Tasks
        </h2>
        <div
          role="group"
          aria-label="Filter tasks"
          className="flex gap-1 rounded-md border border-slate-300 p-1"
        >
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              data-pressed={filter === value}
              onClick={() => onFilterChange(value)}
              className="rounded px-3 py-1 text-sm data-[pressed=true]:bg-slate-900 data-[pressed=true]:text-white"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-1 text-sm text-slate-500" aria-live="polite">
        {remaining === 0 ? "All caught up." : `${remaining} remaining`}
      </p>

      {visible.length === 0 ? (
        <p className="mt-3 rounded-md border border-dashed border-slate-300 px-3 py-8 text-center text-sm text-slate-500">
          No {filter === "all" ? "" : `${filter} `}tasks yet.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {visible.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}