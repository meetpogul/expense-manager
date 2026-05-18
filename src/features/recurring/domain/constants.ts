export const RECURRING_FREQUENCIES = [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "quarterly",
  "yearly",
] as const;

export const RECURRING_FREQUENCY_LABELS: Record<
  (typeof RECURRING_FREQUENCIES)[number],
  string
> = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Every 2 weeks",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};
