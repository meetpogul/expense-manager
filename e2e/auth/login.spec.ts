import { expect, test } from "@playwright/test";

test.describe("Login page (unauthenticated)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("renders form fields and brand", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByText("Expense Manager")).toBeVisible();
    await expect(page.getByText("Welcome back")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign in" }).last(),
    ).toBeVisible();
  });

  test("toggles between sign-in and sign-up mode", async ({ page }) => {
    await page.goto("/auth/login");
    const modeGroup = page.getByRole("group", { name: "Authentication mode" });

    await modeGroup.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Create account" }).last(),
    ).toBeVisible();

    await modeGroup.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByLabel("Name")).not.toBeVisible();
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByLabel("Email").fill("invalid@test.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).last().click();
    await expect(page.locator("form p")).toBeVisible({ timeout: 15_000 });
  });

  test("valid login redirects to dashboard", async ({ page }) => {
    const email = process.env.E2E_TEST_USER_EMAIL!;
    const password = process.env.E2E_TEST_USER_PASSWORD!;
    await page.goto("/auth/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).last().click();
    await expect(page).toHaveURL("/", { timeout: 15_000 });
  });
});
