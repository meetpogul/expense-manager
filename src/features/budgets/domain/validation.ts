import { emptyActionState } from "@/lib/actions/state";
import { stringFromFormData } from "@/shared/application/form-data";
import { fieldErrorsFromZod } from "@/shared/application/zod-errors";
import { validErr, validOk } from "@/shared/domain/result";

import { budgetFormSchema, type BudgetInput } from "./budget.schema";

import type { ValidationResult } from "@/shared/domain/result";
import type { z } from "zod";

function resultFromSchema<T>(
  parsed: { success: true; data: T } | { success: false; error: z.ZodError },
): ValidationResult<T> {
  if (parsed.success) {
    return validOk(parsed.data);
  }

  return validErr({
    ok: false,
    message: "Check the highlighted fields.",
    fieldErrors: fieldErrorsFromZod(parsed.error),
  });
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
