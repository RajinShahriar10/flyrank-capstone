import { expect, test, type Page } from "@playwright/test";

/** Firefox headless on CI reports no WebGL; the studio then correctly shows
 *  its quiet fallback instead of a canvas, so assertions must adapt. */
async function hasWebGL(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  });
}

test("3D studio launches on demand and exposes the configurator", async ({ page }) => {
  await page.goto("/3d");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("3D product studio");

  const webgl = await hasWebGL(page);
  if (!webgl) {
    // No WebGL → the designed fallback card is shown instead.
    await expect(page.getByRole("status")).toContainText("WebGL isn't supported here");
    return;
  }

  // Poster first: the WebGL bundle is not loaded until the user asks.
  const launch = page.getByRole("button", { name: /launch 3d studio/i });
  await expect(launch).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);

  await launch.click();

  // The scene mounts and the configurator becomes interactive. The WebGL bundle
  // is a client-side dynamic import, so give the slower engines headroom.
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByLabel(/metalness/i)).toBeVisible();

  // Interacting with the configurator updates state without breaking the page.
  await page.getByRole("button", { name: "Color #e11d48" }).click();
  await expect(page.getByRole("button", { name: "Color #e11d48" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator("canvas")).toBeVisible();
});