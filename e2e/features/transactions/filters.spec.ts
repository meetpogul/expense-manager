import { expect, test } from "@playwright/test";
import { TEST_ACCOUNT, TEST_CATEGORY } from "../../helpers/constants";

test.describe("Transactions - Filters", () => {
  test.setTimeout(120_000);
  const uid = String(Math.random()).slice(2, 8);
  const accountName = `${TEST_ACCOUNT.name}-${uid}`;
  const categoryName1 = `${TEST_CATEGORY.name}-1-${uid}`;
  const categoryName2 = `${TEST_CATEGORY.name}-2-${uid}`;
  const merchant = `E2E-TEST-Merchant-${uid}`;
  const merchant2 = `E2E-TEST-Merchant-2-${uid}`;

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

    // 2. Create Category 1
    await page.goto("/categories");
    await page.waitForTimeout(1500);
    await page
      .getByLabel("Name")
      .waitFor({ state: "attached", timeout: 10_000 });
    await page.getByLabel("Name").fill(categoryName1);
    await page.getByRole("button", { name: "Save category" }).click();
    await page.waitForTimeout(500);
    if (page.url().includes("?")) {
      await page.reload();
      await page.waitForTimeout(1500);
      await page
        .getByLabel("Name")
        .waitFor({ state: "attached", timeout: 10_000 });
      await page.getByLabel("Name").fill(categoryName1);
      await page.getByRole("button", { name: "Save category" }).click();
    }
    await expect(page.getByText("Category saved.")).toBeVisible({
      timeout: 10_000,
    });

    // 3. Create Category 2
    await page.goto("/categories");
    await page.waitForTimeout(1500);
    await page.getByLabel("Name").fill(categoryName2);
    await page.getByRole("button", { name: "Save category" }).click();
    await page.waitForTimeout(500);
    if (page.url().includes("?")) {
      await page.reload();
      await page.waitForTimeout(1500);
      await page.getByLabel("Name").fill(categoryName2);
      await page.getByRole("button", { name: "Save category" }).click();
    }
    await expect(page.getByText("Category saved.")).toBeVisible({
      timeout: 10_000,
    });

    // 4. Create Transaction 1
    await page.goto("/transactions");
    await page.waitForTimeout(1500);
    await page.getByLabel("Amount").fill("1500");
    await page.getByLabel("Merchant").fill(merchant);
    // Use the form's exact label or id. The form label is "Category" and the filter aria-label is "Category"
    // Since there are two, we might need to target the form one specifically. Let's use getByRole for safety
    await page
      .locator("form")
      .filter({ hasText: "Save transaction" })
      .getByLabel("Category")
      .selectOption(categoryName1);
    await page.getByLabel("Date").fill("2026-05-10");
    await page.getByRole("button", { name: "Save transaction" }).click();
    await expect(page.getByText("Transaction saved.")).toBeVisible({
      timeout: 10_000,
    });

    // 5. Create Transaction 2
    await page.goto("/transactions");
    await page.waitForTimeout(1500);
    await page.getByLabel("Amount").fill("2500");
    await page.getByLabel("Merchant").fill(merchant2);
    await page
      .locator("form")
      .filter({ hasText: "Save transaction" })
      .getByLabel("Category")
      .selectOption(categoryName2);
    await page.getByLabel("Date").fill("2026-06-15");
    await page.getByRole("button", { name: "Save transaction" }).click();
    await expect(page.getByText("Transaction saved.")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("filters by type", async ({ page }) => {
    await page.goto("/transactions");
    await page.waitForTimeout(1500);
    await page.getByRole("combobox", { name: "Type" }).selectOption("expense");
    await page.getByRole("button", { name: "Filter" }).click();
    await expect(page.getByText(merchant)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(merchant2)).toBeVisible({ timeout: 10_000 });
  });

  test("filters by category", async ({ page }) => {
    await page.goto("/transactions");
    await page.waitForTimeout(1500);

    // Select categoryName1 in the filter form
    await page
      .getByRole("combobox", { name: "Category" })
      .selectOption(categoryName1);
    await page.getByRole("button", { name: "Filter" }).click();

    // Merchant 1 should be visible, Merchant 2 should NOT
    await expect(page.getByText(merchant)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(merchant2)).not.toBeVisible();
  });

  test("filters by date range", async ({ page }) => {
    await page.goto("/transactions");
    await page.waitForTimeout(1500);

    // Filter to only show June transactions
    await page.getByLabel("From date").fill("2026-06-01");
    await page.getByLabel("To date").fill("2026-06-30");
    await page.getByRole("button", { name: "Filter" }).click();

    // Merchant 2 should be visible, Merchant 1 should NOT
    await expect(page.getByText(merchant2)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(merchant)).not.toBeVisible();
  });
});
