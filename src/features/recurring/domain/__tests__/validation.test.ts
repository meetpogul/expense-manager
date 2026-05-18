import { describe, expect, it } from "vitest";

import { validateRecurringRuleForm } from "../validation";

function form(values: Record<string, string>) {
  const data = new FormData();

  Object.entries(values).forEach(([key, value]) => data.set(key, value));

  return data;
}

describe("recurring rule validation", () => {
  it("normalizes a valid expense rule", () => {
    const result = validateRecurringRuleForm(
      form({
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
      }),
    );

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
});
