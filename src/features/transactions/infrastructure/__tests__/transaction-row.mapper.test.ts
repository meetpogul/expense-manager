import { describe, expect, it } from "vitest";

import {
  mutationTransactionFromRow,
  rowFromNewTransaction,
  rowFromTransactionChanges,
} from "../transaction-row.mapper";

describe("transaction row mapper", () => {
  it("maps Supabase rows into mutation transactions", () => {
    expect(
      mutationTransactionFromRow({
        account_id: "account-1",
        amount: "450",
        category_id: null,
        date: "2026-05-18",
        deleted_at: null,
        id: "transaction-1",
        is_recurring: true,
        merchant_name: "",
        note: "Lunch",
        recurring_id: "rule-1",
        type: "income",
      }),
    ).toMatchObject({
      account_id: "account-1",
      amount: 450,
      category_id: null,
      is_recurring: true,
      merchant_name: null,
      note: "Lunch",
      recurring_id: "rule-1",
      type: "income",
    });
  });

  it("maps Supabase rows into mutation transactions with full fields", () => {
    expect(
      mutationTransactionFromRow({
        account_id: "account-1",
        category_id: "category-1",
        date: "2026-05-18",
        deleted_at: "2026-05-18T00:00:00.000Z",
        id: "transaction-1",
        merchant_name: "Swiggy",
        note: null,
        type: "expense",
      }),
    ).toMatchObject({
      amount: 0, // Fallback amount
      category_id: "category-1",
      deleted_at: "2026-05-18T00:00:00.000Z",
      is_recurring: false, // Fallback
      merchant_name: "Swiggy",
      note: null, // Falsy note
      type: "expense",
    });
  });

  it("maps domain payloads into persistence rows", () => {
    const changes = {
      account_id: "account-1",
      amount: 450,
      category_id: "category-1",
      date: "2026-05-18",
      is_recurring: true,
      merchant_name: "Swiggy",
      note: "Lunch",
      recurring_id: "rule-1",
      type: "expense" as const,
    };

    expect(rowFromTransactionChanges(changes)).toEqual(changes);
    expect(rowFromNewTransaction({ ...changes, user_id: "user-1" })).toEqual({
      ...changes,
      user_id: "user-1",
    });
  });

  it("omits recurring columns for ordinary transaction updates", () => {
    expect(
      rowFromTransactionChanges({
        account_id: "account-1",
        amount: 450,
        category_id: "category-1",
        date: "2026-05-18",
        merchant_name: "Swiggy",
        note: "Lunch",
        type: "expense",
      }),
    ).not.toHaveProperty("recurring_id");
  });

  it("handles explicit undefined values for recurring fields", () => {
    const row = rowFromTransactionChanges({
      account_id: "account-1",
      amount: 450,
      category_id: "category-1",
      date: "2026-05-18",
      merchant_name: "Swiggy",
      note: "Lunch",
      type: "expense",
      is_recurring: undefined,
      recurring_id: undefined,
    });

    expect(row).toHaveProperty("is_recurring", false);
    expect(row).toHaveProperty("recurring_id", null);
  });
});
