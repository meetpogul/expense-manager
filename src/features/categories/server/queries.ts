import "server-only";

import { createClient } from "@/platform/supabase/server";

import type { Category } from "../domain/types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function getCategories(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("is_default", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Category[];
}
