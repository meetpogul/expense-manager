import { emptyActionState } from "@/lib/actions/state";
import { stringFromFormData } from "@/shared/application/form-data";
import { fieldErrorsFromZod } from "@/shared/application/zod-errors";
import { validErr, validOk } from "@/shared/domain/result";

import { categoryFormSchema, type CategoryInput } from "./category.schema";

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

export function validateCategoryForm(
  formData: FormData,
): ValidationResult<CategoryInput> {
  return resultFromSchema(
    categoryFormSchema.safeParse({
      name: stringFromFormData(formData, "name"),
      type: stringFromFormData(formData, "type"),
      icon: stringFromFormData(formData, "icon"),
    }),
  );
}

export { emptyActionState };
export type { CategoryInput };
