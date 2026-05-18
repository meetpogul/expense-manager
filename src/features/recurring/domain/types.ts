import type { Account } from "@/features/accounts/domain/types";
import type { Category } from "@/features/categories/domain/types";
import type { TransactionType } from "@/features/transactions/domain/types";

export type RecurringFrequency =
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "yearly";

export type RecurringRule = {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  note: string | null;
  frequency: RecurringFrequency;
  start_date: string;
  end_date: string | null;
  next_due_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  accounts?: Pick<Account, "id" | "name" | "type"> | null;
  categories?: Pick<Category, "id" | "name" | "icon" | "type" | "color"> | null;
};
