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
});
