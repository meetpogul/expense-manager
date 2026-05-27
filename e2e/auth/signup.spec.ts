import { expect, test } from "@playwright/test";
import { SELECTORS } from "../helpers/constants";

test.describe("Auth - Sign up", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("toggles to sign up mode, fills form, and submits", async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForTimeout(1000);

    // Toggle to Create account mode
    const modeGroup = page.getByRole("group", { name: "Authentication mode" });
    await modeGroup.getByRole("button", { name: "Create account" }).click();

    const uid = String(Math.random()).slice(2, 8);
    const uniqueEmail = `e2e-test-${uid}@example.com`;

    // Fill form
    await page.getByLabel("Name").fill("E2E Test User");
    await page.getByLabel("Email").fill(uniqueEmail);
    await page.getByLabel("Password").fill("password123");

    // Submit
    await page.getByRole("button", { name: "Create account" }).last().click();

    // In local development, depending on Supabase configuration,
    // this either logs the user in directly (redirects to /)
    // or shows an email confirmation message or validation error.
    await page.waitForTimeout(3000);

    const hasError = await page
      .locator(SELECTORS.errorMessage)
      .first()
      .isVisible();
    const errorMessageText = hasError
      ? await page.locator(SELECTORS.errorMessage).first().textContent()
      : "";

    if (hasError) {
      console.log("Error message: ", errorMessageText);
    }

    const isAtDashboard = page.url().endsWith("/");
    const hasConfirmationMessage = await page
      .getByText(/Account created|Check your email/i)
      .isVisible();

    // The test succeeds if we are at dashboard or we got a confirmation message
    // and there is no error message, EXCEPT if Supabase hits local rate limits.
    const isRateLimitError = errorMessageText
      ?.toLowerCase()
      .includes("rate limit");

    if (!isRateLimitError) {
      expect(hasError).toBe(false);
      expect(isAtDashboard || hasConfirmationMessage).toBe(true);
    } else {
      console.log(
        "Ignoring email rate limit error from local Supabase instance.",
      );
    }
  });
});
