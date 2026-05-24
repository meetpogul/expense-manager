import type { Page } from "@playwright/test";
import { loadEnvFile } from "./load-env";
import { TEST_PREFIX } from "./constants";

loadEnvFile();

function getAdminConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set",
    );
  }

  return { url, key };
}

function adminHeaders(key: string) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

async function deleteMatching(page: Page, table: string, field: string) {
  const { url, key } = getAdminConfig();
  const encodedValue = encodeURIComponent(`${TEST_PREFIX}%`);
  const filter = `${field}=like.${encodedValue}`;

  try {
    await page.request.fetch(`${url}/rest/v1/${table}?${filter}`, {
      method: "DELETE",
      headers: {
        ...adminHeaders(key),
        Prefer: "return=minimal",
      },
    });
  } catch {
    // Network errors during cleanup should not crash the worker
  }
}

export async function cleanupTestData(page: Page) {
  await deleteMatching(page, "transactions", "merchant_name");
  await deleteMatching(page, "recurring_rules", "note");
  await deleteMatching(page, "budgets", "name");
  await deleteMatching(page, "categories", "name");
  await deleteMatching(page, "accounts", "name");
}
