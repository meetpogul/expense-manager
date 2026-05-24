"use server";

import { SupabaseAccountRepository } from "@/features/accounts/infrastructure/supabase-account.repository";
import {
  createServiceClient,
  getSupabaseAndUser,
  getUser,
} from "@/features/auth/server/session";
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
    await new SupabaseAccountRepository(supabase).create({
      ...parsed.data,
      userId,
    });

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
    await new SupabaseAccountRepository(supabase).update(id, parsed.data);

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

  const user = await getUser();
  if (!user) {
    return;
  }

  const serviceSupabase = createServiceClient();
  await new SupabaseAccountRepository(serviceSupabase).softDelete(
    id,
    new Date().toISOString(),
  );

  revalidateFinancePaths();
}
