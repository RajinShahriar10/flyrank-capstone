"use client";

import { useState } from "react";
import { Disclosure } from "@/playground/disclosure";
import { Tabs } from "@/playground/tabs";
import { Dialog } from "@/playground/dialog";
import {
  Dialog as ShadcnDialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs as ShadcnTabs,
  TabsContent as ShadcnTabsContent,
  TabsList as ShadcnTabsList,
  TabsTrigger as ShadcnTabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const focusableInputClass =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm";

export default function PlaygroundDemo() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-12">
      <section aria-labelledby="disclosure-heading" className="max-w-xl space-y-3">
        <h2 id="disclosure-heading" className="text-xl font-semibold">
          Disclosure (hand-built)
        </h2>
        <Disclosure summary="What is this playground?">
          Three components implemented by hand against the W3C ARIA Authoring
          Practices patterns — no component libraries involved.
        </Disclosure>
        <Disclosure summary="How does the keyboard work?">
          The trigger is a native button, so Enter and Space toggle it.
          aria-expanded and aria-controls keep the open state announced to
          assistive technology.
        </Disclosure>
      </section>

      <section aria-labelledby="tabs-heading" className="max-w-2xl">
        <h2 id="tabs-heading" className="text-xl font-semibold">
          Tabs (hand-built)
        </h2>
        <Tabs
          label="Hand-built tabs"
          items={[
            {
              label: "Overview",
              content: (
                <p>
                  Arrow keys move between tabs and activate them (automatic
                  activation). Home and End jump to the first and last tab.
                </p>
              ),
            },
            {
              label: "Keyboard",
              content: (
                <p>
                  Roving tabindex keeps only the selected tab in the tab order;
                  an explicit Tab press moves into the focused panel.
                </p>
              ),
            },
            {
              label: "Focus",
              content: (
                <p>
                  Inactive panels are hidden, so their content is not reachable
                  by keyboard or screen reader.
                </p>
              ),
            },
          ]}
        />
      </section>

      <section aria-labelledby="dialog-heading" className="max-w-2xl">
        <h2 id="dialog-heading" className="text-xl font-semibold">
          Modal dialog (hand-built)
        </h2>
        <p className="mb-4 max-w-xl text-sm text-slate-600">
          Open it, Tab around, press Escape — focus returns to the trigger.
        </p>
        <button
          type="button"
          onClick={(e) => {
            (e.currentTarget as HTMLButtonElement).focus();
            setDialogOpen(true);
          }}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
        >
          Open dialog
        </button>
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="Confirm action"
        >
          <p className="text-sm text-slate-600">
            This modal traps focus inside the panel and restores it on close.
          </p>
          <input
            type="text"
            placeholder="Focusable input"
            aria-label="Confirmation name"
            className={`${focusableInputClass} mt-4`}
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDialogOpen(false)}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setDialogOpen(false)}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
            >
              Confirm
            </button>
          </div>
        </Dialog>
      </section>

      <section aria-labelledby="shadcn-heading" className="space-y-6">
        <h2 id="shadcn-heading" className="text-xl font-semibold">
          Compare: shadcn/ui dialog and tabs
        </h2>
        <ShadcnDialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open shadcn dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Radix-powered: focus scope, Escape, portal rendering and body
                scroll-lock come for free.
              </DialogDescription>
            </DialogHeader>
            <input
              type="text"
              placeholder="Display name"
              aria-label="Display name"
              className={focusableInputClass}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </ShadcnDialog>

        <ShadcnTabs defaultValue="account">
          <ShadcnTabsList aria-label="shadcn tabs">
            <ShadcnTabsTrigger value="account">Account</ShadcnTabsTrigger>
            <ShadcnTabsTrigger value="password">Password</ShadcnTabsTrigger>
          </ShadcnTabsList>
          <ShadcnTabsContent value="account">
            Account settings content.
          </ShadcnTabsContent>
          <ShadcnTabsContent value="password">
            Password settings content.
          </ShadcnTabsContent>
        </ShadcnTabs>
      </section>
    </div>
  );
}