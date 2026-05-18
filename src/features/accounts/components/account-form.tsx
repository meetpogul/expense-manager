"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ActionStatus } from "@/components/ui/action-status";
import {
  createAccountAction,
  updateAccountAction,
} from "@/features/accounts/server/actions";
import {
  accountFormSchema,
  type AccountFormValues,
} from "@/features/accounts/domain/account.schema";
import { DEFAULT_ACCOUNT_TYPE } from "@/features/accounts/domain/constants";
import { useServerActionForm } from "@/lib/actions/use-server-action-form";

import type { Account } from "@/features/accounts/domain/types";

type AccountFormProps = {
  account?: Account;
};

export function AccountForm({ account }: AccountFormProps) {
  const action = account ? updateAccountAction : createAccountAction;
  const { formRef, isPending, state, submitFormData } =
    useServerActionForm(action);
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema, undefined, { raw: true }),
    defaultValues: {
      name: account?.name ?? "",
      type: account?.type ?? DEFAULT_ACCOUNT_TYPE,
      balance: String(account?.balance ?? 0),
    },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(submitFormData)}
      ref={formRef}
    >
      {account ? <input name="id" type="hidden" value={account.id} /> : null}
      <FormField
        error={errors.name?.message ?? state.fieldErrors?.name}
        htmlFor="name"
        label="Name"
      >
        <Input
          id="name"
          placeholder="SBI Savings"
          aria-invalid={!!(errors.name ?? state.fieldErrors?.name)}
          {...register("name")}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          error={errors.type?.message ?? state.fieldErrors?.type}
          htmlFor="type"
          label="Type"
        >
          <Select
            id="type"
            aria-invalid={!!(errors.type ?? state.fieldErrors?.type)}
            {...register("type")}
          >
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
            <option value="credit_card">Credit card</option>
            <option value="upi">UPI</option>
            <option value="wallet">Wallet</option>
            <option value="other">Other</option>
          </Select>
        </FormField>
        <FormField
          error={errors.balance?.message ?? state.fieldErrors?.balance}
          htmlFor="balance"
          label="Balance"
        >
          <Input
            id="balance"
            inputMode="decimal"
            placeholder="0"
            aria-invalid={!!(errors.balance ?? state.fieldErrors?.balance)}
            {...register("balance")}
          />
        </FormField>
      </div>
      <ActionStatus state={state} />
      <Button disabled={isPending}>
        <CheckIcon data-icon="inline-start" />
        {isPending ? "Saving..." : account ? "Update account" : "Save account"}
      </Button>
    </form>
  );
}
