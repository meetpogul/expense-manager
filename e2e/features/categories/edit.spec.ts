import { expect, test } from "@playwright/test";
import { TEST_CATEGORY } from "../../helpers/constants";

test.describe("Categories - Edit", () => {
  const uid = String(Math.random()).slice(2, 8);
  const name = `${TEST_CATEGORY.name}-${uid}`;

  test("edits a user-created category", async ({ page }) => {
    await page.goto("/categories");
    await page.getByLabel("Name").fill(name);
    await page.getByRole("button", { name: "Save category" }).click();
    await expect(page.getByText("Category saved.")).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole("link", { name: `Edit ${name}` }).click();
    await page.waitForURL(/edit=/);

    await page.getByLabel("Name").fill(`${name}-Updated`);
    await page.getByRole("button", { name: "Update category" }).click();
    await expect(page.getByText("Category updated.")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(`${name}-Updated`)).toBeVisible();
  });
});
