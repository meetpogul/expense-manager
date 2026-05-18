/**
 * Public API surface for the categories feature.
 *
 * Server-side modules (server/actions, server/queries) are intentionally
 * excluded — import those directly from their file paths to keep the
 * "use server" / server-only boundary explicit.
 */

// Domain — types
export type { Category, CategoryType } from "./domain/types";

// Domain — schema + inferred types
export { categoryFormSchema } from "./domain/category.schema";
export type {
  CategoryFormValues,
  CategoryInput,
} from "./domain/category.schema";

// Domain — constants
export {
  CATEGORY_TYPES,
  CATEGORY_TYPE_LABELS,
  DEFAULT_EXPENSE_CATEGORY_NAME,
} from "./domain/constants";

// Components
export { CategoryForm } from "./components/category-form";
