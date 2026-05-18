"use server";

import { getSupabaseAndUser } from "@/features/auth/server/session";
import { CreateBudgetUseCase } from "@/features/budgets/application/use-cases/create-budget.use-case";
import { SetBudgetActiveUseCase } from "@/features/budgets/application/use-cases/set-budget-active.use-case";
import { SoftDeleteBudgetUseCase } from "@/features/budgets/application/use-cases/soft-delete-budget.use-case";
import { UpdateBudgetUseCase } from "@/features/budgets/application/use-cases/update-budget.use-case";
import { SupabaseBudgetRepository } from "@/features/budgets/infrastructure/supabase-budget.repository";
import { actionError } from "@/lib/actions/state";
import { revalidateFinancePaths } from "@/shared/application/revalidation";

import { validateBudgetForm } from "../domain/validation";

import type { ActionState } from "@/lib/actions/state";

export async function createBudgetAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = validateBudgetForm(formData);

  if (!parsed.ok) {
    return parsed.state;
  }

  try {
    const { supabase, userId } = await getSupabaseAndUser();
    await new CreateBudgetUseCase(
      new SupabaseBudgetRepository(supabase),
    ).execute(parsed.data, userId);

    revalidateFinancePaths();

    return { ok: true, message: "Budget saved." };
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Could not save.",
    );
  }
}

export async function updateBudgetAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const parsed = validateBudgetForm(formData);

  if (!id) {
    return actionError("Missing budget.");
  }

  if (!parsed.ok) {
    return parsed.state;
  }

  try {
    const { supabase } = await getSupabaseAndUser();
    await new UpdateBudgetUseCase(
      new SupabaseBudgetRepository(supabase),
    ).execute(id, parsed.data);

    revalidateFinancePaths();

    return { ok: true, message: "Budget updated." };
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Could not update.",
    );
  }
}

export async function softDeleteBudgetAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  const { supabase } = await getSupabaseAndUser();
  await new SoftDeleteBudgetUseCase(
    new SupabaseBudgetRepository(supabase),
  ).execute(id, new Date().toISOString());

  revalidateFinancePaths();
}

export async function setBudgetActiveAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const isActive = String(formData.get("isActive") ?? "") === "true";

  if (!id) {
    return;
  }

  const { supabase } = await getSupabaseAndUser();
  await new SetBudgetActiveUseCase(
    new SupabaseBudgetRepository(supabase),
  ).execute(id, isActive);

  revalidateFinancePaths();
}
