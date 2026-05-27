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

test.describe("Recurring - Edit", () => {
  const uid = String(Math.random()).slice(2, 8);
  const accountName = `${TEST_ACCOUNT.name}-${uid}`;
  const note = `E2E-TEST-Recurring-Note-${uid}`;

  test.beforeEach(async ({ page }) => {
    await createAccount(page, accountName);
    await createRecurringRule(page, TEST_RECURRING.amount, "monthly", note);
  });

  test("edits a recurring rule amount and frequency", async ({ page }) => {
    test.setTimeout(60_000);
    await page
      .getByRole("link", { name: "Edit recurring rule" })
      .first()
      .click();
    await page.waitForURL(/\/recurring\?edit=/);

    await page
      .locator("#recurring_amount")
      .waitFor({ state: "attached", timeout: 10_000 });
    await page.locator("#recurring_amount").clear();
    await page.locator("#recurring_amount").fill("3000");
    await page.locator("#frequency").selectOption("weekly");
    await page.getByRole("button", { name: "Update recurring" }).click();
    await page.waitForTimeout(500);
    if (page.url().includes("?")) {
      await page.goto("/recurring");
      await page.waitForTimeout(1500);
      await page
        .getByRole("link", { name: "Edit recurring rule" })
        .first()
        .click();
      await page.waitForURL(/\/recurring\?edit=/);
      await page
        .locator("#recurring_amount")
        .waitFor({ state: "attached", timeout: 10_000 });
      await page.locator("#recurring_amount").clear();
      await page.locator("#recurring_amount").fill("3000");
      await page.locator("#frequency").selectOption("weekly");
      await page.getByRole("button", { name: "Update recurring" }).click();
    }
    await expect(page.getByText("Recurring rule updated.")).toBeVisible({
      timeout: 10_000,
    });
  });
});
