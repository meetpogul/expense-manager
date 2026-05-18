import { cn } from "@/lib/utils";

import type { ActionState } from "@/lib/actions/state";

type ActionStatusProps = {
  state: ActionState;
};

export function ActionStatus({ state }: ActionStatusProps) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        state.ok
          ? "border-primary/20 bg-primary/5 text-primary"
          : "border-destructive/20 bg-destructive/5 text-destructive",
      )}
    >
      {state.message}
    </p>
  );
}
