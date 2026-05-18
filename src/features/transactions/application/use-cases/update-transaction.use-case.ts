import {
  changesFromTransaction,
  transactionDraftFromInput,
  transactionFromRecord,
} from "../mappers";

import type { AccountId } from "@/features/accounts/domain/value-objects/account-id";
import type { Money } from "@/shared/domain/value-objects";
import type { TransactionUnitOfWork } from "../ports";
import type { TransactionInput } from "@/features/transactions/domain/validation";

export class UpdateTransactionUseCase {
  constructor(private readonly repository: TransactionUnitOfWork) {}

  async execute(transactionId: string, input: TransactionInput) {
    const previousRow = await this.repository.getTransaction(transactionId);
    const previous = transactionFromRecord(previousRow);
    const next = previous.changeTo(
      transactionDraftFromInput(input, "current-user"),
    );
    const applied: Array<{ accountId: AccountId; delta: Money }> = [];

    await this.repository.updateTransaction(
      transactionId,
      changesFromTransaction(next),
    );

    try {
      if (previous.accountId.equals(next.accountId)) {
        const delta = next.balanceEffect().subtract(previous.balanceEffect());
        await this.applyDelta(next.accountId, delta);
        applied.push({ accountId: next.accountId, delta });
      } else {
        const oldDelta = previous.reverseBalanceEffect();
        const newDelta = next.balanceEffect();
        await this.applyDelta(previous.accountId, oldDelta);
        applied.push({ accountId: previous.accountId, delta: oldDelta });
        await this.applyDelta(next.accountId, newDelta);
        applied.push({ accountId: next.accountId, delta: newDelta });
      }
    } catch (error) {
      // Undo already-applied balance deltas before restoring the transaction row.
      for (const item of applied.toReversed()) {
        await this.applyDelta(item.accountId, item.delta.negate());
      }
      await this.repository.restoreTransaction(transactionId, previousRow);
      throw error;
    }
  }

  private async applyDelta(accountId: AccountId, delta: Money) {
    if (delta.amount === 0) {
      return;
    }

    const current = await this.repository.getAccountBalance(accountId);
    await this.repository.setAccountBalance(accountId, current.add(delta));
  }
}
