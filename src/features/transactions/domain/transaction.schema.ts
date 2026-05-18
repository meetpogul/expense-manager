import { z } from "zod";

import { TRANSACTION_TYPES } from "./constants";

/**
 * Coerces a comma-formatted string (e.g. "1,200") to a finite number.
 */
export const amountFromForm = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  return Number(value.replace(/,/g, ""));
}, z.number().finite());

/**
 * Coerces an empty/whitespace string to null for optional fields.
 */
export const optionalTextFromForm = z.preprocess((value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}, z.string().nullable());

/**
 * Validates a YYYY-MM-DD date string.
 */
export const dateFromForm = z
  .string()
  .min(1, "Choose a valid date.")
  .refine(
    (value) => !Number.isNaN(new Date(`${value}T00:00:00`).getTime()),
    "Choose a valid date.",
  );

export const transactionFormSchema = z
  .object({
    type: z.enum(TRANSACTION_TYPES, "Choose income or expense."),
    amount: amountFromForm.refine((value) => value > 0, {
      message: "Enter an amount greater than 0.",
    }),
    account_id: z.string().trim().min(1, "Choose an account."),
    category_id: optionalTextFromForm,
    date: dateFromForm,
    note: optionalTextFromForm,
    merchant_name: optionalTextFromForm,
  })
  .superRefine((value, ctx) => {
    if (value.type === "expense" && !value.category_id) {
      ctx.addIssue({
        code: "custom",
        message: "Choose a category for expenses.",
        path: ["category_id"],
        input: value.category_id,
      });
    }
  })
  .transform((value) => ({
    type: value.type,
    amount: value.amount,
    accountId: value.account_id,
    categoryId: value.category_id,
    date: value.date,
    note: value.note,
    merchantName: value.merchant_name,
  }));

export type TransactionFormValues = z.input<typeof transactionFormSchema>;
export type TransactionInput = z.output<typeof transactionFormSchema>;
