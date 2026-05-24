import { expect, test } from "@playwright/test";
import { TEST_ACCOUNT, TEST_RECURRING } from "../../helpers/constants";

import type { Page } from "@playwright/test";

async function createAccount(page: Page, name: string) {
  await page.goto("/accounts");
  await page.waitForTimeout(1500);
  await page.getByLabel("Name").waitFor({ state: "attached", timeout: 10_000 });
  await page.getByLabel("Name").fill(name);
  await page.getByRole("button", { name: "Save account" }).click();
  await page.waitForTimeout(500);
  if (page.url().includes("?")) {
    await page.reload();
    await page.waitForTimeout(1500);
    await page
      .getByLabel("Name")
      .waitFor({ state: "attached", timeout: 10_000 });
    await page.getByLabel("Name").fill(name);
    await page.getByRole("button", { name: "Save account" }).click();
  }
  await expect(page.getByText("Account saved.")).toBeVisible({
    timeout: 10_000,
  });
}

async function createRecurringRule(
  page: Page,
  amount: string,
  frequency: string,
  note: string,
) {
  await page.goto("/recurring");
  await page.waitForTimeout(1500);
  await page
    .locator("#recurring_amount")
    .waitFor({ state: "attached", timeout: 10_000 });
  await page.locator("#recurring_amount").fill(amount);
  await page.locator("#frequency").selectOption(frequency);
  await page.locator("#note").fill(note);
  await page.getByRole("button", { name: "Save recurring" }).click();
  await page.waitForTimeout(500);
  if (page.url().includes("?")) {
    await page.reload();
    await page.waitForTimeout(1500);
    await page
      .locator("#recurring_amount")
      .waitFor({ state: "attached", timeout: 10_000 });
    await page.locator("#recurring_amount").fill(amount);
    await page.locator("#frequency").selectOption(frequency);
    await page.locator("#note").fill(note);
    await page.getByRole("button", { name: "Save recurring" }).click();
  }
  await expect(page.getByText("Recurring rule saved.")).toBeVisible({
    timeout: 10_000,
  });
}

test.describe("Recurring - Create", () => {
  const uid = String(Math.random()).slice(2, 8);
  const accountName = `${TEST_ACCOUNT.name}-${uid}`;

  test.beforeEach(async ({ page }) => {
    await createAccount(page, accountName);
  });

  test("creates a monthly expense recurring rule", async ({ page }) => {
    await createRecurringRule(
      page,
      TEST_RECURRING.amount,
      "monthly",
      `E2E-TEST-Recurring-Note-${uid}`,
    );
    await expect(
      page.getByText(`E2E-TEST-Recurring-Note-${uid}`),
    ).toBeVisible();
  });

  test("creates an income recurring rule without category", async ({
    page,
  }) => {
    await page.goto("/recurring");
    await page.waitForTimeout(1500);
    await page
      .locator("#recurring_amount")
      .waitFor({ state: "attached", timeout: 10_000 });
    await page.getByRole("button", { name: "Income" }).click();
    await page.locator("#recurring_amount").fill(TEST_RECURRING.amount);
    await page.locator("#frequency").selectOption("weekly");
    await page.locator("#note").fill(`E2E-TEST-Recurring-Income-${uid}`);
    await page.getByRole("button", { name: "Save recurring" }).click();
    await page.waitForTimeout(500);
    if (page.url().includes("?")) {
      await page.reload();
      await page.waitForTimeout(1500);
      await page
        .locator("#recurring_amount")
        .waitFor({ state: "attached", timeout: 10_000 });
      await page.getByRole("button", { name: "Income" }).click();
      await page.locator("#recurring_amount").fill(TEST_RECURRING.amount);
      await page.locator("#frequency").selectOption("weekly");
      await page.locator("#note").fill(`E2E-TEST-Recurring-Income-${uid}`);
      await page.getByRole("button", { name: "Save recurring" }).click();
    }
    await expect(page.getByText("Recurring rule saved.")).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByText(`E2E-TEST-Recurring-Income-${uid}`),
    ).toBeVisible();
  });

  test("shows validation error on zero amount", async ({ page }) => {
    await page.goto("/recurring");
    await page.waitForTimeout(1500);
    await page
      .locator("#recurring_amount")
      .waitFor({ state: "attached", timeout: 10_000 });
    await page.locator("#recurring_amount").fill("0");
    await page.getByRole("button", { name: "Save recurring" }).click();
    await expect(page.getByText("Enter an amount greater than 0.")).toBeVisible(
      { timeout: 10_000 },
    );
  });
});
