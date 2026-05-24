import { expect, test } from "@playwright/test";
import { TEST_ACCOUNT, TEST_INCOME } from "../../helpers/constants";

test.describe("Transactions - Create", () => {
  const uid = String(Math.random()).slice(2, 8);
  const accountName = `${TEST_ACCOUNT.name}-${uid}`;

  test.beforeEach(async ({ page }) => {
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
  });

  test("creates an expense transaction", async ({ page }) => {
    await page.goto("/transactions");
    await page.waitForTimeout(1500);
    await page.getByLabel("Amount").fill(TEST_INCOME.amount);
    await page.getByLabel("Merchant").fill(`E2E-TEST-Merchant-${uid}`);
    await page.getByLabel("Note").fill(`E2E-TEST-Note-Expense-${uid}`);
    await page.getByRole("button", { name: "Save transaction" }).click();
    await page.waitForTimeout(500);
    if (page.url().includes("?")) {
      await page.reload();
      await page.waitForTimeout(1500);
      await page.getByLabel("Amount").fill(TEST_INCOME.amount);
      await page.getByLabel("Merchant").fill(`E2E-TEST-Merchant-${uid}`);
      await page.getByLabel("Note").fill(`E2E-TEST-Note-Expense-${uid}`);
      await page.getByRole("button", { name: "Save transaction" }).click();
    }
    await expect(page.getByText("Transaction saved.")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("creates an income transaction", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/transactions");
    await page.waitForTimeout(1500);
    await page.getByRole("button", { name: "Income" }).click();
    await page.getByLabel("Amount").fill(TEST_INCOME.amount);
    await page.getByLabel("Merchant").fill(`E2E-TEST-Merchant-Income-${uid}`);
    await page.getByRole("button", { name: "Save transaction" }).click();
    await page.waitForTimeout(500);
    if (page.url().includes("?")) {
      await page.reload();
      await page.waitForTimeout(1500);
      await page.getByRole("button", { name: "Income" }).click();
      await page.getByLabel("Amount").fill(TEST_INCOME.amount);
      await page.getByLabel("Merchant").fill(`E2E-TEST-Merchant-Income-${uid}`);
      await page.getByRole("button", { name: "Save transaction" }).click();
    }
    await expect(page.getByText("Transaction saved.")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("shows validation error on zero amount", async ({ page }) => {
    await page.goto("/transactions");
    await page.waitForTimeout(1500);
    await page.getByLabel("Amount").fill("0");
    await page.getByRole("button", { name: "Save transaction" }).click();
    await expect(page.getByText("Enter an amount greater than 0.")).toBeVisible(
      { timeout: 10_000 },
    );
  });
});
