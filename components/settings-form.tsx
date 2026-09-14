"use client";

import { useState } from "react";

export default function SettingsForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [marketing, setMarketing] = useState(true);
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {saved && <p className="text-green-600">Saved!</p>}

      <div>
        <label>Full name</label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      <div>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      <div>
        <label>Bio</label>
        <textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={marketing}
            onChange={(event) => setMarketing(event.target.checked)}
          />
          Marketing emails
        </label>
      </div>

      <button
        type="submit"
        className="rounded-md bg-slate-900 px-4 py-2 text-white"
      >
        Save changes
      </button>
    </form>
  );
}