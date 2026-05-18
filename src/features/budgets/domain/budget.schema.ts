import { z } from "zod";

import { BUDGET_PERIODS } from "./constants";

export const amountFromForm = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  return Number(value.replace(/,/g, ""));
}, z.number().finite());

export const optionalIdFromForm = z.preprocess((value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}, z.string().nullable());

export const optionalDateFromForm = z.preprocess((value) => {
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

export const budgetFormSchema = z
  .object({
    category_id: optionalIdFromForm,
    amount: amountFromForm.refine((value) => value > 0, {
      message: "Enter an amount greater than 0.",
    }),
    period: z.enum(BUDGET_PERIODS, "Choose a valid period."),
    start_date: dateFromForm,
    end_date: optionalDateFromForm.refine(
      (value) =>
        value === null ||
        !Number.isNaN(new Date(`${value}T00:00:00`).getTime()),
      "Choose a valid end date.",
    ),
    is_active: checkboxFromForm,
  })
  .superRefine((value, ctx) => {
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
  })
  .transform((value) => ({
    categoryId: value.category_id,
    amount: value.amount,
    period: value.period,
    startDate: value.start_date,
    endDate: value.end_date,
    isActive: value.is_active,
  }));

export type BudgetFormValues = z.input<typeof budgetFormSchema>;
export type BudgetInput = z.output<typeof budgetFormSchema>;
