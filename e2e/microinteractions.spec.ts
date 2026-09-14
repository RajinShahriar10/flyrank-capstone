import { expect, test } from "@playwright/test";

test("forced error shows a retry state and forced success settles back to idle", async ({
  page,
}) => {
  await page.goto("/microinteractions");

  const forceError = page.getByRole("button", { name: /force error/i });
  await forceError.click();
  await expect(page.getByRole("button", { name: /try again/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /try again/i })).toHaveAttribute(
    "data-state",
    "error",
  );

  const forceSuccess = page.getByRole("button", { name: /force success/i });
  await forceSuccess.click();
  // Success appears briefly while the action resolves...
  await expect(page.getByRole("button", { name: /success/i })).toBeVisible();
  // ...then the button returns to idle.
  await expect(page.getByRole("button", { name: /force success/i })).toBeVisible();
});

test("retrying a forced error re-runs the button action", async ({ page }) => {
  await page.goto("/microinteractions");

  await page.getByRole("button", { name: /force error/i }).click();
  const retry = page.getByRole("button", { name: /try again/i });
  await expect(retry).toBeVisible();

  await retry.click();
  await expect(page.getByRole("button", { name: /try again/i })).toBeVisible();
});