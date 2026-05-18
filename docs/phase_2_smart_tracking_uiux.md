# Phase 2 — Smart Tracking

## 🎯 Goal

Help users control spending and understand budget usage clearly.

The experience should feel:

- informative
- simple
- visual
- non-overwhelming

---

# 🎨 UI/UX Direction

AI should design freely while maintaining:

- premium minimal visuals
- soft visual indicators
- strong readability
- lightweight interface

Budget visibility should feel intuitive and immediate.

---

# 🎨 Theme & White Label Requirements

Maintain centralized white-label theming architecture.

Theme system should:

- remain globally configurable
- support future customization
- keep visual consistency across all screens

The UI should continue feeling:

- elegant
- minimal
- modern

---

# 📱 Required Screens

## Screen 8: Budgets List

Minimum requirements:

- budget list
- category/overall label
- budget amount
- used amount
- remaining amount
- usage percentage
- visual status indicator
- add budget action

---

## Screen 9: Add/Edit Budget

Minimum requirements:

- category selection
- budget amount
- budget period
- start date
- save action

---

## Screen 10: Budget Detail

Minimum requirements:

- budget summary
- usage details
- remaining amount
- related transactions
- edit action
- delete action

---

## Screen 11: Recurring Rules List

Minimum requirements:

- recurring entries list
- amount visibility
- frequency visibility
- next due date
- add recurring rule
- edit recurring rule
- manual recurring execution trigger

---

## Screen 12: Add/Edit Recurring Rule

Minimum requirements:

- transaction type
- amount
- category
- account
- frequency
- start date
- optional end date
- note
- save action

---

# ⚙️ Functional Requirements

## Budget Calculation

- budgets should only consider expense transactions
- deleted transactions should be ignored

---

## Recurring Processing

- recurring transactions should not duplicate
- next due date should update immediately after processing

---

# ✅ Validation Rules

## Budgets

- amount must be greater than 0
- valid period required

---

## Recurring Rules

- amount must be greater than 0
- valid frequency required
- account required

---

# ⚡ UX Expectations

- budget status should be understandable instantly
- recurring setup should feel simple
- visual indicators should not feel aggressive

---

# 🚫 Avoid

- financial complexity
- too many graphs
- overloaded dashboards
- excessive notifications
