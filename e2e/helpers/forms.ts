import { expect, type Page } from "@playwright/test";

export async function createAccount(page: Page, name: string) {
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
