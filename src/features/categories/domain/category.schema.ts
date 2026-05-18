import { z } from "zod";

import { CATEGORY_TYPES } from "./constants";

/**
 * Preprocessor: coerces an empty/whitespace string to null for optional fields.
 */
const optionalTextFromForm = z.preprocess((value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}, z.string().nullable());

export const categoryFormSchema = z
  .object({
    name: z.string().trim().min(1, "Category name is required."),
    type: z.enum(CATEGORY_TYPES, "Choose a valid category type."),
    icon: optionalTextFromForm,
  })
  .transform((value) => ({
    name: value.name,
    type: value.type,
    icon: value.icon,
  }));

export type CategoryFormValues = z.input<typeof categoryFormSchema>;
export type CategoryInput = z.output<typeof categoryFormSchema>;
