import type { Category } from "@/features/categories/domain/types";
import type { Transaction } from "@/features/transactions/domain/types";

export type BudgetPeriod = "weekly" | "monthly" | "yearly";
export type BudgetStatus = "safe" | "warning" | "alert";

export type Budget = {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  period: BudgetPeriod;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  categories?: Pick<Category, "id" | "name" | "icon" | "type" | "color"> | null;
};

export type BudgetPeriodWindow = {
  from: string;
  to: string;
};

export type BudgetUsage = {
  spent: number;
  remaining: number;
  percentUsed: number;
  status: BudgetStatus;
  window: BudgetPeriodWindow;
};

export type BudgetWithUsage = Budget & {
  usage: BudgetUsage;
};

export type BudgetDetail = BudgetWithUsage & {
  transactions: Transaction[];
};
