import { z } from "zod";

export const TITLE_MIN = 3;
export const TITLE_MAX = 120;

export const newTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(TITLE_MIN, `Task title must be at least ${TITLE_MIN} characters.`)
    .max(TITLE_MAX, `Task title must be ${TITLE_MAX} characters or fewer.`),
  deadline: z
    .string()
    .optional()
    .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), {
      message: "Enter a valid date.",
    }),
});

export type NewTaskValues = z.infer<typeof newTaskSchema>;

export interface Task {
  id: string;
  title: string;
  deadline?: string;
  completed: boolean;
  createdAt: string;
}

export type TaskFilter = "all" | "active" | "completed";