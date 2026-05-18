export type AccountType =
  | "cash"
  | "bank"
  | "credit_card"
  | "upi"
  | "wallet"
  | "other";

export type Account = {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  balance: number;
  color: string | null;
  icon: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};
