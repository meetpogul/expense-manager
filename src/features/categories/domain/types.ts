import type { TransactionType } from "@/features/transactions/domain/types";

export type CategoryType = TransactionType | "both";

export type Category = {
  id: string;
  user_id: string | null;
  name: string;
  icon: string | null;
  color: string | null;
  type: CategoryType;
  is_default: boolean;
  created_at: string;
  deleted_at: string | null;
};
