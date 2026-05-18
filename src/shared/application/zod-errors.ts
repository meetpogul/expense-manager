import type { z } from "zod";

export function fieldErrorsFromZod(error: z.ZodError) {
  return error.issues.reduce<Record<string, string>>((fieldErrors, issue) => {
    const [field] = issue.path;

    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }

    return fieldErrors;
  }, {});
}
