import { expect, test } from "@playwright/test";

test.describe("Responsive layout", () => {
  test("renders nav at mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForTimeout(2000);
    await expect(page.locator("nav")).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("nav a")).toHaveCount(7);
  });

  test("renders nav at tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await page.waitForTimeout(2000);
    await expect(page.locator("nav")).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("nav a")).toHaveCount(7);
  });

  test("create transaction form fits mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/transactions");
    await page.waitForTimeout(2000);
    await expect(page.getByLabel("Amount")).toBeVisible({ timeout: 10_000 });
  });
});
