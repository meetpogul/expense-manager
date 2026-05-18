import { Money, UserId } from "@/shared/domain/value-objects";

import { AccountId } from "../value-objects/account-id";

import type { AccountType } from "../types";

export type AccountProps = {
  id: AccountId;
  userId: UserId;
  name: string;
  type: AccountType;
  balance: Money;
  color: string | null;
  icon: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export class Account {
  private constructor(private readonly props: AccountProps) {}

  static restore(props: AccountProps) {
    return new Account(props);
  }

  get id() {
    return this.props.id;
  }

  get balance() {
    return this.props.balance;
  }

  credit(amount: Money) {
    return Account.restore({
      ...this.props,
      balance: this.props.balance.add(amount),
    });
  }

  debit(amount: Money) {
    return this.credit(amount.negate());
  }

  applyTransactionEffect(effect: Money) {
    return Account.restore({
      ...this.props,
      balance: this.props.balance.add(effect),
    });
  }

  softDelete(deletedAt: string) {
    return Account.restore({
      ...this.props,
      deletedAt,
      isActive: false,
    });
  }

  toSnapshot() {
    return { ...this.props };
  }
}
