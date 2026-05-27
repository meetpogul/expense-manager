import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/platform/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function getSupabaseAndUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  const userId = data?.user?.id;

  if (error || !userId) {
    redirect("/auth/login");
  }

  return { supabase, userId };
}

export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

export async function getUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}
