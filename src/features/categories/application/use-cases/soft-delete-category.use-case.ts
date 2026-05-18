import type { CategoryRepository } from "../ports";

export class SoftDeleteCategoryUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  execute(categoryId: string, deletedAt: string) {
    return this.repository.softDelete(categoryId, deletedAt);
  }
}
