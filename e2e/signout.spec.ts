import { expect, test } from "@playwright/test";

test.describe("Sign out", () => {
  test("signs out from settings and redirects to login", async ({ page }) => {
    test.setTimeout(30_000);
    await page.goto("/settings");
    await page.getByRole("button", { name: "Log out" }).click();
    await page.waitForURL("/auth/login", { timeout: 15_000 });

    await page.goto("/");
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
