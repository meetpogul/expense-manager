"use server";

import { CreateAccountUseCase } from "@/features/accounts/application/use-cases/create-account.use-case";
import { SoftDeleteAccountUseCase } from "@/features/accounts/application/use-cases/soft-delete-account.use-case";
import { UpdateAccountUseCase } from "@/features/accounts/application/use-cases/update-account.use-case";
import { SupabaseAccountRepository } from "@/features/accounts/infrastructure/supabase-account.repository";
import { getSupabaseAndUser } from "@/features/auth/server/session";
import { actionError } from "@/lib/actions/state";
import { revalidateFinancePaths } from "@/shared/application/revalidation";

import { validateAccountForm } from "../domain/validation";

import type { ActionState } from "@/lib/actions/state";

export async function createAccountAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = validateAccountForm(formData);

  if (!parsed.ok) {
    return parsed.state;
  }

  try {
    const { supabase, userId } = await getSupabaseAndUser();
    await new CreateAccountUseCase(
      new SupabaseAccountRepository(supabase),
    ).execute(parsed.data, userId);

    revalidateFinancePaths();

    return { ok: true, message: "Account saved." };
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Could not save.",
    );
  }
}

export async function updateAccountAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const parsed = validateAccountForm(formData);

  if (!id) {
    return actionError("Missing account.");
  }

  if (!parsed.ok) {
    return parsed.state;
  }

  try {
    const { supabase } = await getSupabaseAndUser();
    await new UpdateAccountUseCase(
      new SupabaseAccountRepository(supabase),
    ).execute(id, parsed.data);

    revalidateFinancePaths();

    return { ok: true, message: "Account updated." };
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Could not update.",
    );
  }
}

export async function softDeleteAccountAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  const { supabase } = await getSupabaseAndUser();
  await new SoftDeleteAccountUseCase(
    new SupabaseAccountRepository(supabase),
  ).execute(id, new Date().toISOString());

  revalidateFinancePaths();
}
