import { z } from "zod";

export const TIMEZONES = [
  "UTC",
  "America/New_York",
  "Europe/London",
  "Asia/Dhaka",
] as const;

export type Timezone = (typeof TIMEZONES)[number];

export const settingsSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address.")
    .transform((value) => value.toLowerCase()),
  bio: z.string().trim().max(240, "Bio must be 240 characters or fewer."),
  timezone: z.string().refine(
    (value) => TIMEZONES.includes(value as Timezone),
    { message: "Select your timezone." },
  ),
  marketingEmails: z.boolean(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;