import { z } from "zod";

import { TRANSACTION_TYPES } from "@/features/transactions/domain/constants";

import { RECURRING_FREQUENCIES } from "./constants";

export const amountFromForm = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  return Number(value.replace(/,/g, ""));
}, z.number().finite());

export const optionalTextFromForm = z.preprocess((value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}, z.string().nullable());

export const dateFromForm = z
  .string()
  .min(1, "Choose a valid date.")
  .refine(
    (value) => !Number.isNaN(new Date(`${value}T00:00:00`).getTime()),
    "Choose a valid date.",
  );

export const checkboxFromForm = z.preprocess((value) => {
  if (typeof value === "boolean") {
    return value;
  }

  return value === "on" || value === "true";
}, z.boolean());

export const recurringRuleFormSchema = z
  .object({
    type: z.enum(TRANSACTION_TYPES, "Choose income or expense."),
    amount: amountFromForm.refine((value) => value > 0, {
      message: "Enter an amount greater than 0.",
    }),
    account_id: z.string().trim().min(1, "Choose an account."),
    category_id: optionalTextFromForm,
    note: optionalTextFromForm,
    frequency: z.enum(RECURRING_FREQUENCIES, "Choose a valid frequency."),
    start_date: dateFromForm,
    end_date: optionalTextFromForm.refine(
      (value) =>
        value === null ||
        !Number.isNaN(new Date(`${value}T00:00:00`).getTime()),
      "Choose a valid end date.",
    ),
    next_due_date: dateFromForm,
    is_active: checkboxFromForm,
  })
  .superRefine((value, ctx) => {
    if (value.type === "expense" && !value.category_id) {
      ctx.addIssue({
        code: "custom",
        input: value.category_id,
        message: "Choose a category for expenses.",
        path: ["category_id"],
      });
    }

    if (
      value.end_date &&
      new Date(`${value.end_date}T00:00:00`).getTime() <
        new Date(`${value.start_date}T00:00:00`).getTime()
    ) {
      ctx.addIssue({
        code: "custom",
        input: value.end_date,
        message: "End date must be after the start date.",
        path: ["end_date"],
      });
    }

    if (
      new Date(`${value.next_due_date}T00:00:00`).getTime() <
      new Date(`${value.start_date}T00:00:00`).getTime()
    ) {
      ctx.addIssue({
        code: "custom",
        input: value.next_due_date,
        message: "Next date must be on or after the start date.",
        path: ["next_due_date"],
      });
    }
  })
  .transform((value) => ({
    type: value.type,
    amount: value.amount,
    accountId: value.account_id,
    categoryId: value.category_id,
    note: value.note,
    frequency: value.frequency,
    startDate: value.start_date,
    endDate: value.end_date,
    nextDueDate: value.next_due_date,
    isActive: value.is_active,
  }));

export type RecurringRuleFormValues = z.input<typeof recurringRuleFormSchema>;
export type RecurringRuleInput = z.output<typeof recurringRuleFormSchema>;
