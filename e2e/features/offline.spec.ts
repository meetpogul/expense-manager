import { expect, test } from "@playwright/test";

test.describe("Offline", () => {
  test("offline fallback page exists", async ({ request }) => {
    const res = await request.get("/offline.html");
    expect(res.ok()).toBe(true);
    const text = await res.text();
    expect(text).toContain("You are offline");
  });

  test("service worker serves cached page when offline", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);

    await page.context().setOffline(true);

    await page.goto("/", { timeout: 30_000 });
    await expect(page.locator("nav")).toBeVisible({ timeout: 10_000 });

    await page.context().setOffline(false);
  });

  test("service worker shows offline page for uncached route", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);

    await page.context().setOffline(true);

    await page
      .goto("/nonexistent-route-for-testing", {
        timeout: 30_000,
      })
      .catch(() => {});

    await expect(page.locator("body")).toContainText("You are offline", {
      timeout: 5_000,
    });

    await page.context().setOffline(false);
  });
});
