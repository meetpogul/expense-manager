"use client";

import { startTransition, useActionState, useRef } from "react";

import { emptyActionState } from "./state";

import type { ActionState } from "./state";

type ServerAction = (
  previousState: ActionState,
  formData: FormData,
) => ActionState | Promise<ActionState>;

export function useServerActionForm(action: ServerAction) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    action,
    emptyActionState,
  );

  function submitFormData() {
    if (!formRef.current) {
      return;
    }

    const formData = new FormData(formRef.current);
    startTransition(() => {
      formAction(formData);
    });
  }

  return {
    formRef,
    isPending,
    state,
    submitFormData,
  };
}
