import { expect, test } from "@playwright/test";
import {
  TEST_ACCOUNT,
  TEST_CATEGORY,
  TEST_BUDGET,
  TEST_EXPENSE,
} from "../../helpers/constants";

test.describe("Budget Detail", () => {
  test.setTimeout(120_000);
  const uid = String(Math.random()).slice(2, 8);
  const accountName = `${TEST_ACCOUNT.name}-${uid}`;
  const categoryName = `${TEST_CATEGORY.name}-${uid}`;
  const merchant = `${TEST_EXPENSE.merchant}-${uid}`;

  test.beforeEach(async ({ page }) => {
    // 1. Create account
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
      await page.getByLabel("Name").fill(accountName);
      await page.getByRole("button", { name: "Save account" }).click();
    }
    await expect(page.getByText("Account saved.")).toBeVisible({
      timeout: 10_000,
    });

    // 2. Create category
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
      await page.getByLabel("Name").fill(categoryName);
      await page.getByRole("button", { name: "Save category" }).click();
    }
    await expect(page.getByText("Category saved.")).toBeVisible({
      timeout: 10_000,
    });

    // 3. Create budget
    await page.goto("/budgets");
    await page.waitForTimeout(1500);
    await page.getByLabel("Limit").fill(TEST_BUDGET.amount);
    await page.getByLabel("Category").selectOption(categoryName);
    await page.getByRole("button", { name: "Save budget" }).click();
    await page.waitForTimeout(500);
    if (page.url().includes("?")) {
      await page.reload();
      await page.waitForTimeout(1500);
      await page.getByLabel("Limit").fill(TEST_BUDGET.amount);
      await page.getByLabel("Category").selectOption(categoryName);
      await page.getByRole("button", { name: "Save budget" }).click();
    }
    await expect(page.getByText("Budget saved.")).toBeVisible({
      timeout: 10_000,
    });

    // 4. Create transaction
    await page.goto("/transactions");
    await page.waitForTimeout(1500);
    await page.getByLabel("Amount").fill(TEST_EXPENSE.amount);
    await page.getByLabel("Merchant").fill(merchant);
    await page.getByLabel("Account").selectOption(accountName);
    await page.getByLabel("Category").selectOption(categoryName);
    await page.getByRole("button", { name: "Save transaction" }).click();
    await page.waitForTimeout(500);
    if (page.url().includes("?")) {
      await page.reload();
      await page.waitForTimeout(1500);
      await page.getByLabel("Amount").fill(TEST_EXPENSE.amount);
      await page.getByLabel("Merchant").fill(merchant);
      await page.getByLabel("Account").selectOption(accountName);
      await page.getByLabel("Category").selectOption(categoryName);
      await page.getByRole("button", { name: "Save transaction" }).click();
    }
    await expect(page.getByText("Transaction saved.")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("views budget detail and verifies metrics and transactions", async ({
    page,
  }) => {
    await page.goto("/budgets");
    await page.waitForTimeout(1500);

    // click aria-label="View budget"
    await page.getByLabel("View budget").first().click();

    // URL is /budgets/[id]
    await expect(page).toHaveURL(/\/budgets\/.+/);

    // verify heading contains category name
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      categoryName,
    );

    // verify "Related transactions" section
    await expect(page.getByText("Related transactions")).toBeVisible();
    await expect(page.getByText(merchant)).toBeVisible();

    // verify metric values (Used, Remaining, Limit)
    await expect(page.getByText(/1,500|1500/)).toBeVisible();
    await expect(page.getByText(/8,500|8500/)).toBeVisible();
    await expect(page.getByText(/10,000|10000/)).toBeVisible();
  });
});
