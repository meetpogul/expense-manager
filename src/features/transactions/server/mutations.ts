import {
  editBalanceDelta,
  reversalEffect,
  transactionEffect,
} from "../domain/balance";

import type { TransactionInput } from "../domain/validation";
import type {
  NewTransaction,
  TransactionChanges,
  TransactionRecord,
} from "../application/records";

export type {
  NewTransaction,
  TransactionChanges,
  TransactionRecord as MutationTransaction,
};

/**
 * Data-access interface for transaction mutations.
 * Implemented in actions.ts via Supabase; implemented as InMemory in tests.
 */
export type FinanceMutationRepository = {
  getAccountBalance(accountId: string): Promise<number>;
  setAccountBalance(accountId: string, balance: number): Promise<void>;
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

function toTransactionChanges(input: TransactionInput): TransactionChanges {
  return {
    account_id: input.accountId,
    category_id: input.categoryId,
    type: input.type,
    amount: input.amount,
    date: input.date,
    note: input.note,
    merchant_name: input.merchantName,
  };
}

async function applyBalanceDelta(
  repository: FinanceMutationRepository,
  accountId: string,
  delta: number,
) {
  if (delta === 0) {
    return;
  }

  const currentBalance = await repository.getAccountBalance(accountId);
  await repository.setAccountBalance(accountId, currentBalance + delta);
}

async function rollbackBalanceDelta(
  repository: FinanceMutationRepository,
  accountId: string,
  delta: number,
) {
  await applyBalanceDelta(repository, accountId, -delta);
}

export async function createTransactionMutation(
  repository: FinanceMutationRepository,
  input: TransactionInput,
  userId: string,
) {
  const changes = toTransactionChanges(input);
  const inserted = await repository.insertTransaction({
    ...changes,
    user_id: userId,
  });
  const delta = transactionEffect(input.type, input.amount);

  try {
    await applyBalanceDelta(repository, input.accountId, delta);
  } catch (error) {
    await repository.softDeleteTransaction(
      inserted.id,
      new Date().toISOString(),
    );
    throw error;
  }

  return inserted;
}

export async function updateTransactionMutation(
  repository: FinanceMutationRepository,
  transactionId: string,
  input: TransactionInput,
) {
  const previous = await repository.getTransaction(transactionId);
  const changes = toTransactionChanges(input);
  const appliedDeltas: Array<{ accountId: string; delta: number }> = [];

  await repository.updateTransaction(transactionId, changes);

  try {
    if (previous.account_id === input.accountId) {
      const delta = editBalanceDelta(
        { type: previous.type, amount: previous.amount },
        { type: input.type, amount: input.amount },
      );
      await applyBalanceDelta(repository, input.accountId, delta);
      appliedDeltas.push({ accountId: input.accountId, delta });
    } else {
      const previousDelta = reversalEffect(previous.type, previous.amount);
      const nextDelta = transactionEffect(input.type, input.amount);

      await applyBalanceDelta(repository, previous.account_id, previousDelta);
      appliedDeltas.push({
        accountId: previous.account_id,
        delta: previousDelta,
      });
      await applyBalanceDelta(repository, input.accountId, nextDelta);
      appliedDeltas.push({ accountId: input.accountId, delta: nextDelta });
    }
  } catch (error) {
    for (const applied of appliedDeltas.toReversed()) {
      await rollbackBalanceDelta(repository, applied.accountId, applied.delta);
    }
    await repository.restoreTransaction(transactionId, previous);
    throw error;
  }
}

export async function deleteTransactionMutation(
  repository: FinanceMutationRepository,
  transactionId: string,
  deletedAt: string,
) {
  const previous = await repository.getTransaction(transactionId);
  const delta = reversalEffect(previous.type, previous.amount);

  await repository.softDeleteTransaction(transactionId, deletedAt);

  try {
    await applyBalanceDelta(repository, previous.account_id, delta);
  } catch (error) {
    await repository.restoreTransaction(transactionId, previous);
    throw error;
  }
}
