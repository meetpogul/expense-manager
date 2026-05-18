export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;

export function listenForInstallPrompt(
  callback?: (event: BeforeInstallPromptEvent) => void,
) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleBeforeInstallPrompt = (event: Event) => {
    event.preventDefault();
    deferredInstallPrompt = event as BeforeInstallPromptEvent;
    callback?.(deferredInstallPrompt);
  };

  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

  return () => {
    window.removeEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt,
    );
  };
}

export function getDeferredInstallPrompt() {
  return deferredInstallPrompt;
}

export async function promptInstall() {
  if (!deferredInstallPrompt) {
    return { available: false as const };
  }

  await deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;

  return {
    available: true as const,
    outcome: choice.outcome,
    platform: choice.platform,
  };
}
