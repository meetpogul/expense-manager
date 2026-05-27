import { describe, expect, it } from "vitest";

import {
  mutationTransactionFromRow,
  rowFromNewTransaction,
  rowFromTransactionChanges,
} from "../transaction-row.mapper";

describe("shared transaction-row.mapper", () => {
  describe("rowFromNewTransaction", () => {
    it("includes user_id from the NewTransaction", () => {
      const row = rowFromNewTransaction({
        account_id: "acc-1",
        amount: 500,
        category_id: "cat-1",
        date: "2026-05-18",
        is_recurring: false,
        merchant_name: null,
        note: "Lunch",
        recurring_id: null,
        type: "expense",
        user_id: "user-1",
      });

      expect(row.user_id).toBe("user-1");
      expect(row.account_id).toBe("acc-1");
      expect(row.amount).toBe(500);
      expect(row.type).toBe("expense");
    });

    it("passes through optional fields: is_recurring and recurring_id", () => {
      const row = rowFromNewTransaction({
        account_id: "acc-1",
        amount: 2500,
        category_id: "rent",
        date: "2026-05-01",
        is_recurring: true,
        merchant_name: null,
        note: "Rent",
        recurring_id: "rule-1",
        type: "expense",
        user_id: "user-1",
      });

      expect(row.is_recurring).toBe(true);
      expect(row.recurring_id).toBe("rule-1");
    });

    it("handles null optional fields", () => {
      const row = rowFromNewTransaction({
        account_id: "acc-1",
        amount: 100,
        category_id: null,
        date: "2026-05-18",
        is_recurring: false,
        merchant_name: null,
        note: null,
        recurring_id: null,
        type: "income",
        user_id: "user-1",
      });

      expect(row.category_id).toBeNull();
      expect(row.note).toBeNull();
      expect(row.merchant_name).toBeNull();
    });
  });

  describe("rowFromTransactionChanges", () => {
    it("maps changes fields correctly", () => {
      const row = rowFromTransactionChanges({
        account_id: "acc-2",
        amount: 800,
        category_id: "food",
        date: "2026-05-20",
        merchant_name: "Swiggy",
        note: "Dinner",
        type: "expense",
      });

      expect(row.account_id).toBe("acc-2");
      expect(row.amount).toBe(800);
      expect(row.merchant_name).toBe("Swiggy");
    });

    it("omits is_recurring and recurring_id when not present in changes", () => {
      const row = rowFromTransactionChanges({
        account_id: "acc-2",
        amount: 800,
        category_id: "food",
        date: "2026-05-20",
        merchant_name: null,
        note: null,
        type: "expense",
      });

      // These keys should NOT be present (not set in the changes)
      expect("is_recurring" in row).toBe(false);
      expect("recurring_id" in row).toBe(false);
    });
  });

  describe("mutationTransactionFromRow", () => {
    it("normalizes a raw database row to a TransactionRecord", () => {
      const raw = {
        id: "tx-1",
        account_id: "acc-1",
        amount: "500.00",
        category_id: "food",
        date: "2026-05-18",
        deleted_at: null,
        is_recurring: false,
        merchant_name: "Swiggy",
        note: "Lunch",
        recurring_id: null,
        type: "expense",
      };

      const record = mutationTransactionFromRow(raw);

      expect(record.id).toBe("tx-1");
      expect(record.amount).toBe(500); // number coercion
      expect(record.type).toBe("expense");
      expect(record.deleted_at).toBeNull();
    });

    it("defaults unknown type to 'expense'", () => {
      const raw = {
        id: "tx-2",
        account_id: "acc-1",
        amount: "0",
        category_id: null,
        date: "2026-05-18",
        deleted_at: null,
        is_recurring: false,
        merchant_name: null,
        note: null,
        recurring_id: null,
        type: "transfer", // not income or expense
      };

      const record = mutationTransactionFromRow(raw);
      expect(record.type).toBe("expense");
    });

    it("defaults amount to 0 when missing", () => {
      const raw = {
        id: "tx-3",
        account_id: "acc-1",
        amount: null,
        category_id: null,
        date: "2026-05-18",
        deleted_at: null,
        is_recurring: null,
        merchant_name: null,
        note: null,
        recurring_id: null,
        type: "income",
      };

      const record = mutationTransactionFromRow(raw);
      expect(record.amount).toBe(0);
      expect(record.is_recurring).toBe(false);
    });
  });
});
