# Week 3 — React app development with AI

Built with AI assistance following the mentor session (*React Frontend Development with AI: From Prompt to Working Feature*). A task manager feature inside the capstone app — the "prompt to working feature" loop, including review, correction, and tests.

**Where it lives:** route `/tasks` · `app/tasks/page.tsx`, `components/task-form.tsx`, `components/task-list.tsx`, `components/task-item.tsx`, `types/task.ts`.

## The prompts used

1. "Add a task manager to the capstone at `app/tasks/page.tsx`: an add-task form, a list, a complete toggle, delete, and a remaining-count."
2. "Make the list filterable between All / Active / Done and show an empty state when nothing matches."
3. "Follow CLAUDE.md conventions: react-hook-form + zod, `noValidate`, `aria-invalid`/`aria-describedby`, focus the first invalid field on failed submit."
4. "Validate the title: required, trimmed, 3–120 chars, with a live character counter; add an optional deadline with an invalid-date guard."
5. "Persist tasks to localStorage, but keep it SSR-safe — no `window` access during render."
6. "Write Vitest + RTL tests for form validation, add/toggle/delete, filters, and persistence. Then run `npm run test`, `npm run lint`, `npm run build` and get all three green."

## How AI assisted

- Generated the entire first pass from prompt 1 in seconds: form, list rendering, toggle and delete, remaining count — a working feature, not a skeleton.
- Proposed the All/Active/Done filter and empty-state copy unprompted after prompt 2 (small good judgment call to keep).
- Supplied the full a11y wiring (prompt 3) and the correct localStorage hydration pattern (prompt 5) in one draft each.
- Wrote the complete 11-test Vitest+RTL suite and ran the verification loop to green (prompt 6).

## Manual improvements, corrections and refactoring (after reviewing AI code)

The AI's first pass (`0fc5d06`) was in-memory, single-file, and skipped most of the project conventions. Review caught the following, each fixed in `6a387e4`:

1. **Form contracts violated CLAUDE.md.** The draft used hand-rolled `useState` + `onChange` form state and no validation. Rewritten to react-hook-form + zod with `zodResolver`, `noValidate`, labelled errors, `aria-invalid`/`aria-describedby`, and focus-on-first-invalid — because a manual `useState` form now fails our own review rule.
2. **No persistence.** The draft kept tasks in memory only. Added localStorage with an SSR-safe hydration effect (`hydrated` flag) so `/tasks` still renders on the server and never reads `window` during render. Verified by a remount test.
3. **Accessibility gaps.** Draft had an unlabeled checkbox-in-label and no group/filter semantics. Corrected to proper labels, `role="group"` + `aria-pressed` on filters, `aria-live="polite"` remaining-count, semantically-announced buttons (`aria-label` on checkbox and Delete). A11y is now asserted by tests (`getByRole` names).
4. **Unstable keys.** Draft keyed list items by array `index` and ids by `Date.now()`. Replaced with `crypto.randomUUID()` ids and `key={task.id}` so reorders/additions don't cause stale DOM state.
5. **Missing scope and edge cases.** Deadline field (with invalid-date refinement), empty-state message, hard 120-char cap surfaced as an error instead of silently truncating, and reset-after-submit — none existed in the draft.

## Verification

`npm run test` 11/11 · `npm run lint` clean · `npm run build` ✓ (`/tasks` route included).

## Progression

Each correction is visible in the git history (`0fc5d06` draft → `6a387e4` corrections → `9463778` tests), which maps back exactly to the review findings above.