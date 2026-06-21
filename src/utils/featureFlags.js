/**
 * Feature flags for incremental TanStack Query migration.
 * Each flag controls whether a specific domain uses the new query hooks
 * or falls back to the legacy Zustand stores.
 *
 * Toggle via environment variables (VITE_USE_QUERY_*) or hardcode here during development.
 * Set to `true` to enable the query-based implementation for that domain.
 */
export const featureFlags = {
  useQueryExpenses: import.meta.env.VITE_USE_QUERY_EXPENSES === 'true',
  useQueryGroups: import.meta.env.VITE_USE_QUERY_GROUPS === 'true',
  useQueryFriends: import.meta.env.VITE_USE_QUERY_FRIENDS === 'true',
  useQueryInvitations: import.meta.env.VITE_USE_QUERY_INVITATIONS === 'true',
};
