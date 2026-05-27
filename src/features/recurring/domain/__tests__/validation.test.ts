import { describe, expect, it } from "vitest";

import { validateRecurringRuleForm } from "../validation";
import { recurringRuleFormSchema } from "../recurring.schema";

import { form } from "@/test/form-helper";

const validExpenseFields = {
  type: "expense",
  amount: "2,500",
  account_id: "bank",
  category_id: "rent",
  note: "Rent",
  frequency: "monthly",
  start_date: "2026-05-01",
  end_date: "",
  next_due_date: "2026-06-01",
  is_active: "on",
};

describe("recurring rule validation", () => {
  it("normalizes a valid expense rule", () => {
    const result = validateRecurringRuleForm(form(validExpenseFields));

    expect(result).toEqual({
      ok: true,
      data: {
        accountId: "bank",
        amount: 2500,
        categoryId: "rent",
        endDate: null,
        frequency: "monthly",
        isActive: true,
        nextDueDate: "2026-06-01",
        note: "Rent",
        startDate: "2026-05-01",
        type: "expense",
      },
    });
  });

  it("allows income rules without a category", () => {
    const result = validateRecurringRuleForm(
      form({
        type: "income",
        amount: "60000",
        account_id: "bank",
        category_id: "",
        note: "Salary",
        frequency: "monthly",
        start_date: "2026-05-01",
        end_date: "",
        next_due_date: "2026-06-01",
      }),
    );
    expect(result.ok).toBe(true);
  });

  it("requires expense category and next date after start", () => {
    const result = validateRecurringRuleForm(
      form({
        type: "expense",
        amount: "100",
        account_id: "bank",
        category_id: "",
        frequency: "weekly",
        start_date: "2026-05-10",
        end_date: "",
        next_due_date: "2026-05-01",
      }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.state.fieldErrors).toMatchObject({
        category_id: "Choose a category for expenses.",
        next_due_date: "Next date must be on or after the start date.",
      });
    }
  });

  // ── Edge cases ───────────────────────────────────────────────────────────

  it("rejects end date before start date", () => {
    const result = validateRecurringRuleForm(
      form({
        ...validExpenseFields,
        start_date: "2026-05-10",
        end_date: "2026-05-01",
        next_due_date: "2026-05-10",
      }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.state.fieldErrors).toMatchObject({
        end_date: "End date must be after the start date.",
      });
    }
  });

  it("accepts end date equal to start date (boundary is strictly less)", () => {
    const result = validateRecurringRuleForm(
      form({
        ...validExpenseFields,
        start_date: "2026-05-10",
        end_date: "2026-05-10",
        next_due_date: "2026-05-10",
      }),
    );
    // end_date == start_date: not less than start so passes the end_date check
    expect(result.ok).toBe(true);
  });

  it("checkboxFromForm coerces 'on', 'true' → true, 'false' → false", () => {
    const onResult = validateRecurringRuleForm(
      form({ ...validExpenseFields, is_active: "on" }),
    );
    const trueResult = validateRecurringRuleForm(
      form({ ...validExpenseFields, is_active: "true" }),
    );
    const falseResult = validateRecurringRuleForm(
      form({ ...validExpenseFields, is_active: "false" }),
    );

    expect(onResult.ok && onResult.data.isActive).toBe(true);
    expect(trueResult.ok && trueResult.data.isActive).toBe(true);
    expect(
      falseResult.ok && !(falseResult.data as { isActive: boolean }).isActive,
    ).toBe(true);
  });

  it("rejects invalid frequency", () => {
    const result = validateRecurringRuleForm(
      form({ ...validExpenseFields, frequency: "hourly" }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.state.fieldErrors).toMatchObject({
        frequency: expect.any(String),
      });
    }
  });

  it("accepts all valid frequencies", () => {
    const frequencies = [
      "daily",
      "weekly",
      "biweekly",
      "monthly",
      "quarterly",
      "yearly",
    ];
    for (const frequency of frequencies) {
      const result = validateRecurringRuleForm(
        form({ ...validExpenseFields, frequency }),
      );
      expect(result.ok).toBe(true);
    }
  });

  it("rejects zero and negative amounts", () => {
    const zeroResult = validateRecurringRuleForm(
      form({ ...validExpenseFields, amount: "0" }),
    );
    const negativeResult = validateRecurringRuleForm(
      form({ ...validExpenseFields, amount: "-100" }),
    );
    expect(zeroResult.ok).toBe(false);
    expect(negativeResult.ok).toBe(false);
  });

  it("next_due_date equal to start_date is valid", () => {
    const result = validateRecurringRuleForm(
      form({
        ...validExpenseFields,
        start_date: "2026-05-10",
        next_due_date: "2026-05-10",
      }),
    );
    expect(result.ok).toBe(true);
  });

  // ── Schema preprocessor direct tests ──────────────────────────────────────

  it("schema amountFromForm and optionalTextFromForm pass through non-string values", () => {
    const result = recurringRuleFormSchema.safeParse({
      type: "expense",
      amount: 2500,
      account_id: "bank",
      category_id: "rent",
      note: null,
      frequency: "monthly",
      start_date: "2026-05-01",
      end_date: null, // this also gets coerced to null if missing or empty string usually, but passing null directly tests the pass-through
      next_due_date: "2026-06-01",
      is_active: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(2500);
      expect(result.data.note).toBeNull();
      expect(result.data.isActive).toBe(true);
    }
  });

  it("schema checkboxFromForm coerces null/undefined/non-boolean to false", () => {
    const result = recurringRuleFormSchema.safeParse({
      type: "expense",
      amount: 2500,
      account_id: "bank",
      category_id: "rent",
      note: "Rent",
      frequency: "monthly",
      start_date: "2026-05-01",
      end_date: "",
      next_due_date: "2026-06-01",
      is_active: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBe(false);
    }
  });
});
