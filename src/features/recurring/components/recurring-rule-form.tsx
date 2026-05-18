"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";

import { ActionStatus } from "@/components/ui/action-status";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  RECURRING_FREQUENCIES,
  RECURRING_FREQUENCY_LABELS,
} from "@/features/recurring/domain/constants";
import {
  recurringRuleFormSchema,
  type RecurringRuleFormValues,
} from "@/features/recurring/domain/recurring.schema";
import {
  createRecurringRuleAction,
  updateRecurringRuleAction,
} from "@/features/recurring/server/actions";
import { todayInputValue } from "@/features/transactions/domain/format";
import { useServerActionForm } from "@/lib/actions/use-server-action-form";
import { cn } from "@/lib/utils";

import type { Account } from "@/features/accounts/domain/types";
import type { Category } from "@/features/categories/domain/types";
import type { RecurringRule } from "@/features/recurring/domain/types";
import type { TransactionType } from "@/features/transactions/domain/types";

type RecurringRuleFormProps = {
  accounts: Account[];
  categories: Category[];
  rule?: RecurringRule;
};

export function RecurringRuleForm({
  accounts,
  categories,
  rule,
}: RecurringRuleFormProps) {
  const action = rule ? updateRecurringRuleAction : createRecurringRuleAction;
  const { formRef, isPending, state, submitFormData } =
    useServerActionForm(action);
  const defaultType = rule?.type ?? "expense";
  const defaultCategory =
    rule?.category_id ??
    categories.find(
      (category) => category.type === defaultType || category.type === "both",
    )?.id ??
    "";
  const {
    formState: { errors },
    control,
    getValues,
    handleSubmit,
    register,
    setValue,
  } = useForm<RecurringRuleFormValues>({
    resolver: zodResolver(recurringRuleFormSchema, undefined, { raw: true }),
    defaultValues: {
      account_id:
        rule?.account_id ??
        accounts.find((account) => account.is_default)?.id ??
        accounts[0]?.id ??
        "",
      amount: rule ? String(rule.amount) : "",
      category_id: defaultCategory,
      end_date: rule?.end_date ?? "",
      frequency: rule?.frequency ?? "monthly",
      is_active: rule?.is_active ?? true,
      next_due_date: rule?.next_due_date ?? todayInputValue(),
      note: rule?.note ?? "",
      start_date: rule?.start_date ?? todayInputValue(),
      type: defaultType,
    },
  });
  const type = useWatch({ control, name: "type" }) as TransactionType;
  const visibleCategories = useMemo(
    () =>
      categories.filter(
        (category) => category.type === type || category.type === "both",
      ),
    [categories, type],
  );

  useEffect(() => {
    const currentCategory = getValues("category_id");
    const categoryIsVisible = visibleCategories.some(
      (category) => category.id === currentCategory,
    );

    if (type === "income") {
      if (currentCategory && !categoryIsVisible) {
        setValue("category_id", "", { shouldValidate: true });
      }
      return;
    }

    if (!categoryIsVisible) {
      setValue("category_id", visibleCategories[0]?.id ?? "", {
        shouldValidate: true,
      });
    }
  }, [getValues, setValue, type, visibleCategories]);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(submitFormData)}
      ref={formRef}
    >
      {rule ? <input name="id" type="hidden" value={rule.id} /> : null}
      <input type="hidden" {...register("type")} />
      <div className="bg-muted flex rounded-lg border p-1">
        {(["expense", "income"] as const).map((item) => (
          <button
            className={cn(
              "h-9 flex-1 rounded-md text-sm font-medium transition-colors",
              type === item
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            key={item}
            onClick={() =>
              setValue("type", item, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            type="button"
          >
            {item === "expense" ? "Expense" : "Income"}
          </button>
        ))}
      </div>
      <FormField
        error={errors.amount?.message ?? state.fieldErrors?.amount}
        htmlFor="recurring_amount"
        label="Amount"
      >
        <Input
          id="recurring_amount"
          inputMode="decimal"
          placeholder="2500"
          aria-invalid={!!(errors.amount ?? state.fieldErrors?.amount)}
          {...register("amount")}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          error={errors.account_id?.message ?? state.fieldErrors?.account_id}
          htmlFor="recurring_account_id"
          label="Account"
        >
          <Select
            id="recurring_account_id"
            aria-invalid={
              !!(errors.account_id ?? state.fieldErrors?.account_id)
            }
            {...register("account_id")}
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField
          error={errors.category_id?.message ?? state.fieldErrors?.category_id}
          htmlFor="recurring_category_id"
          label="Category"
        >
          <Select
            id="recurring_category_id"
            aria-invalid={
              !!(errors.category_id ?? state.fieldErrors?.category_id)
            }
            {...register("category_id")}
          >
            {type === "income" ? <option value="">No category</option> : null}
            {visibleCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon ? `${category.icon} ` : ""}
                {category.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
      <FormField
        error={errors.frequency?.message ?? state.fieldErrors?.frequency}
        htmlFor="frequency"
        label="Frequency"
      >
        <Select
          id="frequency"
          aria-invalid={!!(errors.frequency ?? state.fieldErrors?.frequency)}
          {...register("frequency")}
        >
          {RECURRING_FREQUENCIES.map((frequency) => (
            <option key={frequency} value={frequency}>
              {RECURRING_FREQUENCY_LABELS[frequency]}
            </option>
          ))}
        </Select>
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          error={errors.start_date?.message ?? state.fieldErrors?.start_date}
          htmlFor="recurring_start_date"
          label="Starts"
        >
          <Input
            id="recurring_start_date"
            type="date"
            aria-invalid={
              !!(errors.start_date ?? state.fieldErrors?.start_date)
            }
            {...register("start_date")}
          />
        </FormField>
        <FormField
          error={
            errors.next_due_date?.message ?? state.fieldErrors?.next_due_date
          }
          htmlFor="next_due_date"
          label="Next date"
        >
          <Input
            id="next_due_date"
            type="date"
            aria-invalid={
              !!(errors.next_due_date ?? state.fieldErrors?.next_due_date)
            }
            {...register("next_due_date")}
          />
        </FormField>
      </div>
      <FormField
        error={errors.end_date?.message ?? state.fieldErrors?.end_date}
        htmlFor="recurring_end_date"
        label="Ends"
      >
        <Input
          id="recurring_end_date"
          type="date"
          aria-invalid={!!(errors.end_date ?? state.fieldErrors?.end_date)}
          {...register("end_date")}
        />
      </FormField>
      <FormField htmlFor="note" label="Note">
        <Input
          id="note"
          placeholder="Rent, salary, SIP..."
          {...register("note")}
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
      <Button disabled={isPending || accounts.length === 0}>
        <CheckIcon data-icon="inline-start" />
        {isPending ? "Saving..." : rule ? "Update recurring" : "Save recurring"}
      </Button>
    </form>
  );
}
