"use client";

import type { Task } from "@/types/task";

export default function TaskItem({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <li className="flex items-start justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          aria-label={`Mark "${task.title}" as ${task.completed ? "not done" : "done"}`}
          className="mt-1"
        />
        <div>
          <p
            className={task.completed ? "text-slate-500 line-through" : undefined}
          >
            {task.title}
          </p>
          {task.deadline && (
            <p className="text-xs text-slate-500">Due {task.deadline}</p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onDelete(task.id)}
        aria-label={`Delete "${task.title}"`}
        className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </li>
  );
}