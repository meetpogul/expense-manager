import { emptyActionState } from "@/lib/actions/state";
import { stringFromFormData } from "@/shared/application/form-data";
import { fieldErrorsFromZod } from "@/shared/application/zod-errors";

import {
  transactionFormSchema,
  type TransactionInput,
} from "./transaction.schema";

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

export function validateTransactionForm(
  formData: FormData,
): ValidationResult<TransactionInput> {
  return resultFromSchema(
    transactionFormSchema.safeParse({
      type: stringFromFormData(formData, "type"),
      amount: stringFromFormData(formData, "amount"),
      account_id: stringFromFormData(formData, "account_id"),
      category_id: stringFromFormData(formData, "category_id"),
      date: stringFromFormData(formData, "date"),
      note: stringFromFormData(formData, "note"),
      merchant_name: stringFromFormData(formData, "merchant_name"),
    }),
  );
}

export { emptyActionState };
export type { TransactionInput };
