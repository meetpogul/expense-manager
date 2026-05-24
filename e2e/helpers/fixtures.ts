import { test as base, expect, Browser } from "@playwright/test";
import { type Page } from "@playwright/test";
import { getStorageStatePath } from "./auth";

export const test = base.extend<{
  authedPage: Page;
}>({
  authedPage: async (
    { browser }: { browser: Browser },
    use: (page: Page) => Promise<void>,
  ) => {
    const context = await browser.newContext({
      storageState: getStorageStatePath(),
    });
    const page = await context.newPage();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
    await context.close();
  },
});

export { expect };
