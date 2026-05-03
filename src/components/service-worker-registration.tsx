"use client";

import { useEffect } from "react";

import { registerServiceWorker } from "@/lib/pwa";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    // Register after the first paint so service worker setup does not block rendering.
    const register = async () => {
      const result = await registerServiceWorker();

      if (result.status === "error") {
        console.error("Service worker registration failed:", result.error);
      }
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register);

    return () => {
      window.removeEventListener("load", register);
    };
  }, []);

  return null;
}
