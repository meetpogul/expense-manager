export const BUDGET_PERIODS = ["weekly", "monthly", "yearly"] as const;

export const BUDGET_PERIOD_LABELS: Record<
  (typeof BUDGET_PERIODS)[number],
  string
> = {
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

export const BUDGET_STATUS_LABELS = {
  safe: "Safe",
  warning: "Near limit",
  alert: "Over budget",
} as const;

export const BUDGET_WARNING_THRESHOLD = 80;
export const BUDGET_ALERT_THRESHOLD = 100;
