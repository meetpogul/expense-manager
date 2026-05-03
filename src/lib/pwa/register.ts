export const SERVICE_WORKER_PATH = "/sw.js";

export type ServiceWorkerStatus =
  | "unsupported"
  | "registered"
  | "updated"
  | "error";

export type ServiceWorkerRegistrationResult =
  | {
      status: Exclude<ServiceWorkerStatus, "error">;
      registration?: ServiceWorkerRegistration;
    }
  | {
      status: "error";
      error: unknown;
    };

export const isPwaRuntimeSupported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  window.isSecureContext;

export const isStandaloneDisplayMode = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
};

export async function registerServiceWorker(
  serviceWorkerPath = SERVICE_WORKER_PATH,
): Promise<ServiceWorkerRegistrationResult> {
  if (!isPwaRuntimeSupported()) {
    return { status: "unsupported" };
  }

  try {
    const registration =
      await navigator.serviceWorker.register(serviceWorkerPath);

    registration.update();

    return {
      status: registration.waiting ? "updated" : "registered",
      registration,
    };
  } catch (error) {
    return { status: "error", error };
  }
}

export async function getServiceWorkerRegistration() {
  if (!isPwaRuntimeSupported()) {
    return null;
  }

  return navigator.serviceWorker.getRegistration(SERVICE_WORKER_PATH);
}

export function activateWaitingServiceWorker(
  registration: ServiceWorkerRegistration,
) {
  registration.waiting?.postMessage({ type: "SKIP_WAITING" });
}
