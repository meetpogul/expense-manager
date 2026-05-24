"use server";

import {
  createServiceClient,
  getSupabaseAndUser,
  getUser,
} from "@/features/auth/server/session";
import { CreateTransactionUseCase } from "@/features/transactions/application/use-cases/create-transaction.use-case";
import { DeleteTransactionUseCase } from "@/features/transactions/application/use-cases/delete-transaction.use-case";
import { UpdateTransactionUseCase } from "@/features/transactions/application/use-cases/update-transaction.use-case";
import { SupabaseTransactionRepository } from "@/features/transactions/infrastructure/supabase-transaction.repository";
import { actionError } from "@/lib/actions/state";
import { revalidateFinancePaths } from "@/shared/application/revalidation";

import { validateTransactionForm } from "../domain/validation";

import type { ActionState } from "@/lib/actions/state";

export async function createTransactionAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = validateTransactionForm(formData);

  if (!parsed.ok) {
    return parsed.state;
  }

  try {
    const { supabase, userId } = await getSupabaseAndUser();
    const repository = new SupabaseTransactionRepository(supabase);
    await new CreateTransactionUseCase(repository).execute(parsed.data, userId);
    revalidateFinancePaths();

    return { ok: true, message: "Transaction saved." };
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Could not save.",
    );
  }
}

export async function updateTransactionAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const parsed = validateTransactionForm(formData);

  if (!id) {
    return actionError("Missing transaction.");
  }

  if (!parsed.ok) {
    return parsed.state;
  }

  try {
    const { supabase } = await getSupabaseAndUser();
    const repository = new SupabaseTransactionRepository(supabase);
    await new UpdateTransactionUseCase(repository).execute(id, parsed.data);
    revalidateFinancePaths();

    return { ok: true, message: "Transaction updated." };
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Could not update.",
    );
  }
}

export async function deleteTransactionAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  const user = await getUser();
  if (!user) {
    return;
  }

  const serviceSupabase = createServiceClient();
  const repository = new SupabaseTransactionRepository(serviceSupabase);
  await new DeleteTransactionUseCase(repository).execute(
    id,
    new Date().toISOString(),
  );

  revalidateFinancePaths();
}
