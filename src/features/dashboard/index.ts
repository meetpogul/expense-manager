/**
 * Public API surface for the dashboard feature.
 *
 * The dashboard is a read-only aggregate feature — it owns no data
 * but assembles summary views from accounts, categories, and transactions.
 *
 * Server-side modules (server/queries) are intentionally excluded — import
 * those directly to keep the server-only boundary explicit.
 *
 * @see README.md for planned architecture and evolution path.
 */

// Domain — types
export type { DashboardSummary } from "./domain/types";

// Components
export { SummaryCard } from "./components/summary-card";
