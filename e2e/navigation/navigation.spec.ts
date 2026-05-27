import { expect, test } from "@playwright/test";

test.describe("Navigation (authenticated)", () => {
  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/transactions", label: "Transactions" },
    { href: "/accounts", label: "Accounts" },
    { href: "/budgets", label: "Budgets" },
    { href: "/recurring", label: "Recurring" },
    { href: "/categories", label: "Categories" },
    { href: "/settings", label: "Settings" },
  ];

  for (const { href, label } of navLinks) {
    test(`nav link "${label}" navigates to ${href}`, async ({ page }) => {
      test.setTimeout(30_000);
      await page.goto("/");
      await page
        .locator(`nav a[href="${href}"]`)
        .first()
        .waitFor({ state: "attached", timeout: 10_000 });
      await page.locator(`nav a[href="${href}"]`).first().click();
      await expect(page).toHaveURL(href, { timeout: 10_000 });
    });
  }

  test("404 page returns correct status", async ({ page }) => {
    const res = await page.goto("/nonexistent-route");
    expect(res?.status()).toBe(404);
  });
});

test.describe("Route guards (unauthenticated)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  const protectedRoutes = [
    "/",
    "/accounts",
    "/transactions",
    "/budgets",
    "/recurring",
    "/categories",
    "/settings",
  ];

  for (const route of protectedRoutes) {
    test(`redirects to login when accessing ${route}`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  }
});
