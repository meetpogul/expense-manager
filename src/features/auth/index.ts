/**
 * Public API surface for the auth feature.
 *
 * Server-side modules (server/actions, server/session) are intentionally
 * excluded — import those directly to keep the "use server" boundary explicit.
 */

// Domain — types
export type { AuthMode } from "./domain/types";

// Domain — constants
export {
  AUTH_MODES,
  AUTH_MODE_LABELS,
  AUTH_TOGGLE_LABELS,
} from "./domain/constants";

// Components
export { AuthForm, AuthFormContainer } from "./components/auth-form";
export { getSupabaseAndUser, getUser } from "./server/session";
