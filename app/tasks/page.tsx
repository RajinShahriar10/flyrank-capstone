"use client";

import { useState } from "react";

interface Task {
  id: number;
  title: string;
  done: boolean;
}

export default function TasksPage() {
  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);

  function addTask(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }
    setTasks([{ id: Date.now(), title: title.trim(), done: false }, ...tasks]);
    setTitle("");
  }

  function toggle(id: number) {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  }

  function remove(id: number) {
    setTasks(tasks.filter((task) => task.id !== id));
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Task manager</h1>
      <p className="mt-2 text-slate-600">Add, complete, and clear your tasks.</p>

      <form onSubmit={addTask} className="mt-6 flex gap-2">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a task"
          className="block w-full rounded-md border border-slate-300 px-3 py-2"
        />
        <button
          type="submit"
          className="shrink-0 rounded-md bg-slate-900 px-4 py-2 text-white"
        >
          Add
        </button>
      </form>

      <ul className="mt-6 space-y-2">
        {tasks.map((task, index) => (
          <li
            key={index}
            className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2"
          >
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggle(task.id)}
              />
              <span className={task.done ? "text-slate-400 line-through" : undefined}>
                {task.title}
              </span>
            </label>
            <button
              type="button"
              onClick={() => remove(task.id)}
              className="text-sm text-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}