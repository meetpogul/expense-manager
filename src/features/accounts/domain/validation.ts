import { emptyActionState } from "@/lib/actions/state";
import { stringFromFormData } from "@/shared/application/form-data";
import { fieldErrorsFromZod } from "@/shared/application/zod-errors";
import { validErr, validOk } from "@/shared/domain/result";

import { accountFormSchema, type AccountInput } from "./account.schema";

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
