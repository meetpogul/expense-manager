import { expect, test } from "@playwright/test";
import { TEST_CATEGORY } from "../../helpers/constants";

test.describe("Categories - Delete", () => {
  const uid = String(Math.random()).slice(2, 8);
  const name = `${TEST_CATEGORY.name}-${uid}`;

  test("soft-deletes a user-created category", async ({ page }) => {
    await page.goto("/categories");
    await page.getByLabel("Name").fill(name);
    await page.getByRole("button", { name: "Save category" }).click();
    await expect(page.getByText("Category saved.")).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole("button", { name: `Delete ${name}` }).click();
    await expect(page.getByText(name)).toBeHidden({ timeout: 15_000 });
  });
});
