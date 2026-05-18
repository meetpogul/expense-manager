import { describe, expect, it } from "vitest";

import { Money, UserId } from "@/shared/domain/value-objects";

import { Account } from "../entities/account";
import { AccountId } from "../value-objects/account-id";

function account(balance = 1000) {
  return Account.restore({
    balance: Money.from(balance),
    color: null,
    createdAt: "2026-05-01T00:00:00.000Z",
    deletedAt: null,
    icon: null,
    id: AccountId.from("account-1"),
    isActive: true,
    isDefault: true,
    name: "Cash Wallet",
    type: "cash",
    updatedAt: "2026-05-01T00:00:00.000Z",
    userId: UserId.from("user-1"),
  });
}

describe("Account entity", () => {
  it("credits, debits, and applies transaction effects immutably", () => {
    const original = account();
    const credited = original.credit(Money.from(500));
    const debited = credited.debit(Money.from(200));
    const applied = debited.applyTransactionEffect(Money.from(-100));

    expect(original.id.value).toBe("account-1");
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
});
