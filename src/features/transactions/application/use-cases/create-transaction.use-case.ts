import { newTransactionFromDomain, transactionFromInput } from "../mappers";

import type { TransactionUnitOfWork } from "../ports";
import type { TransactionInput } from "@/features/transactions/domain/validation";

export class CreateTransactionUseCase {
  constructor(private readonly repository: TransactionUnitOfWork) {}

  async execute(input: TransactionInput, userId: string) {
    const transaction = transactionFromInput(input, userId);
    const inserted = await this.repository.insertTransaction(
      newTransactionFromDomain(transaction),
    );
    const balance = await this.repository.getAccountBalance(
      transaction.accountId,
    );
    const nextBalance = balance.add(transaction.balanceEffect());

    try {
      await this.repository.setAccountBalance(
        transaction.accountId,
        nextBalance,
      );
    } catch (error) {
      // Keep persistence consistent if the balance write fails after insert.
      await this.repository.softDeleteTransaction(
        inserted.id,
        new Date().toISOString(),
      );
      throw error;
    }

    return inserted;
  }
}
