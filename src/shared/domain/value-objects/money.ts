import { CURRENCY_CODE, MONEY_LOCALE } from "@/shared/constants/locale";

import { DomainError } from "../domain-error";

export class Money {
  private constructor(private readonly amountValue: number) {}

  static zero() {
    return new Money(0);
  }

  static from(value: number | string) {
    const amount =
      typeof value === "string" ? Number(value.replace(/,/g, "")) : value;

    if (!Number.isFinite(amount)) {
      throw new DomainError("Money amount must be finite.", "money.invalid");
    }

    return new Money(amount);
  }

  static positive(value: number | string) {
    const money = Money.from(value);

    if (money.amount <= 0) {
      throw new DomainError(
        "Money amount must be greater than 0.",
        "money.not_positive",
      );
    }

    return money;
  }

  get amount() {
    return this.amountValue;
  }

  add(other: Money) {
    return new Money(this.amountValue + other.amount);
  }

  subtract(other: Money) {
    return new Money(this.amountValue - other.amount);
  }

  negate() {
    return new Money(-this.amountValue);
  }

  equals(other: Money) {
    return this.amountValue === other.amount;
  }

  format(maximumFractionDigits = 0) {
    return new Intl.NumberFormat(MONEY_LOCALE, {
      currency: CURRENCY_CODE,
      maximumFractionDigits,
      style: "currency",
    }).format(this.amountValue);
  }
}
