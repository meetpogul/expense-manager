import type { createClient } from "@/platform/supabase/server";
import type { CategoryRepository } from "../application/ports";
import type { CategoryInput } from "../domain/category.schema";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export class SupabaseCategoryRepository implements CategoryRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(input: CategoryInput & { userId: string }) {
    const { error } = await this.supabase.from("categories").insert({
      icon: input.icon,
      name: input.name,
      type: input.type,
      user_id: input.userId,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async update(categoryId: string, input: CategoryInput) {
    const { error } = await this.supabase
      .from("categories")
      .update({
        icon: input.icon,
        name: input.name,
        type: input.type,
      })
      .eq("id", categoryId);

    if (error) {
      throw new Error(error.message);
    }
  }

  async softDelete(categoryId: string, deletedAt: string) {
    const { error } = await this.supabase
      .from("categories")
      .update({ deleted_at: deletedAt })
      .eq("id", categoryId);

    if (error) {
      throw new Error(error.message);
    }
  }
}
