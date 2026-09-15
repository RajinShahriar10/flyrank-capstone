import { expect, test } from "@playwright/test";

test("hero paints the fullscreen shader with a headline on top", async ({ page }) => {
  await page.goto("/hero");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // The shader canvas mounts after a client-side dynamic import; give the
  // parallel CI workers enough time for it to hydrate on first load.
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15_000 });
});

test("hero under prefers-reduced-motion swaps the canvas for the static gradient", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/hero");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
});