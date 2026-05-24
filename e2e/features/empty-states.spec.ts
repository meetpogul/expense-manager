import { expect, test } from "@playwright/test";

test.describe("Empty state rendering", () => {
  const pages: { path: string; heading: string }[] = [
    { path: "/accounts", heading: "Accounts" },
    { path: "/transactions", heading: "Transactions" },
    { path: "/budgets", heading: "Budgets" },
    { path: "/recurring", heading: "Recurring" },
    { path: "/categories", heading: "Categories" },
  ];

  for (const { path, heading } of pages) {
    test(`page ${path} renders without crashing`, async ({ page }) => {
      await page.goto(path);
      await page.waitForTimeout(2000);
      await expect(page.locator("nav")).toBeVisible({ timeout: 10_000 });
      await expect(
        page.getByRole("heading", { name: heading, exact: true }),
      ).toBeVisible({ timeout: 10_000 });
    });
  }
});
