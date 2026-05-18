/**
 * Hook: useTransactionFilters
 *
 * Parses URL search params into a typed, structured filter object for
 * use in the transactions page and future filter components.
 *
 * Usage:
 *   // In a Server Component, pass searchParams directly:
 *   const filters = parseTransactionFilters(await searchParams);
 *
 *   // In a Client Component using next/navigation:
 *   const searchParams = useSearchParams();
 *   const filters = parseTransactionFilters(Object.fromEntries(searchParams));
 */

export type TransactionFilters = {
  type?: string;
  categoryId?: string;
  from?: string;
  to?: string;
};

/**
 * Pure function: maps raw search param record to typed TransactionFilters.
 * Filters out falsy values so callers can pass the result directly to
 * `getTransactions(supabase, filters)` without extra guards.
 */
export function parseTransactionFilters(
  params: Record<string, string | undefined>,
): TransactionFilters {
  return {
    ...(params.type && params.type !== "all" ? { type: params.type } : {}),
    ...(params.category && params.category !== "all"
      ? { categoryId: params.category }
      : {}),
    ...(params.from ? { from: params.from } : {}),
    ...(params.to ? { to: params.to } : {}),
  };
}
