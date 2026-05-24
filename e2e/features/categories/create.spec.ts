import { expect, test } from "@playwright/test";
import { TEST_CATEGORY, TEST_CATEGORY_BOTH } from "../../helpers/constants";

test.describe("Categories - Create", () => {
  const uid = String(Math.random()).slice(2, 8);

  test("creates an expense category", async ({ page }) => {
    const name = `${TEST_CATEGORY.name}-${uid}`;
    await page.goto("/categories");
    await page.getByLabel("Name").fill(name);
    await page.getByRole("button", { name: "Save category" }).click();
    await expect(page.getByText("Category saved.")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(name)).toBeVisible();
  });

  test("creates a both type category", async ({ page }) => {
    const name = `${TEST_CATEGORY_BOTH.name}-${uid}`;
    await page.goto("/categories");
    await page.getByLabel("Name").fill(name);
    await page.getByLabel("Type", { exact: true }).selectOption("both");
    await page.getByRole("button", { name: "Save category" }).click();
    await expect(page.getByText("Category saved.")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(name)).toBeVisible();
  });

  test("shows validation error on empty name", async ({ page }) => {
    await page.goto("/categories");
    await page.getByRole("button", { name: "Save category" }).click();
    await expect(page.getByText("Category name is required.")).toBeVisible({
      timeout: 10_000,
    });
  });
});
