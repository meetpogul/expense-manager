import { transactionFromRecord } from "../mappers";

import type { TransactionUnitOfWork } from "../ports";

export class DeleteTransactionUseCase {
  constructor(private readonly repository: TransactionUnitOfWork) {}

  async execute(transactionId: string, deletedAt: string) {
    const previousRow = await this.repository.getTransaction(transactionId);
    const previous = transactionFromRecord(previousRow);

    await this.repository.softDeleteTransaction(transactionId, deletedAt);

    try {
      const balance = await this.repository.getAccountBalance(
        previous.accountId,
      );
      await this.repository.setAccountBalance(
        previous.accountId,
        balance.add(previous.reverseBalanceEffect()),
      );
    } catch (error) {
      // Balance reversal is paired with soft delete; restore if the pair fails.
      await this.repository.restoreTransaction(transactionId, previousRow);
      throw error;
    }
  }
}
