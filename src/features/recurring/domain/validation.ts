import { emptyActionState } from "@/lib/actions/state";
import { stringFromFormData } from "@/shared/application/form-data";
import { fieldErrorsFromZod } from "@/shared/application/zod-errors";

import {
  recurringRuleFormSchema,
  type RecurringRuleInput,
} from "./recurring.schema";

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
