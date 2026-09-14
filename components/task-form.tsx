"use client";

import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  newTaskSchema,
  TITLE_MAX,
  type NewTaskValues,
} from "@/types/task";

const inputClass = "mt-1 block w-full rounded-md border px-3 py-2";
const validClass = "border-slate-300";
const errorClass = "border-red-500";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p id={id} className="mt-1 text-sm text-red-600">
      {message}
    </p>
  );
}

const FOCUS_ORDER: (keyof NewTaskValues)[] = ["title", "deadline"];

export default function TaskForm({
  onAdd,
}: {
  onAdd: (values: NewTaskValues) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<NewTaskValues>({
    resolver: zodResolver(newTaskSchema),
    defaultValues: { title: "", deadline: "" },
  });

  const title = watch("title") ?? "";

  function onSubmit(values: NewTaskValues) {
    onAdd(values);
    reset();
  }

  function onInvalid(fieldErrors: FieldErrors<NewTaskValues>) {
    const firstInvalid = FOCUS_ORDER.find((name) => Boolean(fieldErrors[name]));
    if (firstInvalid) {
      document.getElementById(String(firstInvalid))?.focus();
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      noValidate
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Task title
          </label>
          <input
            id="title"
            {...register("title")}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? "title-error" : "title-count"}
            className={`${inputClass} ${errors.title ? errorClass : validClass}`}
          />
          {errors.title ? (
            <FieldError id="title-error" message={errors.title?.message} />
          ) : (
            <p
              id="title-count"
              className="mt-1 text-right text-xs text-slate-500"
            >
              {title.length}/{TITLE_MAX}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="deadline" className="block text-sm font-medium">
            Deadline (optional)
          </label>
          <input
            id="deadline"
            type="date"
            {...register("deadline")}
            aria-invalid={errors.deadline ? true : undefined}
            aria-describedby={errors.deadline ? "deadline-error" : undefined}
            className={`${inputClass} ${errors.deadline ? errorClass : validClass}`}
          />
          <FieldError id="deadline-error" message={errors.deadline?.message} />
        </div>
      </div>

      <button
        type="submit"
        className="rounded-md bg-slate-900 px-4 py-2 text-white"
      >
        Add task
      </button>
    </form>
  );
}