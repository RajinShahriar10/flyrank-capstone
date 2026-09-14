# FE-05 — Accessible component fundamentals: notes

Goal: hand-build three accessible React + TypeScript components — modal dialog,
tabs, disclosure — then install shadcn/ui's equivalent dialog and tabs and
compare the two approaches. Everything was verified keyboard-only with Playwright
(`e2e/playground.spec.ts`).

## Components

| Component | Source | Pattern |
| --- | --- | --- |
| Disclosure | `playground/disclosure.tsx` | W3C APG Disclosure |
| Tabs | `playground/tabs.tsx` | W3C APG Tabs (automatic activation, horizontal) |
| Modal dialog | `playground/dialog.tsx` | W3C APG Modal Dialog |
| shadcn dialog | `components/ui/dialog.tsx` | Radix `Dialog` |
| shadcn tabs | `components/ui/tabs.tsx` | Radix `Tabs` |

The hand-built set navigates by Tab / Shift+Tab / ArrowLeft / ArrowRight /
Home / End / Escape with roving tabindex for tabs, a focus trap for the dialog,
and keyboard-only disclosure toggles. The demo lives at `/playground`
(`app/playground/page.tsx`, `components/playground-demo.tsx`).

## What shadcn/Radix handled that the hand-built version misses

These are the concrete gaps found while comparing against the generated
`components/ui/*.tsx` source (all numbers reference those files as of this note).

1. **Multiple / nested dialogs.** My dialog attaches a `document` `keydown`
   listener per open instance, so a second dialog layered on top of the first
   would close *both* on Escape. Radix maintains a dismissable-layer stack —
   only the top layer receives Escape / outside-press, and focus is restored one
   level at a time. My version cannot safely stack dialogs.

2. **Behavior is hard-coded; the shadcn API is configurable.** My `DialogProps`
   is just `{ open, onClose, title, children }` — initial focus is always the
   first focusable, backdrop click always closes, Escape always closes. shadcn
   forwards every Radix primitive prop (`onEscapeKeyDown`, `onInteractOutside`,
   `initialFocus`, `modal={false}`, ...), so each of those decisions is a prop
   (`components/ui/dialog.tsx:55`, `:61`). Same story for tabs: my tablist is
   horizontal + automatic-activation only, while shadcn's `Tabs` accepts
   `orientation` and surfaces Radix's `activationMode` (`components/ui/tabs.tsx:10`).

3. **No portal, so layout context leaks.** My dialog renders inline, so an
   ancestor with `overflow`, `transform`, or `z-index` can clip or re-order it
   (and its backdrop) relative to the app shell. Radix `DialogPortal` renders
   into `<body>`, shielded from the ancestors' stacking context
   (`components/ui/dialog.tsx:40`). shadcn also styles exit states via
   `data-open`/`data-closed` + Presence so the panel animates out before
   unmounting; mine vanishes instantly.

4. **Not extensible (no `asChild`).** shadcn's compound components composite —
   `DialogTrigger asChild` / `DialogClose asChild` reuse any button styling
   (`components/ui/dialog.tsx:71`), and Radix merges props onto the child via
   React ref forwarding and the `Slot` pattern. My dialog owns its markup, so a
   consumer wanting a branded Close button must fork the component.

5. **Assistive-tech labelling is a hand chore.** I wire `aria-labelledby`
   manually with `useId`. In shadcn, `DialogTitle`/`DialogDescription` are
   compound components that Radix auto-links to the dialog (`aria-labelledby`,
   `aria-describedby`) without the consumer touching ids
   (`components/ui/dialog.tsx:125`).

For the disclosure there was no shadcn equivalent to add, so the comparison is
against the APG pattern only — and the hand version matches it on the essentials
(native `button` trigger, `aria-expanded`, `aria-controls`, `role="region"`).

## The flip side: what the hand-built version surfaced

Reading Radix's output for the first time hides effort — the value of building
by hand:

- **The gaps above are only visible once you know the mechanics.** shadcn's
  source shows `asChild` and portals but not *why* they exist; implementing the
  focus trap, roving tabindex, and sticky `document` listener is what makes the
  Radix design decisions legible.
- **My roll fails at nested contexts** (gap 1) — a real design lesson in how
  state ownership and event delegation scale, not something styling can fix.

## Verification

- `npm run test` — unit tests green
- `npm run lint` — ESLint clean
- `npm run build` — production build passes
- `npx playwright test` — responsive smoke tests (375px/1280px, all routes) plus
  `e2e/playground.spec.ts` keyboard-only suite: disclosure Space/Enter,
  tabs arrows/Home/End + roving tabindex, dialog focus trap/Tab wrap/Escape
  restore, and the shadcn dialog Escape path