"use client";

import { useEffect, useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  settingsSchema,
  TIMEZONES,
  type SettingsFormValues,
} from "@/types/settings";

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

const FOCUS_ORDER: (keyof SettingsFormValues)[] = [
  "fullName",
  "email",
  "bio",
  "timezone",
];

export default function SettingsForm() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      fullName: "",
      email: "",
      bio: "",
      timezone: "",
      marketingEmails: true,
    },
  });

  const [saved, setSaved] = useState(false);
  const bio = watch("bio") ?? "";

  useEffect(() => {
    if (saved && isDirty) {
      setSaved(false);
    }
  }, [saved, isDirty]);

  async function onSubmit(values: SettingsFormValues) {
    setSaved(false);
    await new Promise((resolve) => setTimeout(resolve, 500));
    reset(values);
    setSaved(true);
  }

  function onInvalid(fieldErrors: FieldErrors<SettingsFormValues>) {
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
      data-testid="settings-form"
    >
      {saved && (
        <p
          role="status"
          className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700"
        >
          Profile saved.
        </p>
      )}

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium">
          Full name
        </label>
        <input
          id="fullName"
          {...register("fullName")}
          aria-invalid={errors.fullName ? true : undefined}
          aria-describedby={errors.fullName ? "fullName-error" : undefined}
          className={`${inputClass} ${errors.fullName ? errorClass : validClass}`}
        />
        <FieldError id="fullName-error" message={errors.fullName?.message} />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={`${inputClass} ${errors.email ? errorClass : validClass}`}
        />
        <FieldError id="email-error" message={errors.email?.message} />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          rows={3}
          maxLength={240}
          {...register("bio")}
          aria-describedby={errors.bio ? "bio-error" : "bio-count"}
          className={`${inputClass} resize-y ${errors.bio ? errorClass : validClass}`}
        />
        {errors.bio ? (
          <FieldError id="bio-error" message={errors.bio?.message} />
        ) : (
          <p id="bio-count" className="mt-1 text-right text-xs text-slate-500">
            {bio.length}/240
          </p>
        )}
      </div>

      <div>
        <label htmlFor="timezone" className="block text-sm font-medium">
          Timezone
        </label>
        <select
          id="timezone"
          {...register("timezone")}
          aria-invalid={errors.timezone ? true : undefined}
          aria-describedby={errors.timezone ? "timezone-error" : undefined}
          className={`${inputClass} ${errors.timezone ? errorClass : validClass}`}
        >
          <option value="" disabled>
            Select a timezone…
          </option>
          {TIMEZONES.map((timezone) => (
            <option key={timezone} value={timezone}>
              {timezone}
            </option>
          ))}
        </select>
        <FieldError id="timezone-error" message={errors.timezone?.message} />
      </div>

      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("marketingEmails")} />
        Marketing emails
      </label>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}