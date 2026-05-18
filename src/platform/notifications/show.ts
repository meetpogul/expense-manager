import { getServiceWorkerRegistration } from "@/platform/pwa";

import {
  getNotificationPermission,
  isNotificationSupported,
} from "./permissions";
import type { AppNotificationOptions, NotificationResult } from "./types";

export async function showLocalNotification(
  title: string,
  options: AppNotificationOptions = {},
): Promise<NotificationResult> {
  if (!isNotificationSupported()) {
    return { status: "unsupported" };
  }

  const permission = getNotificationPermission();

  if (permission === "denied") {
    return { status: "permission-denied" };
  }

  if (permission === "default") {
    return { status: "permission-default" };
  }

  try {
    const registration = await getServiceWorkerRegistration();

    if (!registration) {
      return { status: "missing-service-worker" };
    }

    await registration.showNotification(title, {
      badge: options.badge ?? "/icons/icon-192.png",
      body: options.body,
      data: options.data,
      icon: options.icon ?? "/icons/icon-192.png",
      silent: options.silent,
      tag: options.tag,
    });

    return { status: "shown" };
  } catch (error) {
    return { status: "error", error };
  }
}
