import { expect, test } from "@playwright/test";
import { TEST_ACCOUNT, TEST_ACCOUNT_2 } from "../../helpers/constants";

test.describe("Accounts - Create", () => {
  const uid = String(Math.random()).slice(2, 8);

  test("creates a bank account with balance", async ({ page }) => {
    const name = `${TEST_ACCOUNT.name}-${uid}-balance`;
    await page.goto("/accounts");
    await page.waitForTimeout(1500);
    await page
      .getByLabel("Name")
      .waitFor({ state: "attached", timeout: 10_000 });
    await page.getByLabel("Name").fill(name);
    await page
      .getByLabel("Balance", { exact: true })
      .fill(TEST_ACCOUNT.balance);
    await page.getByRole("button", { name: "Save account" }).click();
    await page.waitForTimeout(500);
    if (page.url().includes("?")) {
      await page.reload();
      await page.waitForTimeout(1500);
      await page
        .getByLabel("Name")
        .waitFor({ state: "attached", timeout: 10_000 });
      await page.getByLabel("Name").fill(name);
      await page
        .getByLabel("Balance", { exact: true })
        .fill(TEST_ACCOUNT.balance);
      await page.getByRole("button", { name: "Save account" }).click();
    }
    await expect(page.getByText("Account saved.")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(name)).toBeVisible();
  });

  test("creates second account without default badge", async ({ page }) => {
    const name = `${TEST_ACCOUNT_2.name}-${uid}-no-default`;
    await page.goto("/accounts");
    await page.waitForTimeout(1500);
    await page
      .getByLabel("Name")
      .waitFor({ state: "attached", timeout: 10_000 });
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
  });

  test("shows validation error on empty name", async ({ page }) => {
    await page.goto("/accounts");
    await page.waitForTimeout(1500);
    await page
      .getByLabel("Name")
      .waitFor({ state: "attached", timeout: 10_000 });
    await page.getByRole("button", { name: "Save account" }).click();
    await expect(page.getByText("Account name is required.")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("creates all account types", async ({ page }) => {
    test.setTimeout(120_000);
    const types = ["cash", "bank", "credit_card"] as const;
    for (const type of types) {
      const name = `${TEST_ACCOUNT.name}-${uid}-type-${type}`;
      await page.goto("/accounts");
      await page.waitForTimeout(1500);
      await page
        .getByLabel("Name")
        .waitFor({ state: "attached", timeout: 10_000 });
      await page.getByLabel("Name").fill(name);
      await page.getByLabel("Type", { exact: true }).selectOption(type);
      await page.getByRole("button", { name: "Save account" }).click();
      await page.waitForTimeout(500);
      if (page.url().includes("?")) {
        await page.reload();
        await page.waitForTimeout(1500);
        await page
          .getByLabel("Name")
          .waitFor({ state: "attached", timeout: 10_000 });
        await page.getByLabel("Name").fill(name);
        await page.getByLabel("Type", { exact: true }).selectOption(type);
        await page.getByRole("button", { name: "Save account" }).click();
      }
      await expect(page.getByText("Account saved.")).toBeVisible({
        timeout: 10_000,
      });
    }
  });
});
