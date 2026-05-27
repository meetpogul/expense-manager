import { test } from "@playwright/test";

test.describe("Transactions - Edit", () => {
  // Bug: Route 404s when navigating to /transactions/[id]/edit
  // See issue / missing implementation for transaction edit page.
  test.skip("edits an existing transaction", async ({ page }) => {
    // 1. Create a transaction
    // 2. Click edit button on the transaction in the list
    // 3. Verify URL is /transactions/[id]/edit
    // 4. Change amount or merchant
    // 5. Submit and verify "Transaction updated." message
    // 6. Verify updated value in the list
  });
});
