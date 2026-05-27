import { expect, test } from "@playwright/test";
import { TEST_ACCOUNT } from "../../helpers/constants";

test.describe("Accounts - Delete", () => {
  const uid = String(Math.random()).slice(2, 8);
  const name = `${TEST_ACCOUNT.name}-${uid}`;

  test("soft-deletes account", async ({ page }) => {
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

    await page.getByRole("button", { name: `Delete ${name}` }).click();
    await expect(page.getByText(name)).toBeHidden({ timeout: 15_000 });
  });
});
