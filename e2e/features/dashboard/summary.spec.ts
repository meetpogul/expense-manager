import { expect, test } from "@playwright/test";

test.describe("Dashboard", () => {
  test("renders summary cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Total balance across")).toBeVisible();
  });
});
