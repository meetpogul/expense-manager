import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      include: [
        "src/features/auth/components/**/*.tsx",
        "src/features/transactions/components/**/*.tsx",
        "src/features/accounts/components/**/*.tsx",
        "src/features/categories/components/**/*.tsx",
        "src/features/budgets/components/**/*.tsx",
        "src/features/recurring/components/**/*.tsx",
        "src/components/layout/app-nav.tsx",
        "src/shared/domain/**/*.ts",
        "src/shared/application/{action-state,form-data,zod-errors}.ts",
        "src/platform/supabase/normalize.ts",
        "src/features/transactions/application/**/*.ts",
        "src/features/accounts/application/**/*.ts",
        "src/features/categories/application/**/*.ts",
        "src/features/budgets/application/**/*.ts",
        "src/features/recurring/application/**/*.ts",
        "src/features/transactions/infrastructure/transaction-row.mapper.ts",
        "src/features/accounts/domain/**/*.ts",
        "src/features/categories/domain/**/*.ts",
        "src/features/transactions/domain/**/*.ts",
        "src/features/budgets/domain/**/*.ts",
        "src/features/recurring/domain/**/*.ts",
        "src/features/transactions/domain/balance.ts",
        "src/features/transactions/domain/validation.ts",
        "src/features/accounts/domain/validation.ts",
        "src/features/categories/domain/validation.ts",
        "src/features/transactions/server/mutations.ts",
      ],
      exclude: ["**/__tests__/**", "**/types.ts", "**/ports.ts"],
      provider: "v8",
      reporter: ["text", "json-summary"],
      thresholds: {
        branches: 85,
        functions: 90,
        lines: 90,
        statements: 90,
      },
    },
    environment: "jsdom",
    globals: true,
    pool: "threads",
    setupFiles: ["./test/setup.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
