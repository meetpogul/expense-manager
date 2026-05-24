import { describe, expect, it } from "vitest";

import { Money } from "@/shared/domain/value-objects";

import { Account } from "../entities/account";

function account(balance = 1000) {
  return Account.create({
    name: "Cash Wallet",
    type: "cash",
    balance,
  });
}

describe("Account entity", () => {
  describe("create", () => {
    it("initializes an account with default properties", () => {
      const account = Account.create({
        name: "Savings",
        type: "bank",
        balance: 100,
      });

      expect(account.id.value).toBe("new-account");
      expect(account.balance.amount).toBe(100);
      expect(account.toSnapshot().name).toBe("Savings");
      expect(account.toSnapshot().isActive).toBe(true);
    });

    it("initializes an account with a default balance of 0 when omitted", () => {
      const account = Account.create({
        name: "Checking",
        type: "bank",
      });
      expect(account.balance.amount).toBe(0);
    });
  });

  it("credits, debits, and applies transaction effects immutably", () => {
    const original = account();
    const credited = original.credit(Money.from(500));
    const debited = credited.debit(Money.from(200));
    const applied = debited.applyTransactionEffect(Money.from(-100));

    expect(original.id.value).toBe("new-account");
    expect(original.balance.amount).toBe(1000);
    expect(credited.balance.amount).toBe(1500);
    expect(debited.balance.amount).toBe(1300);
    expect(applied.balance.amount).toBe(1200);
  });

  it("soft deletes without losing identity or balance", () => {
    const deleted = account().softDelete("2026-05-18T00:00:00.000Z");
    const snapshot = deleted.toSnapshot();

    expect(snapshot.isActive).toBe(false);
    expect(snapshot.deletedAt).toBe("2026-05-18T00:00:00.000Z");
    expect(snapshot.balance.amount).toBe(1000);
  });

  // ── Edge cases ───────────────────────────────────────────────────────────

  it("preserves identity after soft delete", () => {
    const deleted = account().softDelete("2026-05-18T00:00:00.000Z");
    expect(deleted.id.value).toBe("new-account");
    expect(deleted.balance.amount).toBe(1000);
  });

  it("handles large balance arithmetic without integer overflow", () => {
    const large = account(999_999_999);
    const credited = large.credit(Money.from(1));
    expect(credited.balance.amount).toBe(1_000_000_000);
  });

  it("applyTransactionEffect with zero amount leaves balance unchanged", () => {
    const base = account(500);
    const result = base.applyTransactionEffect(Money.from(0));
    expect(result.balance.amount).toBe(500);
  });

  it("credit with negative amount reduces balance (mirrors debit)", () => {
    const base = account(1000);
    // credit(-200) is semantically equivalent to debit(200)
    const result = base.credit(Money.from(-200));
    expect(result.balance.amount).toBe(800);
  });

  it("debit reduces balance and produces a new immutable instance", () => {
    const original = account(2000);
    const debited = original.debit(Money.from(500));
    // original is untouched
    expect(original.balance.amount).toBe(2000);
    expect(debited.balance.amount).toBe(1500);
  });
});
