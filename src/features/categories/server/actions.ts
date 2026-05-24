"use server";

import {
  createServiceClient,
  getSupabaseAndUser,
  getUser,
} from "@/features/auth/server/session";
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
    await new SupabaseCategoryRepository(supabase).create({
      ...parsed.data,
      userId,
    });

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
    await new SupabaseCategoryRepository(supabase).update(id, parsed.data);

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

  const user = await getUser();
  if (!user) {
    return;
  }

  const serviceSupabase = createServiceClient();
  await new SupabaseCategoryRepository(serviceSupabase).softDelete(
    id,
    new Date().toISOString(),
  );

  revalidateFinancePaths();
}
