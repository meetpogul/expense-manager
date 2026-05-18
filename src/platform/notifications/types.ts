export type NotificationPermissionState =
  | "default"
  | "denied"
  | "granted"
  | "unsupported";

export type AppNotificationOptions = {
  badge?: string;
  body?: string;
  data?: {
    url?: string;
    [key: string]: unknown;
  };
  icon?: string;
  silent?: boolean;
  tag?: string;
};

export type NotificationResult =
  | { status: "shown" }
  | { status: "unsupported" }
  | { status: "permission-denied" }
  | { status: "permission-default" }
  | { status: "missing-service-worker" }
  | { status: "error"; error: unknown };
