import { emptyActionState } from "@/lib/actions/state";
import { stringFromFormData } from "@/shared/application/form-data";
import { fieldErrorsFromZod } from "@/shared/application/zod-errors";

import { categoryFormSchema, type CategoryInput } from "./category.schema";

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
