import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/platform/supabase/server";

export async function getSupabaseAndUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !userId) {
    redirect("/auth/login");
  }

  return { supabase, userId };
}
