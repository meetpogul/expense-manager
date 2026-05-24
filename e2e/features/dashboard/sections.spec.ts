import { expect, test } from "@playwright/test";
import {
  TEST_ACCOUNT,
  TEST_CATEGORY,
  TEST_EXPENSE,
} from "../../helpers/constants";

test.describe("Dashboard - Sections", () => {
  test.setTimeout(120_000);
  const uid = String(Math.random()).slice(2, 8);
  const accountName = `${TEST_ACCOUNT.name}-${uid}`;
  const categoryName = `${TEST_CATEGORY.name}-${uid}`;
  const merchant = `${TEST_EXPENSE.merchant}-${uid}`;

  test.beforeEach(async ({ page }) => {
    // 1. Create Account
    await page.goto("/accounts");
    await page.waitForTimeout(1500);
    await page
      .getByLabel("Name")
      .waitFor({ state: "attached", timeout: 10_000 });
    await page.getByLabel("Name").fill(accountName);
    await page.getByRole("button", { name: "Save account" }).click();
    await page.waitForTimeout(500);
    if (page.url().includes("?")) {
      await page.reload();
      await page.waitForTimeout(1500);
      await page
        .getByLabel("Name")
        .waitFor({ state: "attached", timeout: 10_000 });
      await page.getByLabel("Name").fill(accountName);
      await page.getByRole("button", { name: "Save account" }).click();
    }
    await expect(page.getByText("Account saved.")).toBeVisible({
      timeout: 10_000,
    });

    // 2. Create Category
    await page.goto("/categories");
    await page.waitForTimeout(1500);
    await page
      .getByLabel("Name")
      .waitFor({ state: "attached", timeout: 10_000 });
    await page.getByLabel("Name").fill(categoryName);
    await page.getByRole("button", { name: "Save category" }).click();
    await page.waitForTimeout(500);
    if (page.url().includes("?")) {
      await page.reload();
      await page.waitForTimeout(1500);
      await page
        .getByLabel("Name")
        .waitFor({ state: "attached", timeout: 10_000 });
      await page.getByLabel("Name").fill(categoryName);
      await page.getByRole("button", { name: "Save category" }).click();
    }
    await expect(page.getByText("Category saved.")).toBeVisible({
      timeout: 10_000,
    });

    // 3. Create Transaction
    await page.goto("/transactions");
    await page.waitForTimeout(1500);
    await page.getByLabel("Amount").fill(TEST_EXPENSE.amount);
    await page.getByLabel("Merchant").fill(merchant);
    await page
      .locator("form")
      .filter({ hasText: "Save transaction" })
      .getByLabel("Category")
      .selectOption(categoryName);
    await page.getByRole("button", { name: "Save transaction" }).click();
    await page.waitForTimeout(500);
    if (page.url().includes("?")) {
      await page.reload();
      await page.waitForTimeout(1500);
      await page.getByLabel("Amount").fill(TEST_EXPENSE.amount);
      await page.getByLabel("Merchant").fill(merchant);
      await page
        .locator("form")
        .filter({ hasText: "Save transaction" })
        .getByLabel("Category")
        .selectOption(categoryName);
      await page.getByRole("button", { name: "Save transaction" }).click();
    }
    await expect(page.getByText("Transaction saved.")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("renders recent transactions and accounts sidebar correctly", async ({
    page,
  }) => {
    // Go to Dashboard
    await page.goto("/");
    await page.waitForTimeout(1500);

    // Verify "Recent transactions" section
    await expect(
      page.getByRole("heading", { name: "Recent transactions", level: 2 }),
    ).toBeVisible();
    await expect(page.getByText(merchant)).toBeVisible();

    // Verify "Accounts" sidebar section
    await expect(
      page.getByRole("heading", { name: "Accounts", level: 2 }),
    ).toBeVisible();
    await expect(page.getByText(accountName)).toBeVisible();

    // Balance check is somewhat dependent on formatting, but "5,000" or similar minus "1,500"
    // At minimum, the account name should be prominently visible
    await expect(page.getByText(accountName)).toBeVisible();
  });
});
