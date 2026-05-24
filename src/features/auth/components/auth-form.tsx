"use client";

import { useActionState, useState } from "react";
import { ArrowRightIcon } from "lucide-react";

import { signInOrSignUpAction } from "@/features/auth/server/actions";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { emptyActionState } from "@/lib/actions/state";
import { cn } from "@/lib/utils";

import type { ActionState } from "@/lib/actions/state";

interface AuthFormProps {
  action: (payload: FormData) => void;
  pending: boolean;
  state: ActionState;
}

export function AuthForm({ action, pending, state }: AuthFormProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <form action={action} className="flex flex-col gap-5">
      <input name="intent" type="hidden" value={mode} />
      <div
        aria-label="Authentication mode"
        className="bg-muted flex rounded-lg border p-1"
        role="group"
      >
        {(["signin", "signup"] as const).map((item) => (
          <button
            aria-pressed={mode === item}
            className={cn(
              "focus-visible:ring-ring/50 h-9 flex-1 rounded-md border text-sm font-medium transition-colors outline-none focus-visible:ring-[3px]",
              mode === item
                ? "border-border bg-background text-foreground shadow-sm"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            key={item}
            onClick={() => setMode(item)}
            type="button"
          >
            {item === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>
      {mode === "signup" ? (
        <FormField htmlFor="full_name" label="Name">
          <Input
            autoComplete="name"
            id="full_name"
            name="full_name"
            placeholder="John Doe"
          />
        </FormField>
      ) : null}
      <FormField htmlFor="email" label="Email">
        <Input
          autoComplete="email"
          id="email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
      </FormField>
      <FormField htmlFor="password" label="Password">
        <Input
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          id="password"
          minLength={6}
          name="password"
          placeholder="At least 6 characters"
          required
          type="password"
        />
      </FormField>
      {state.message ? (
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
      ) : null}
      <Button className="h-11" disabled={pending}>
        {pending
          ? "Working..."
          : mode === "signin"
            ? "Sign in"
            : "Create account"}
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
    </form>
  );
}

export function AuthFormContainer() {
  const [state, formAction, isPending] = useActionState(
    signInOrSignUpAction,
    emptyActionState,
  );

  return <AuthForm action={formAction} pending={isPending} state={state} />;
}
