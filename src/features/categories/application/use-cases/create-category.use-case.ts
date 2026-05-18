import type { CategoryInput } from "../../domain/category.schema";
import type { CategoryRepository } from "../ports";

export class CreateCategoryUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  execute(input: CategoryInput, userId: string) {
    return this.repository.create({ ...input, userId });
  }
}
