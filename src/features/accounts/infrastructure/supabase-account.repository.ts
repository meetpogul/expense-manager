import type { createClient } from "@/platform/supabase/server";
import type { AccountRepository } from "../application/ports";
import type { AccountInput } from "../domain/account.schema";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export class SupabaseAccountRepository implements AccountRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(input: AccountInput & { userId: string }) {
    const { error } = await this.supabase.from("accounts").insert({
      balance: input.balance,
      name: input.name,
      type: input.type,
      user_id: input.userId,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async update(accountId: string, input: AccountInput) {
    const { error } = await this.supabase
      .from("accounts")
      .update({
        balance: input.balance,
        name: input.name,
        type: input.type,
      })
      .eq("id", accountId);

    if (error) {
      throw new Error(error.message);
    }
  }

  async softDelete(accountId: string, deletedAt: string) {
    const { error } = await this.supabase
      .from("accounts")
      .update({
        deleted_at: deletedAt,
        is_active: false,
      })
      .eq("id", accountId);

    if (error) {
      throw new Error(error.message);
    }
  }
}
