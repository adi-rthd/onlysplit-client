/**
 * Feature flags for TanStack Query migration.
 *
 * All flags are now permanently enabled — the new query layer is the active path.
 * Legacy Zustand stores remain in the codebase as dead code until a separate
 * cleanup PR removes them after production stability is confirmed.
 */
export const featureFlags = {
  useQueryExpenses: true,
  useQueryGroups: true,
  useQueryFriends: true,
  useQueryInvitations: true,
};
