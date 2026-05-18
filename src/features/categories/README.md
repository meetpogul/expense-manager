# Feature: Categories

## Purpose

Manages expense and income categories that users apply to transactions for reporting and filtering. Includes both system-default categories (seeded via Supabase) and user-created custom categories.

## Architecture

```
categories/
├── components/        # UI layer: CategoryForm
├── domain/            # Business rules, schema, types, validation
│   ├── types.ts            # Category, CategoryType
│   ├── category.schema.ts  # Zod schema + inferred form/input types
│   └── validation.ts       # FormData → validated CategoryInput
├── hooks/             # (future) reusable category filter state
└── server/            # Supabase queries and server actions
    ├── queries.ts          # getCategories
    └── actions.ts          # createCategoryAction, updateCategoryAction, softDeleteCategoryAction
```

## Data Flow

```
App Page (RSC)
  └─ getCategories(supabase)          ← server/queries.ts

User submits CategoryForm (Client)
  └─ createCategoryAction / updateCategoryAction  ← server/actions.ts
       └─ validateCategoryForm(formData)           ← domain/validation.ts
            └─ categoryFormSchema.safeParse()      ← domain/category.schema.ts
       └─ supabase.from("categories").insert/update
       └─ revalidatePath("/categories")
```

## Important Business Rules

- **Default vs user categories** — Categories with `user_id = null` are system defaults seeded by Supabase. These are read-only: the UI hides edit/delete controls for `is_default` entries (`user_id` check in page).
- **CategoryType = "both"** — A category typed `"both"` is valid for both expense and income transactions. The transaction form filters the category dropdown based on the selected transaction type.
- **Soft delete only** — `softDeleteCategoryAction` stamps `deleted_at`. Default categories cannot be deleted.
- **Ordered for usability** — `getCategories` sorts defaults first, then alphabetically by name, so the most common categories appear at the top of dropdowns.
