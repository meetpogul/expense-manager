import { emptyActionState } from "@/lib/actions/state";
import { stringFromFormData } from "@/shared/application/form-data";
import { fieldErrorsFromZod } from "@/shared/application/zod-errors";

import { accountFormSchema, type AccountInput } from "./account.schema";

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

export function validateAccountForm(
  formData: FormData,
): ValidationResult<AccountInput> {
  return resultFromSchema(
    accountFormSchema.safeParse({
      name: stringFromFormData(formData, "name"),
      type: stringFromFormData(formData, "type"),
      balance: stringFromFormData(formData, "balance") || "0",
    }),
  );
}

export { emptyActionState };
export type { AccountInput };
