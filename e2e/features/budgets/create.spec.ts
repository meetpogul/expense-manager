import { expect, test } from "@playwright/test";
import {
  TEST_ACCOUNT,
  TEST_CATEGORY,
  TEST_BUDGET,
} from "../../helpers/constants";

test.describe("Budgets", () => {
  const uid = String(Math.random()).slice(2, 8);
  const accountName = `${TEST_ACCOUNT.name}-${uid}`;
  const categoryName = `${TEST_CATEGORY.name}-${uid}`;

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
  });

  test("creates a monthly budget", async ({ page }) => {
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
  });

  test("shows validation on zero amount", async ({ page }) => {
    await page.goto("/budgets");
    await page.waitForTimeout(1500);
    await page.getByRole("button", { name: "Save budget" }).click();
    await expect(page.getByText("Enter an amount greater than 0.")).toBeVisible(
      { timeout: 10_000 },
    );
  });
});
