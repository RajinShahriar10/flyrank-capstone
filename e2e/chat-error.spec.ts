import { expect, test } from "@playwright/test";

/** Minimal valid Vercel-AI data-stream response that echoes a full reply. */
const SUCCESS_STREAM = [
  'data: {"type":"start"}',
  "",
  'data: {"type":"text-start","id":"t1"}',
  "",
  'data: {"type":"text-delta","id":"t1","delta":"Hello from e2e!"}',
  "",
  'data: {"type":"text-end","id":"t1"}',
  "",
  'data: {"type":"finish","finishReason":"stop"}',
  "",
  "data: [DONE]",
].join("\n");

test("mid-stream failure shows a designed error and the retry recovers it", async ({
  page,
}) => {
  let calls = 0;
  await page.route("**/api/chat", async (route) => {
    calls += 1;
    if (calls === 1) {
      // Sabotage: the server explodes mid-request (network/API failure).
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Simulated upstream failure" }),
      });
      return;
    }
    // The retried request succeeds.
    await route.fulfill({
      status: 200,
      contentType: "text/event-stream",
      body: SUCCESS_STREAM,
    });
  });

  await page.goto("/stream");

  const input = page.getByLabel("Message");
  await input.fill("Say hello");
  await page.getByRole("button", { name: /send/i }).click();

  // Designed error state, with retry asking to re-run the failed reply.
  const alert = page.getByRole("alert").filter({ hasText: "interrupted" });
  await expect(alert).toBeVisible();
  await expect(alert).toContainText("The last reply was interrupted.");
  const retry = page.getByRole("button", { name: /retry last message/i });
  await expect(retry).toBeVisible();

  await retry.click();

  // The error clears and the retried reply streams in.
  await expect(page.getByText("Hello from e2e!")).toBeVisible();
  await expect(alert).not.toBeVisible();
  expect(calls).toBeGreaterThanOrEqual(2);
});