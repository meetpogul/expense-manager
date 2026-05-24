import { emptyActionState } from "@/lib/actions/state";
import { stringFromFormData } from "@/shared/application/form-data";
import { fieldErrorsFromZod } from "@/shared/application/zod-errors";
import { validErr, validOk } from "@/shared/domain/result";

import {
  recurringRuleFormSchema,
  type RecurringRuleInput,
} from "./recurring.schema";

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

export function validateRecurringRuleForm(
  formData: FormData,
): ValidationResult<RecurringRuleInput> {
  return resultFromSchema(
    recurringRuleFormSchema.safeParse({
      account_id: stringFromFormData(formData, "account_id"),
      amount: stringFromFormData(formData, "amount"),
      category_id: stringFromFormData(formData, "category_id"),
      end_date: stringFromFormData(formData, "end_date"),
      frequency: stringFromFormData(formData, "frequency"),
      is_active: formData.get("is_active") ?? "false",
      next_due_date: stringFromFormData(formData, "next_due_date"),
      note: stringFromFormData(formData, "note"),
      start_date: stringFromFormData(formData, "start_date"),
      type: stringFromFormData(formData, "type"),
    }),
  );
}

export { emptyActionState };
export type { RecurringRuleInput };
