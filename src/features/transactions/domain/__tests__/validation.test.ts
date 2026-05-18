import { describe, expect, it } from "vitest";

import { validateTransactionForm } from "../validation";

function form(values: Record<string, string>) {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    formData.set(key, value);
  });

  return formData;
}

describe("transaction validation", () => {
  it("accepts a valid expense transaction", () => {
    const result = validateTransactionForm(
      form({
        type: "expense",
        amount: "450",
        account_id: "account-1",
        category_id: "category-1",
        date: "2026-05-10",
      }),
    );

    expect(result.ok).toBe(true);
  });

  it("requires amount, account, and category for expenses", () => {
    const result = validateTransactionForm(
      form({
        type: "expense",
        amount: "0",
        date: "2026-05-10",
      }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.state.fieldErrors).toMatchObject({
        amount: expect.any(String),
        account_id: expect.any(String),
        category_id: expect.any(String),
      });
    }
  });

  it("rejects invalid transaction type and invalid dates", () => {
    const result = validateTransactionForm(
      form({
        type: "transfer",
        amount: "100",
        account_id: "account-1",
        category_id: "category-1",
        date: "not-a-date",
      }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.state.fieldErrors).toMatchObject({
        type: expect.any(String),
        date: expect.any(String),
      });
    }
  });

  it("allows income without a category", () => {
    const result = validateTransactionForm(
      form({
        type: "income",
        amount: "10000",
        account_id: "account-1",
        date: "2026-05-10",
      }),
    );

    expect(result.ok).toBe(true);
  });
});
