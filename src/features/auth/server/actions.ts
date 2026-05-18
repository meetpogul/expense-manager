"use server";

import { redirect } from "next/navigation";

import { actionError } from "@/lib/actions/state";
import { createClient } from "@/platform/supabase/server";

import type { ActionState } from "@/lib/actions/state";

export async function signInOrSignUpAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const intent = formData.get("intent");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (!email || !password) {
    return actionError("Enter your email and password.");
  }

  if (intent === "signup") {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: fullName ? { full_name: fullName } : undefined,
      },
    });

    if (error) {
      return actionError(error.message);
    }

    if (!data.session) {
      return {
        ok: true,
        message: "Account created. Check your email to confirm your sign in.",
      };
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return actionError(error.message);
    }
  }

  redirect("/");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
