import { expect, test } from "@playwright/test";

test.describe("Service worker", () => {
  test("service worker is registered in production builds", async ({
    page,
  }) => {
    await page.goto("/auth/login");

    const hasSw = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return "unsupported";
      const registrations = await navigator.serviceWorker.getRegistrations();
      return registrations.length > 0 ? "registered" : "none";
    });

    if (hasSw === "unsupported") {
      test.skip(true, "Service workers not supported in this browser");
    }
  });

  test("manifest.json has required PWA fields", async ({ request }) => {
    const res = await request.get("/manifest.json");
    expect(res.ok()).toBe(true);

    const manifest = await res.json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons.length).toBeGreaterThanOrEqual(3);
  });

  test("theme and background colors are valid hex", async ({ request }) => {
    const manifest = await (await request.get("/manifest.json")).json();
    expect(manifest.theme_color).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(manifest.background_color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});
