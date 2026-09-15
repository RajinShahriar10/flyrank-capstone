import { expect, test } from "@playwright/test";

test.describe("hand-built disclosure", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/playground");
  });

  test("toggles with Space and Enter, wiring aria-expanded and aria-controls", async ({
    page,
  }) => {
    const trigger = page.getByRole("button", {
      name: /what is this playground/i,
    });

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    const regionId = await trigger.getAttribute("aria-controls");
    expect(regionId).toBeTruthy();

    await trigger.focus();
    await page.keyboard.press("Space");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(
      page.getByRole("region", { name: /what is this playground/i }),
    ).toBeVisible();

    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(
      page.getByRole("region", { name: /what is this playground/i }),
    ).toBeHidden();
  });
});

test.describe("hand-built tabs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/playground");
  });

  test("arrow keys, Home and End activate tabs; Tab moves into the panel", async ({
    page,
  }) => {
    const section = page.getByRole("region", { name: "Tabs (hand-built)" });
    const tablist = section.getByRole("tablist", { name: "Hand-built tabs" });
    const overview = tablist.getByRole("tab", { name: "Overview" });
    const keyboardTab = tablist.getByRole("tab", { name: "Keyboard" });
    const focusTab = tablist.getByRole("tab", { name: "Focus" });

    await overview.focus();
    await expect(overview).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("ArrowRight");
    await expect(keyboardTab).toBeFocused();
    await expect(keyboardTab).toHaveAttribute("aria-selected", "true");
    await expect(
      section.getByRole("tabpanel", { name: "Keyboard" }),
    ).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(focusTab).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("End");
    await expect(focusTab).toBeFocused();
    await expect(focusTab).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("Home");
    await expect(overview).toBeFocused();
    await expect(overview).toHaveAttribute("aria-selected", "true");

    // Roving tabindex: inactive tabs are skipped, so the next Tab lands in
    // the active tab panel.
    await page.keyboard.press("Tab");
    await expect(section.getByRole("tabpanel", { name: "Overview" })).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await expect(overview).toBeFocused();
  });
});

test.describe("hand-built modal dialog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/playground");
  });

  const activeElementInsideDialog = (page) =>
    page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      return (
        dialog !== null &&
        dialog.contains(document.activeElement)
      );
    });

  test("moves focus into the dialog and keeps it trapped across Tab and Shift+Tab", async ({
    page,
  }) => {
    const trigger = page.getByRole("button", { name: "Open dialog" });
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: "Confirm action" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(activeElementInsideDialog(page)).resolves.toBe(true);

    for (let i = 0; i < 8; i += 1) {
      await page.keyboard.press("Tab");
      await expect(activeElementInsideDialog(page)).resolves.toBe(true);
    }
    for (let i = 0; i < 8; i += 1) {
      await page.keyboard.press("Shift+Tab");
      await expect(activeElementInsideDialog(page)).resolves.toBe(true);
    }
  });

  test("wraps Tab from the last focusable back to the first, and Shift+Tab back", async ({
    page,
  }) => {
    const trigger = page.getByRole("button", { name: "Open dialog" });
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: "Confirm action" });
    const closeButton = dialog.getByRole("button", { name: "Close dialog" });
    const confirmButton = dialog.getByRole("button", { name: "Confirm" });

    await confirmButton.focus();
    await page.keyboard.press("Tab");
    await expect(closeButton).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await expect(confirmButton).toBeFocused();
  });

  test("closes on Escape and returns focus to the trigger", async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Open dialog" });
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: "Confirm action" });
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });
});

test.describe("shadcn/ui dialog (Radix)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/playground");
  });

  test("opens with portal focus handling and closes on Escape with focus restored", async ({
    page,
  }) => {
    const trigger = page.getByRole("button", { name: "Open shadcn dialog" });
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: "Edit profile" });
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });
});