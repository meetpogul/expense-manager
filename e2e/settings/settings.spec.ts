import { expect, test } from "@playwright/test";

test.describe("Settings", () => {
  test("displays locale info", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByText("INR / India formatting")).toBeVisible();
  });

  test("quick links navigate correctly", async ({ page }) => {
    await page.goto("/settings");
    await page.locator('main a[href="/accounts"]').first().click();
    await expect(page).toHaveURL("/accounts");
    await page.goBack();
    await page.waitForLoadState("domcontentloaded");
    await page.locator('main a[href="/categories"]').first().click();
    await expect(page).toHaveURL("/categories");
  });
});
