/**
 * Centralized query key factory.
 * All query keys are generated from this module — no inline key literals elsewhere.
 * Supports TanStack Query prefix-based invalidation via hierarchical arrays.
 */
export const queryKeys = {
  groups: {
    all: () => ['groups'],
    lists: () => ['groups', 'list'],
    detail: (groupId) => ['groups', groupId],
    expenses: (groupId) => ['groups', groupId, 'expenses'],
    balances: (groupId) => ['groups', groupId, 'balances'],
    settlements: (groupId) => ['groups', groupId, 'settlements'],
  },
  friends: {
    all: () => ['friends'],
    list: () => ['friends', 'list'],
    requests: () => ['friends', 'requests'],
    sent: () => ['friends', 'sent'],
  },
  activities: {
    all: () => ['activities'],
    list: () => ['activities', 'list'],
  },
  dashboard: {
    all: () => ['dashboard'],
    summary: () => ['dashboard', 'summary'],
  },
  notifications: {
    all: () => ['notifications'],
    list: () => ['notifications', 'list'],
  },
  invitations: {
    all: () => ['invitations'],
    list: () => ['invitations', 'list'],
    group: (groupId) => ['invitations', groupId],
  },
  settlements: {
    all: () => ['settlements'],
    payments: (settlementId) => ['settlements', settlementId, 'payments'],
  },
};
