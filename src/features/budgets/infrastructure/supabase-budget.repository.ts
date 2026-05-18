import type { createClient } from "@/platform/supabase/server";
import type { BudgetRepository } from "../application/ports";
import type { BudgetInput } from "../domain/budget.schema";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export class SupabaseBudgetRepository implements BudgetRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(input: BudgetInput & { userId: string }) {
    const { error } = await this.supabase.from("budgets").insert({
      amount: input.amount,
      category_id: input.categoryId,
      end_date: input.endDate,
      is_active: input.isActive,
      period: input.period,
      start_date: input.startDate,
      user_id: input.userId,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async update(budgetId: string, input: BudgetInput) {
    const { error } = await this.supabase
      .from("budgets")
      .update({
        amount: input.amount,
        category_id: input.categoryId,
        end_date: input.endDate,
        is_active: input.isActive,
        period: input.period,
        start_date: input.startDate,
      })
      .eq("id", budgetId);

    if (error) {
      throw new Error(error.message);
    }
  }

  async setActive(budgetId: string, isActive: boolean) {
    const { error } = await this.supabase
      .from("budgets")
      .update({ is_active: isActive })
      .eq("id", budgetId);

    if (error) {
      throw new Error(error.message);
    }
  }

  async softDelete(budgetId: string, deletedAt: string) {
    const { error } = await this.supabase
      .from("budgets")
      .update({ deleted_at: deletedAt })
      .eq("id", budgetId);

    if (error) {
      throw new Error(error.message);
    }
  }
}
