import { describe, expect, it } from "vitest";

import { validateBudgetForm } from "../validation";
import { budgetFormSchema } from "../budget.schema";

import { form } from "@/test/form-helper";

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

  // ── Schema preprocessor direct tests ──────────────────────────────────────

  it("schema amountFromForm and optional fields pass through non-string values", () => {
    const result = budgetFormSchema.safeParse({
      amount: 10000,
      category_id: null,
      period: "monthly",
      start_date: "2026-05-01",
      end_date: null,
      is_active: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(10000);
      expect(result.data.categoryId).toBeNull();
      expect(result.data.endDate).toBeNull();
      expect(result.data.isActive).toBe(true);
    }
  });

  it("schema optional fields pass through invalid Date objects (caught by string check)", () => {
    const result = budgetFormSchema.safeParse({
      amount: 10000,
      category_id: "",
      period: "monthly",
      start_date: new Date(),
      end_date: "",
      is_active: true,
    });
    // This will fail because start_date expects string, gets Date -> passed through -> zod string validation fails
    expect(result.success).toBe(false);
  });

  it("schema checkboxFromForm coerces null/undefined/non-boolean to false", () => {
    const result = budgetFormSchema.safeParse({
      amount: 10000,
      category_id: "",
      period: "monthly",
      start_date: "2026-05-01",
      end_date: "",
      is_active: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBe(false);
    }
  });
});
