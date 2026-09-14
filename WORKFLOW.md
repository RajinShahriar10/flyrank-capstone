# FE-03 — AI-assisted workflow drill: Findings

Comparison of the same feature (a settings form with validation) built twice: once from a one-sentence prompt, once from a spec with verification. Branch `round-1-vague` vs `round-2-precise`.

## The two prompts

Round one:

> Add a settings page with a profile form to the app.

Round two:

> Build the user settings form. Files: `types/settings.ts` (zod contract), `components/settings-form.tsx`, `components/__tests__/settings-form.test.tsx`, rendered from `app/page.tsx`. Fields: fullName (required, min 2), email (required, valid format, trim + lowercase on save), bio (optional, hard 240 cap with live counter), timezone (required, fixed list), marketingEmails (default true). Constraints: react-hook-form + zodResolver, no uncontrolled inputs, `aria-invalid` + `aria-describedby` on errors, focus the first invalid field, disable the save button during a simulated 500 ms save, `role="status"` success message cleared on edit. Verification: write the tests, then run `npm run test`, `npm run lint`, `npm run build` and get all three green.

## What the diff shows

`components/settings-form.tsx`: 68 → 180 lines. Round one is five `useState` fields with manual `onChange` handlers in a single component. Round two adds `types/settings.ts` (a 31-line zod contract) and a 111-line test file; `app/page.tsx` is the only other file touched, identically in both rounds.

**Correctness.** Round one validates nothing: any email string is accepted, `" "` passes as a name, the bio field has no limit, and there is no timezone field at all — a whole required field never existed. Round two declares the contract once in `types/settings.ts` and enforces it everywhere, including trim/lowercase normalization at parse time.

**Accessibility.** Round one's `<label>Full name</label>` has no `htmlFor`/`id`, so the label is unassociable; there is no `aria-invalid`, `aria-describedby`, or focus management, and the success message has no `role`. Round two pairs every label to its control, flags invalid fields with `aria-invalid`, points `aria-describedby` at a labelled error paragraph, moves focus to the first invalid field on failure, and announces saves with `role="status"`.

**Edge cases.** Round one allows double-submits and persists mixed-case, untrimmed input. Round two disables the button while saving, caps bio at 240 with a live counter, and hides the success message as soon as the user edits again.

**Mistake caught.** The first round-two test run failed: the browser's native `type="email"` constraint validation blocks `submit` before the custom zod error can render, so "Enter a valid email address." never surfaced. Fix: `noValidate` on the form — one verification loop, then all checks green. Round one's mistakes were worse and uncatchable by automation because no tests existed.

**Review effort.** Round one felt instant (one sentence, one commit, under a minute) but left six open findings with no guard; every one resurfaces at review. Round two cost more upfront yet produced 8 passing tests + clean lint + successful build, and human review collapsed to skimming the schema. Round two was slower and faster end-to-end — the whole lesson of this drill.