import { expect, test } from "@playwright/test";

const ROUTES = [
  "/",
  "/tasks",
  "/settings",
  "/profile",
  "/health",
  "/playground",
  "/stream",
  "/microinteractions",
  "/3d",
  "/hero",
];

const VIEWPORTS = [
  { name: "mobile-375", width: 375, height: 667 },
  { name: "desktop-1280", width: 1280, height: 800 },
];

for (const viewport of VIEWPORTS) {
  test.describe(`${viewport.name}`, () => {
    test.use({ viewport });

    for (const route of ROUTES) {
      test(`${route} renders an h1 without horizontal overflow`, async ({ page }) => {
        await page.goto(route);

        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

        const hasHorizontalOverflow = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        );
        expect(hasHorizontalOverflow).toBe(false);
      });
    }
  });
}