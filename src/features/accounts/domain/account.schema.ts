import { z } from "zod";

import { ACCOUNT_TYPES } from "./constants";

/**
 * Preprocessor: coerces a comma-formatted string to a finite number.
 * Shared with transaction schema — kept here for local independence.
 */
const amountFromForm = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  return Number(value.replace(/,/g, ""));
}, z.number().finite());

export const accountFormSchema = z
  .object({
    name: z.string().trim().min(1, "Account name is required."),
    type: z.enum(ACCOUNT_TYPES, "Choose a valid account type."),
    balance: amountFromForm.refine((value) => Number.isFinite(value), {
      message: "Enter a valid balance.",
    }),
  })
  .transform((value) => ({
    name: value.name,
    type: value.type,
    balance: value.balance,
  }));

export type AccountFormValues = z.input<typeof accountFormSchema>;
export type AccountInput = z.output<typeof accountFormSchema>;
