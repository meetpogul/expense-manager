import { chromium, type FullConfig } from "@playwright/test";
import { loadEnvFile } from "./helpers/load-env";
import { saveAuthState, getTestCredentials } from "./helpers/auth";

loadEnvFile();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function globalSetup(_config: FullConfig) {
  const { email, password } = getTestCredentials();
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto("/auth/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).last().click();
    await page.waitForURL("/", { timeout: 15_000 });
    await saveAuthState(context);
    console.log("globalSetup: Auth state saved successfully.");
  } catch (error) {
    console.error("globalSetup: Failed to authenticate:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
