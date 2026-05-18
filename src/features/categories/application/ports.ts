import type { CategoryInput } from "../domain/category.schema";

export type CategoryRepository = {
  create(input: CategoryInput & { userId: string }): Promise<void>;
  update(categoryId: string, input: CategoryInput): Promise<void>;
  softDelete(categoryId: string, deletedAt: string): Promise<void>;
};
