export type TransactionType = "expense" | "income";

// DashboardSummary has moved to features/dashboard/domain/types.ts.
// Re-exported here for backward compatibility.
export type { DashboardSummary } from "@/features/dashboard/domain/types";

export type Transaction = {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  note: string | null;
  merchant_name: string | null;
  date: string;
  time: string | null;
  payment_method: string | null;
  is_recurring?: boolean;
  recurring_id?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  accounts?: Pick<
    { id: string; name: string; type: string },
    "id" | "name" | "type"
  > | null;
  categories?: Pick<
    {
      id: string;
      name: string;
      icon: string | null;
      type: string;
      color: string | null;
    },
    "id" | "name" | "icon" | "type" | "color"
  > | null;
};
