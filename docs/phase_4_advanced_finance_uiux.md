# Phase 4 — Advanced Finance

## 🎯 Goal

Track liabilities and recurring commitments in a simple and understandable way.

The UI should simplify financial complexity.

---

# 🎨 UI/UX Direction

AI should maintain:

- minimal structured layouts
- clear information hierarchy
- readable financial summaries

Complex data should feel approachable.

---

# 🎨 Theme & White Label Requirements

Continue using centralized white-label theming architecture.

Design consistency should remain:

- minimal
- modern
- premium
- easy to navigate

---

# 📱 Required Screens

## Screen 18: Loans

Minimum requirements:

- loans list
- outstanding amount
- EMI amount
- next EMI date
- add loan action

---

## Screen 19: Loan Detail

Minimum requirements:

- principal amount
- outstanding amount
- payment progress
- EMI information
- payment history

---

## Screen 20: Loan Payment

Minimum requirements:

- payment type
- amount
- date
- save action

---

## Screen 21: Debts

Minimum requirements:

- debt list
- amount visibility
- debt type visibility
- settlement status
- add/edit actions

---

## Screen 22: Subscriptions

Minimum requirements:

- subscription list
- renewal visibility
- billing cycle visibility
- add/edit actions

---

# ⚙️ Functional Requirements

## Loans

- outstanding amount should update correctly after payments

---

## Debts

- support tracking both owed and receivable amounts

---

## Subscriptions

- renewal tracking required

---

# ✅ Validation Rules

## Loans

- principal amount > 0
- EMI amount > 0
- valid loan type required

---

## Debts

- amount > 0
- valid debt type required

---

## Subscriptions

- amount > 0
- valid billing cycle required

---

# ⚡ UX Expectations

- liabilities should feel understandable quickly
- important numbers should stand out clearly

---

# 🚫 Avoid

- overly technical financial UI
- dense layouts
- complicated visualizations
