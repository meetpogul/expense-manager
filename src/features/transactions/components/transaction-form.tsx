"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  createTransactionAction,
  updateTransactionAction,
} from "@/features/transactions/server/actions";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ActionStatus } from "@/components/ui/action-status";
import { todayInputValue } from "@/features/transactions/domain/format";
import {
  transactionFormSchema,
  type TransactionFormValues,
} from "@/features/transactions/domain/transaction.schema";
import { useServerActionForm } from "@/lib/actions/use-server-action-form";
import { cn } from "@/lib/utils";

import type {
  Transaction,
  TransactionType,
} from "@/features/transactions/domain/types";
import type { Account } from "@/features/accounts/domain/types";
import type { Category } from "@/features/categories/domain/types";
import { DEFAULT_EXPENSE_CATEGORY_NAME } from "@/features/categories/domain/constants";

type TransactionFormProps = {
  accounts: Account[];
  categories: Category[];
  transaction?: Transaction;
  compact?: boolean;
};

export function TransactionForm({
  accounts,
  categories,
  transaction,
  compact = false,
}: TransactionFormProps) {
  const action = transaction
    ? updateTransactionAction
    : createTransactionAction;
  const { formRef, isPending, state, submitFormData } =
    useServerActionForm(action);
  const defaultType = transaction?.type ?? "expense";
  const defaultAccount =
    transaction?.account_id ??
    accounts.find((account) => account.is_default)?.id ??
    accounts[0]?.id ??
    "";
  const {
    formState: { errors },
    control,
    getValues,
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema, undefined, { raw: true }),
    defaultValues: {
      type: defaultType,
      amount: transaction ? String(transaction.amount) : "",
      account_id: defaultAccount,
      category_id: transaction?.category_id ?? "",
      date: transaction?.date ?? todayInputValue(),
      merchant_name: transaction?.merchant_name ?? "",
      note: transaction?.note ?? "",
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
  const defaultCategory =
    transaction?.category_id ??
    visibleCategories.find(
      (category) => category.name === DEFAULT_EXPENSE_CATEGORY_NAME,
    )?.id ??
    visibleCategories[0]?.id ??
    "";

  useEffect(() => {
    if (state.ok && !transaction) {
      reset({
        type: "expense",
        amount: "",
        account_id:
          accounts.find((account) => account.is_default)?.id ??
          accounts[0]?.id ??
          "",
        category_id:
          categories.find(
            (category) => category.name === DEFAULT_EXPENSE_CATEGORY_NAME,
          )?.id ??
          categories.find(
            (category) =>
              category.type === "expense" || category.type === "both",
          )?.id ??
          "",
        date: todayInputValue(),
        merchant_name: "",
        note: "",
      });
    }
  }, [accounts, categories, reset, state.ok, transaction]);

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
      setValue("category_id", defaultCategory, { shouldValidate: true });
    }
  }, [defaultCategory, getValues, setValue, type, visibleCategories]);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(submitFormData)}
      ref={formRef}
    >
      {transaction ? (
        <input name="id" type="hidden" value={transaction.id} />
      ) : null}
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
        htmlFor="amount"
        label="Amount"
      >
        <Input
          autoFocus
          className="h-14 text-3xl font-semibold tracking-normal"
          id="amount"
          inputMode="decimal"
          placeholder="0"
          aria-invalid={!!(errors.amount ?? state.fieldErrors?.amount)}
          {...register("amount")}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          error={errors.account_id?.message ?? state.fieldErrors?.account_id}
          htmlFor="account_id"
          label="Account"
        >
          <Select
            id="account_id"
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
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          error={errors.date?.message ?? state.fieldErrors?.date}
          htmlFor="date"
          label="Date"
        >
          <Input
            id="date"
            type="date"
            aria-invalid={!!(errors.date ?? state.fieldErrors?.date)}
            {...register("date")}
          />
        </FormField>
        <FormField htmlFor="merchant_name" label="Merchant">
          <Input
            id="merchant_name"
            placeholder="Swiggy"
            {...register("merchant_name")}
          />
        </FormField>
      </div>
      <FormField htmlFor="note" label="Note">
        <Textarea
          className={compact ? "min-h-16" : undefined}
          id="note"
          placeholder="Optional"
          {...register("note")}
        />
      </FormField>
      <ActionStatus state={state} />
      <Button disabled={isPending || accounts.length === 0} className="h-11">
        <CheckIcon data-icon="inline-start" />
        {isPending
          ? "Saving..."
          : transaction
            ? "Update transaction"
            : "Save transaction"}
      </Button>
    </form>
  );
}
