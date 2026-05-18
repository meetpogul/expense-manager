import { describe, expect, it } from "vitest";

import { validateBudgetForm } from "../validation";

function form(values: Record<string, string>) {
  const data = new FormData();

  Object.entries(values).forEach(([key, value]) => data.set(key, value));

  return data;
}

describe("budget validation", () => {
  it("normalizes a valid overall monthly budget", () => {
    const result = validateBudgetForm(
      form({
        amount: "10,000",
        category_id: "",
        period: "monthly",
        start_date: "2026-05-01",
        end_date: "",
        is_active: "on",
      }),
    );

    expect(result).toEqual({
      ok: true,
      data: {
        amount: 10000,
        categoryId: null,
        endDate: null,
        isActive: true,
        period: "monthly",
        startDate: "2026-05-01",
      },
    });
  });

  it("returns field errors for invalid amount and date order", () => {
    const result = validateBudgetForm(
      form({
        amount: "0",
        category_id: "food",
        period: "monthly",
        start_date: "2026-05-10",
        end_date: "2026-05-01",
      }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.state.fieldErrors).toMatchObject({
        amount: "Enter an amount greater than 0.",
        end_date: "End date must be after the start date.",
      });
    }
  });
});
