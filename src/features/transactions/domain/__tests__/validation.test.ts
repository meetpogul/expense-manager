import { describe, expect, it } from "vitest";

import { validateTransactionForm } from "../validation";
import { transactionFormSchema } from "../transaction.schema";

import { form } from "@/test/form-helper";

const validExpenseFields = {
  type: "expense",
  amount: "450",
  account_id: "account-1",
  category_id: "category-1",
  date: "2026-05-10",
};

describe("transaction validation", () => {
  it("accepts a valid expense transaction", () => {
    const result = validateTransactionForm(form(validExpenseFields));
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

  // ── Edge cases ───────────────────────────────────────────────────────────

  it("rejects empty FormData (all fields missing)", () => {
    const result = validateTransactionForm(form());
    expect(result.ok).toBe(false);
  });

  it("rejects non-numeric string amount", () => {
    const result = validateTransactionForm(
      form({ ...validExpenseFields, amount: "abc" }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.state.fieldErrors).toMatchObject({
        amount: expect.any(String),
      });
    }
  });

  it("rejects amount of zero for both types", () => {
    const expense = validateTransactionForm(
      form({ ...validExpenseFields, amount: "0" }),
    );
    const income = validateTransactionForm(
      form({
        type: "income",
        amount: "0",
        account_id: "account-1",
        date: "2026-05-10",
      }),
    );
    expect(expense.ok).toBe(false);
    expect(income.ok).toBe(false);
  });

  it("accepts comma-formatted amount strings (e.g. '1,200')", () => {
    const result = validateTransactionForm(
      form({ ...validExpenseFields, amount: "1,200" }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.amount).toBe(1200);
    }
  });

  it("coerces empty category string to null and rejects it for expenses", () => {
    const result = validateTransactionForm(
      form({ ...validExpenseFields, category_id: "   " }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.state.fieldErrors).toMatchObject({
        category_id: expect.any(String),
      });
    }
  });

  it("accepts a future date", () => {
    const result = validateTransactionForm(
      form({ ...validExpenseFields, date: "2099-12-31" }),
    );
    expect(result.ok).toBe(true);
  });

  it("rejects a malformed date string (wrong format)", () => {
    const result = validateTransactionForm(
      form({ ...validExpenseFields, date: "31-12-2026" }),
    );
    // The refine catches this because "31-12-2026T00:00:00" is not a valid ISO date
    expect(result.ok).toBe(false);
  });

  it("trims optional fields: note and merchant_name coerce to null when blank", () => {
    const result = validateTransactionForm(
      form({ ...validExpenseFields, note: "   ", merchant_name: "" }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.note).toBeNull();
      expect(result.data.merchantName).toBeNull();
    }
  });

  it("income with no category returns ok with categoryId null", () => {
    const result = validateTransactionForm(
      form({
        type: "income",
        amount: "500",
        account_id: "account-1",
        date: "2026-05-10",
      }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.categoryId).toBeNull();
    }
  });

  it("maps form field names to camelCase output keys", () => {
    const result = validateTransactionForm(form(validExpenseFields));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toMatchObject({
        type: "expense",
        amount: 450,
        accountId: "account-1",
        categoryId: "category-1",
        date: "2026-05-10",
      });
    }
  });

  // ── Schema preprocessor direct tests ──────────────────────────────────────

  it("schema amountFromForm passes through non-string values and optionalText returns null", () => {
    const result = transactionFormSchema.safeParse({
      type: "expense",
      amount: 450,
      account_id: "account-1",
      category_id: "category-1",
      date: "2026-05-10",
      note: null, // non-string -> pass through -> matches z.string().nullable()
      merchant_name: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(450);
      expect(result.data.note).toBeNull();
      expect(result.data.merchantName).toBeNull();
    }
  });

  it("schema amountFromForm returns NaN for unparseable comma-stripped string", () => {
    const result = transactionFormSchema.safeParse({
      type: "expense",
      amount: "abc,def",
      account_id: "account-1",
      category_id: "category-1",
      date: "2026-05-10",
    });
    expect(result.success).toBe(false);
  });
});
