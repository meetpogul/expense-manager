import { test as setup } from "@playwright/test";
import { loginAsTestUser, saveAuthState } from "./helpers/auth";

setup("authenticate as test user", async ({ page, context }) => {
  setup.setTimeout(120_000);
  await loginAsTestUser(page);
  await saveAuthState(context);
});
