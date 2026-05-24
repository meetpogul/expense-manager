import { expect, test } from "@playwright/test";
import { TEST_ACCOUNT } from "../../helpers/constants";

test.describe("Accounts - Edit", () => {
  const uid = String(Math.random()).slice(2, 8);
  const name = `${TEST_ACCOUNT.name}-${uid}`;

  test.beforeEach(async ({ page }) => {
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

  test("edits account name and balance", async ({ page }) => {
    test.setTimeout(60_000);
    await page.getByRole("link", { name: `Edit ${name}` }).click();
    await page.waitForURL(/edit=/);

    await page.getByLabel("Name").fill(`${name}-Updated`);
    await page.getByRole("button", { name: "Update account" }).click();
    await expect(page.getByText("Account updated.")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(`${name}-Updated`)).toBeVisible();
  });
});
