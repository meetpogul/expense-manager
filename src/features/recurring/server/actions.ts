"use server";

import { getSupabaseAndUser } from "@/features/auth/server/session";
import { ExecuteRecurringRuleUseCase } from "@/features/recurring/application/use-cases/execute-recurring-rule.use-case";
import { SupabaseRecurringRuleRepository } from "@/features/recurring/infrastructure/supabase-recurring-rule.repository";
import { actionError } from "@/lib/actions/state";
import { revalidateFinancePaths } from "@/shared/application/revalidation";

import { validateRecurringRuleForm } from "../domain/validation";

import type { ActionState } from "@/lib/actions/state";

export async function createRecurringRuleAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = validateRecurringRuleForm(formData);

  if (!parsed.ok) {
    return parsed.state;
  }

  try {
    const { supabase, userId } = await getSupabaseAndUser();
    await new SupabaseRecurringRuleRepository(supabase).create({
      ...parsed.data,
      userId,
    });

    revalidateFinancePaths();

    return { ok: true, message: "Recurring rule saved." };
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Could not save.",
    );
  }
}

export async function updateRecurringRuleAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const parsed = validateRecurringRuleForm(formData);

  if (!id) {
    return actionError("Missing recurring rule.");
  }

  if (!parsed.ok) {
    return parsed.state;
  }

  try {
    const { supabase } = await getSupabaseAndUser();
    await new SupabaseRecurringRuleRepository(supabase).update(id, parsed.data);

    revalidateFinancePaths();

    return { ok: true, message: "Recurring rule updated." };
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Could not update.",
    );
  }
}

export async function deactivateRecurringRuleAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  const { supabase } = await getSupabaseAndUser();
  await new SupabaseRecurringRuleRepository(supabase).deactivate(id);

  revalidateFinancePaths();
}

export async function executeRecurringRuleAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  const { supabase } = await getSupabaseAndUser();
  await new ExecuteRecurringRuleUseCase(
    new SupabaseRecurringRuleRepository(supabase),
  ).execute(id);

  revalidateFinancePaths();
}
