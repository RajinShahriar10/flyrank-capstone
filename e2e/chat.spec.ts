import { expect, test } from "@playwright/test";

test("stream page renders the chat shell without an API key", async ({ page }) => {
  await page.goto("/stream");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("AI chat");
  await expect(page.getByLabel("Message")).toBeEditable();
  await expect(page.getByRole("button", { name: /send/i })).toBeDisabled();
  await expect(page.getByText(/start a conversation/i)).toBeVisible();
});