import { Money } from "@/shared/domain/value-objects";
import { numberFromNumeric } from "@/platform/supabase/normalize";
import { rowFromNewTransaction } from "@/shared/infrastructure/transaction-row.mapper";

import type { createClient } from "@/platform/supabase/server";
import type {
  RecurringExecutionRepository,
  RecurringExecutionRule,
  RecurringRuleRepository,
} from "../application/ports";
import type { AccountId } from "@/features/accounts/domain/value-objects/account-id";
import type { RecurringRuleInput } from "../domain/recurring.schema";
import type { NewTransaction } from "@/shared/application/records";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export class SupabaseRecurringRuleRepository
  implements RecurringRuleRepository, RecurringExecutionRepository
{
  constructor(private readonly supabase: SupabaseClient) {}

  async create(input: RecurringRuleInput & { userId: string }) {
    const { error } = await this.supabase.from("recurring_rules").insert({
      account_id: input.accountId,
      amount: input.amount,
      category_id: input.categoryId,
      end_date: input.endDate,
      frequency: input.frequency,
      is_active: input.isActive,
      next_due_date: input.nextDueDate,
      note: input.note,
      start_date: input.startDate,
      type: input.type,
      user_id: input.userId,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async update(ruleId: string, input: RecurringRuleInput) {
    const { error } = await this.supabase
      .from("recurring_rules")
      .update({
        account_id: input.accountId,
        amount: input.amount,
        category_id: input.categoryId,
        end_date: input.endDate,
        frequency: input.frequency,
        is_active: input.isActive,
        next_due_date: input.nextDueDate,
        note: input.note,
        start_date: input.startDate,
        type: input.type,
      })
      .eq("id", ruleId);

    if (error) {
      throw new Error(error.message);
    }
  }

  async deactivate(ruleId: string) {
    const { error } = await this.supabase
      .from("recurring_rules")
      .update({ is_active: false })
      .eq("id", ruleId);

    if (error) {
      throw new Error(error.message);
    }
  }

  async getExecutionRule(ruleId: string): Promise<RecurringExecutionRule> {
    const { data, error } = await this.supabase
      .from("recurring_rules")
      .select(
        "id,user_id,account_id,category_id,type,amount,note,frequency,next_due_date,end_date,is_active",
      )
      .eq("id", ruleId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      account_id: String(data.account_id),
      amount: Number(data.amount ?? 0),
      category_id: data.category_id ? String(data.category_id) : null,
      end_date: data.end_date ? String(data.end_date) : null,
      frequency: data.frequency as RecurringExecutionRule["frequency"],
      id: String(data.id),
      is_active: Boolean(data.is_active),
      next_due_date: String(data.next_due_date),
      note: data.note ? String(data.note) : null,
      type: data.type === "income" ? "income" : "expense",
      user_id: String(data.user_id),
    };
  }

  async hasTransactionForRuleDate(ruleId: string, date: string) {
    const { data, error } = await this.supabase
      .from("transactions")
      .select("id")
      .eq("recurring_id", ruleId)
      .eq("date", date)
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return Boolean(data);
  }

  async insertTransaction(transaction: NewTransaction) {
    const { data, error } = await this.supabase
      .from("transactions")
      .insert(rowFromNewTransaction(transaction))
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return { id: String(data.id) };
  }

  async softDeleteTransaction(transactionId: string, deletedAt: string) {
    const { error } = await this.supabase
      .from("transactions")
      .update({ deleted_at: deletedAt })
      .eq("id", transactionId);

    if (error) {
      throw new Error(error.message);
    }
  }

  async getAccountBalance(accountId: AccountId) {
    const { data, error } = await this.supabase
      .from("accounts")
      .select("balance")
      .eq("id", accountId.value)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return Money.from(numberFromNumeric(data.balance));
  }

  async setAccountBalance(accountId: AccountId, balance: Money) {
    const { error } = await this.supabase
      .from("accounts")
      .update({ balance: balance.amount })
      .eq("id", accountId.value);

    if (error) {
      throw new Error(error.message);
    }
  }

  async updateExecutionState(
    ruleId: string,
    state: { isActive: boolean; nextDueDate: string },
  ) {
    const { error } = await this.supabase
      .from("recurring_rules")
      .update({
        is_active: state.isActive,
        next_due_date: state.nextDueDate,
      })
      .eq("id", ruleId);

    if (error) {
      throw new Error(error.message);
    }
  }
}
