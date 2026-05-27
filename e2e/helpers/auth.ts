import type { BrowserContext, Page } from "@playwright/test";
import { loadEnvFile } from "./load-env";

loadEnvFile();

const STORAGE_STATE_PATH = "e2e/.auth/user.json";

export function getTestCredentials() {
  const email = process.env.E2E_TEST_USER_EMAIL;
  const password = process.env.E2E_TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "E2E_TEST_USER_EMAIL and E2E_TEST_USER_PASSWORD must be set in .env.local or environment",
    );
  }

  return { email, password };
}

export async function loginAsTestUser(page: Page) {
  const { email, password } = getTestCredentials();
  await page.goto("/auth/login", { waitUntil: "networkidle", timeout: 60_000 });
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).last().click();
  await page.waitForURL("/", { timeout: 30_000 });
}

export async function saveAuthState(context: BrowserContext) {
  await context.storageState({ path: STORAGE_STATE_PATH });
}

export function getStorageStatePath() {
  return STORAGE_STATE_PATH;
}
