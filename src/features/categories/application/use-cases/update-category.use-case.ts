import type { CategoryInput } from "../../domain/category.schema";
import type { CategoryRepository } from "../ports";

export class UpdateCategoryUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  execute(categoryId: string, input: CategoryInput) {
    return this.repository.update(categoryId, input);
  }
}
