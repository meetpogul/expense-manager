import Link from "next/link";
import { PencilIcon, Trash2Icon } from "lucide-react";

import { AppShell } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { getSupabaseAndUser } from "@/features/auth/server/session";
import { CategoryForm } from "@/features/categories/components/category-form";
import { softDeleteCategoryAction } from "@/features/categories/server/actions";
import { getCategories } from "@/features/categories/server/queries";

type CategoriesPageProps = {
  searchParams: Promise<{ edit?: string }>;
};

export default async function CategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  const { edit } = await searchParams;
  const { supabase } = await getSupabaseAndUser();
  const categories = await getCategories(supabase);
  const editingCategory = categories.find(
    (category) => category.id === edit && category.user_id,
  );

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">
              Categories
            </h1>
            <p className="text-muted-foreground text-sm">
              A short list makes quick entry faster.
            </p>
          </div>
          {categories.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {categories.map((category) => (
                <Card className="shadow-sm shadow-black/5" key={category.id}>
                  <CardContent className="flex items-center justify-between gap-4 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="bg-secondary flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-medium">
                        {category.icon ?? category.name.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2">
                          <p className="truncate text-sm font-medium">
                            {category.name}
                          </p>
                          {category.is_default ? <Badge>Default</Badge> : null}
                        </div>
                        <p className="text-muted-foreground text-xs capitalize">
                          {category.type}
                        </p>
                      </div>
                    </div>
                    {category.user_id ? (
                      <div className="flex shrink-0 items-center gap-1">
                        <Button asChild size="icon" variant="ghost">
                          <Link
                            aria-label={`Edit ${category.name}`}
                            href={`/categories?edit=${category.id}`}
                          >
                            <PencilIcon />
                          </Link>
                        </Button>
                        <form action={softDeleteCategoryAction}>
                          <input name="id" type="hidden" value={category.id} />
                          <Button
                            aria-label={`Delete ${category.name}`}
                            size="icon"
                            type="submit"
                            variant="ghost"
                          >
                            <Trash2Icon />
                          </Button>
                        </form>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Empty
              description="Default categories should appear after sign in."
              title="No categories yet"
            />
          )}
        </section>
        <aside>
          <Card className="sticky top-36 shadow-lg shadow-black/5">
            <CardHeader>
              <CardTitle className="text-base">
                {editingCategory ? "Edit category" : "Add category"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryForm category={editingCategory} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
