import type { TransactionType } from "./types";

export function transactionEffect(type: TransactionType, amount: number) {
  return type === "income" ? amount : -amount;
}

export function reversalEffect(type: TransactionType, amount: number) {
  return -transactionEffect(type, amount);
}

export function nextBalance(
  currentBalance: number,
  type: TransactionType,
  amount: number,
) {
  return currentBalance + transactionEffect(type, amount);
}

export function editBalanceDelta(
  previous: { type: TransactionType; amount: number },
  next: { type: TransactionType; amount: number },
) {
  return (
    reversalEffect(previous.type, previous.amount) +
    transactionEffect(next.type, next.amount)
  );
}
