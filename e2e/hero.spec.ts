import { expect, test, type Page } from "@playwright/test";

/** Returns whether this browser has a real WebGL context. Firefox headless on
 *  CI and a few other engines report no WebGL; the hero then (correctly) falls
 *  back to the static gradient, so assertions must adapt. */
async function hasWebGL(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  });
}

test("hero renders a headline and either the shader or its static fallback", async ({
  page,
}) => {
  await page.goto("/hero");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // The shader canvas mounts after a client-side dynamic import; give the
  // parallel CI workers enough time for it to hydrate on first load.
  const webgl = await hasWebGL(page);
  if (webgl) {
    await expect(page.locator("canvas")).toBeVisible({ timeout: 15_000 });
  } else {
    // No WebGL → the designed static gradient must still be there.
    await expect(page.locator("canvas")).toHaveCount(0);
  }
});

test("hero under prefers-reduced-motion swaps the canvas for the static gradient", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/hero");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
});