import { emptyActionState } from "@/lib/actions/state";
import { stringFromFormData } from "@/shared/application/form-data";
import { fieldErrorsFromZod } from "@/shared/application/zod-errors";

import { budgetFormSchema, type BudgetInput } from "./budget.schema";

import type { ActionState } from "@/lib/actions/state";
import type { z } from "zod";

type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; state: ActionState };

function resultFromSchema<T>(
  parsed: { success: true; data: T } | { success: false; error: z.ZodError },
): ValidationResult<T> {
  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }

  return {
    ok: false,
    state: {
      ok: false,
      message: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    },
  };
}

export function validateBudgetForm(
  formData: FormData,
): ValidationResult<BudgetInput> {
  return resultFromSchema(
    budgetFormSchema.safeParse({
      amount: stringFromFormData(formData, "amount"),
      category_id: stringFromFormData(formData, "category_id"),
      end_date: stringFromFormData(formData, "end_date"),
      is_active: formData.get("is_active") ?? "false",
      period: stringFromFormData(formData, "period"),
      start_date: stringFromFormData(formData, "start_date"),
    }),
  );
}

export { emptyActionState };
export type { BudgetInput };
