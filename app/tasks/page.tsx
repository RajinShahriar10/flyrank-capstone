"use client";

import { useEffect, useState } from "react";
import TaskForm from "@/components/task-form";
import TaskList from "@/components/task-list";
import type { NewTaskValues, Task, TaskFilter } from "@/types/task";

const STORAGE_KEY = "flyrank.tasks.v1";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setTasks(JSON.parse(raw) as Task[]);
      }
    } catch {
      // Corrupt storage: start with an empty list.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [hydrated, tasks]);

  function addTask(values: NewTaskValues) {
    const task: Task = {
      id: crypto.randomUUID(),
      title: values.title,
      deadline: values.deadline || undefined,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((previous) => [task, ...previous]);
  }

  function toggleTask(id: string) {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  function deleteTask(id: string) {
    setTasks((previous) => previous.filter((task) => task.id !== id));
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Task manager</h1>
      <p className="mt-2 text-slate-600">
        Add, complete, and clear your tasks. Saved in your browser.
      </p>

      <div className="mt-6 space-y-8">
        <TaskForm onAdd={addTask} />
        <TaskList
          tasks={tasks}
          filter={filter}
          onFilterChange={setFilter}
          onToggle={toggleTask}
          onDelete={deleteTask}
        />
      </div>
    </section>
  );
}