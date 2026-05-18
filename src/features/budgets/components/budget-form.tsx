"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { ActionStatus } from "@/components/ui/action-status";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  budgetFormSchema,
  type BudgetFormValues,
} from "@/features/budgets/domain/budget.schema";
import {
  BUDGET_PERIOD_LABELS,
  BUDGET_PERIODS,
} from "@/features/budgets/domain/constants";
import {
  createBudgetAction,
  updateBudgetAction,
} from "@/features/budgets/server/actions";
import { useServerActionForm } from "@/lib/actions/use-server-action-form";

import type { Budget } from "@/features/budgets/domain/types";
import type { Category } from "@/features/categories/domain/types";

type BudgetFormProps = {
  budget?: Budget;
  categories: Category[];
};

export function BudgetForm({ budget, categories }: BudgetFormProps) {
  const action = budget ? updateBudgetAction : createBudgetAction;
  const { formRef, isPending, state, submitFormData } =
    useServerActionForm(action);
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema, undefined, { raw: true }),
    defaultValues: {
      amount: budget ? String(budget.amount) : "",
      category_id: budget?.category_id ?? "",
      end_date: budget?.end_date ?? "",
      is_active: budget?.is_active ?? true,
      period: budget?.period ?? "monthly",
      start_date: budget?.start_date ?? new Date().toISOString().slice(0, 10),
    },
  });
  const expenseCategories = categories.filter(
    (category) => category.type === "expense" || category.type === "both",
  );

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(submitFormData)}
      ref={formRef}
    >
      {budget ? <input name="id" type="hidden" value={budget.id} /> : null}
      <FormField
        error={errors.amount?.message ?? state.fieldErrors?.amount}
        htmlFor="amount"
        label="Limit"
      >
        <Input
          id="amount"
          inputMode="decimal"
          placeholder="10000"
          aria-invalid={!!(errors.amount ?? state.fieldErrors?.amount)}
          {...register("amount")}
        />
      </FormField>
      <FormField
        error={errors.category_id?.message ?? state.fieldErrors?.category_id}
        htmlFor="category_id"
        label="Category"
      >
        <Select
          id="category_id"
          aria-invalid={
            !!(errors.category_id ?? state.fieldErrors?.category_id)
          }
          {...register("category_id")}
        >
          <option value="">Overall spending</option>
          {expenseCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon ? `${category.icon} ` : ""}
              {category.name}
            </option>
          ))}
        </Select>
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          error={errors.period?.message ?? state.fieldErrors?.period}
          htmlFor="period"
          label="Period"
        >
          <Select
            id="period"
            aria-invalid={!!(errors.period ?? state.fieldErrors?.period)}
            {...register("period")}
          >
            {BUDGET_PERIODS.map((period) => (
              <option key={period} value={period}>
                {BUDGET_PERIOD_LABELS[period]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField
          error={errors.start_date?.message ?? state.fieldErrors?.start_date}
          htmlFor="start_date"
          label="Starts"
        >
          <Input
            id="start_date"
            type="date"
            aria-invalid={
              !!(errors.start_date ?? state.fieldErrors?.start_date)
            }
            {...register("start_date")}
          />
        </FormField>
      </div>
      <FormField
        error={errors.end_date?.message ?? state.fieldErrors?.end_date}
        htmlFor="end_date"
        label="Ends"
      >
        <Input
          id="end_date"
          type="date"
          aria-invalid={!!(errors.end_date ?? state.fieldErrors?.end_date)}
          {...register("end_date")}
        />
      </FormField>
      <label className="flex items-center gap-2 text-sm">
        <input
          className="border-input size-4 rounded"
          type="checkbox"
          {...register("is_active")}
        />
        Active
      </label>
      <ActionStatus state={state} />
      <Button disabled={isPending}>
        <CheckIcon data-icon="inline-start" />
        {isPending ? "Saving..." : budget ? "Update budget" : "Save budget"}
      </Button>
    </form>
  );
}
