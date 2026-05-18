import type { AccountId } from "@/features/accounts/domain/value-objects/account-id";
import type { Money } from "@/shared/domain/value-objects";
import type {
  NewTransaction,
  TransactionChanges,
  TransactionRecord,
} from "./records";

export type TransactionRepository = {
  insertTransaction(transaction: NewTransaction): Promise<{ id: string }>;
  getTransaction(transactionId: string): Promise<TransactionRecord>;
  updateTransaction(
    transactionId: string,
    changes: TransactionChanges,
  ): Promise<void>;
  softDeleteTransaction(
    transactionId: string,
    deletedAt: string,
  ): Promise<void>;
  restoreTransaction(
    transactionId: string,
    transaction: TransactionRecord,
  ): Promise<void>;
};

export type AccountBalanceRepository = {
  getAccountBalance(accountId: AccountId): Promise<Money>;
  setAccountBalance(accountId: AccountId, balance: Money): Promise<void>;
};

export type TransactionUnitOfWork = TransactionRepository &
  AccountBalanceRepository;
