"use server";

import { getSupabaseAndUser } from "@/features/auth/server/session";
import { CreateCategoryUseCase } from "@/features/categories/application/use-cases/create-category.use-case";
import { SoftDeleteCategoryUseCase } from "@/features/categories/application/use-cases/soft-delete-category.use-case";
import { UpdateCategoryUseCase } from "@/features/categories/application/use-cases/update-category.use-case";
import { SupabaseCategoryRepository } from "@/features/categories/infrastructure/supabase-category.repository";
import { actionError } from "@/lib/actions/state";
import { revalidateFinancePaths } from "@/shared/application/revalidation";

import { validateCategoryForm } from "../domain/validation";

import type { ActionState } from "@/lib/actions/state";

export async function createCategoryAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = validateCategoryForm(formData);

  if (!parsed.ok) {
    return parsed.state;
  }

  try {
    const { supabase, userId } = await getSupabaseAndUser();
    await new CreateCategoryUseCase(
      new SupabaseCategoryRepository(supabase),
    ).execute(parsed.data, userId);

    revalidateFinancePaths();

    return { ok: true, message: "Category saved." };
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Could not save.",
    );
  }
}

export async function updateCategoryAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const parsed = validateCategoryForm(formData);

  if (!id) {
    return actionError("Missing category.");
  }

  if (!parsed.ok) {
    return parsed.state;
  }

  try {
    const { supabase } = await getSupabaseAndUser();
    await new UpdateCategoryUseCase(
      new SupabaseCategoryRepository(supabase),
    ).execute(id, parsed.data);

    revalidateFinancePaths();

    return { ok: true, message: "Category updated." };
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Could not update.",
    );
  }
}

export async function softDeleteCategoryAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  const { supabase } = await getSupabaseAndUser();
  await new SoftDeleteCategoryUseCase(
    new SupabaseCategoryRepository(supabase),
  ).execute(id, new Date().toISOString());

  revalidateFinancePaths();
}
