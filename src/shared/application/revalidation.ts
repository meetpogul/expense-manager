import { revalidatePath } from "next/cache";

import { FINANCE_REVALIDATION_PATHS } from "@/shared/constants/routes";

export function revalidateFinancePaths() {
  FINANCE_REVALIDATION_PATHS.forEach((path) => revalidatePath(path));
}
