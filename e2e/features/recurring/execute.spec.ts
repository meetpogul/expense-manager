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

async function createDueRecurringRule(
  page: Page,
  amount: string,
  note: string,
) {
  const now = Date.now();
  const twoDaysAgo = new Date(now - 2 * 86400000).toISOString().split("T")[0];
  const yesterday = new Date(now - 86400000).toISOString().split("T")[0];
  await page.goto("/recurring");
  await page.waitForTimeout(1500);
  await page
    .locator("#recurring_amount")
    .waitFor({ state: "attached", timeout: 10_000 });
  await page.locator("#recurring_amount").fill(amount);
  await page.locator("#frequency").selectOption("daily");
  await page.locator("#recurring_start_date").fill(twoDaysAgo);
  await page.locator("#next_due_date").fill(yesterday);
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
    await page.locator("#frequency").selectOption("daily");
    await page.locator("#recurring_start_date").fill(twoDaysAgo);
    await page.locator("#next_due_date").fill(yesterday);
    await page.locator("#note").fill(note);
    await page.getByRole("button", { name: "Save recurring" }).click();
  }
  await expect(page.getByText("Recurring rule saved.")).toBeVisible({
    timeout: 10_000,
  });
}

test.describe("Recurring - Execute & Pause", () => {
  const uid = String(Math.random()).slice(2, 8);
  const accountName = `${TEST_ACCOUNT.name}-${uid}`;
  const note = `E2E-TEST-Recurring-Exec-${uid}`;

  test.beforeEach(async ({ page }) => {
    await createAccount(page, accountName);
    await createDueRecurringRule(page, TEST_RECURRING.amount, note);
  });

  test("pauses a recurring rule", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/recurring");
    await page.waitForTimeout(1500);
    await page
      .getByRole("button", { name: "Pause recurring rule" })
      .first()
      .waitFor({ state: "attached", timeout: 10_000 });
    await page
      .getByRole("button", { name: "Pause recurring rule" })
      .first()
      .click();
    await expect(page.getByText(note)).toBeVisible({ timeout: 10_000 });
  });

  test("executes a due recurring rule", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/recurring");
    await page.waitForTimeout(1500);
    await page
      .getByRole("button", { name: "Run due recurring rule" })
      .first()
      .waitFor({ state: "attached", timeout: 10_000 });
    const button = page
      .getByRole("button", { name: "Run due recurring rule" })
      .first();
    await button.click();
    await expect(page.getByText(note).first()).toBeVisible({ timeout: 10_000 });
  });
});
