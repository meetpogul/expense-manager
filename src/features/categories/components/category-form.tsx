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
  categoryFormSchema,
  type CategoryFormValues,
} from "@/features/categories/domain/category.schema";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/features/categories/server/actions";
import { useServerActionForm } from "@/lib/actions/use-server-action-form";

import type { Category } from "@/features/categories/domain/types";

type CategoryFormProps = {
  category?: Category;
};

export function CategoryForm({ category }: CategoryFormProps) {
  const action = category ? updateCategoryAction : createCategoryAction;
  const { formRef, isPending, state, submitFormData } =
    useServerActionForm(action);
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema, undefined, { raw: true }),
    defaultValues: {
      icon: category?.icon ?? "",
      name: category?.name ?? "",
      type: category?.type ?? "expense",
    },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(submitFormData)}
      ref={formRef}
    >
      {category ? <input name="id" type="hidden" value={category.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-[80px_1fr]">
        <FormField htmlFor="icon" label="Icon">
          <Input
            id="icon"
            maxLength={2}
            placeholder="Fd"
            {...register("icon")}
          />
        </FormField>
        <FormField
          error={errors.name?.message ?? state.fieldErrors?.name}
          htmlFor="name"
          label="Name"
        >
          <Input
            id="name"
            placeholder="Food & Dining"
            aria-invalid={!!(errors.name ?? state.fieldErrors?.name)}
            {...register("name")}
          />
        </FormField>
      </div>
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
          <option value="expense">Expense</option>
          <option value="income">Income</option>
          <option value="both">Both</option>
        </Select>
      </FormField>
      <ActionStatus state={state} />
      <Button disabled={isPending}>
        <CheckIcon data-icon="inline-start" />
        {isPending
          ? "Saving..."
          : category
            ? "Update category"
            : "Save category"}
      </Button>
    </form>
  );
}
