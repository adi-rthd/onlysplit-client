import { queryKeys } from './queryKeys';

/**
 * Mutation-to-invalidation mapping.
 * Each key is a mutation type; each value is a function returning the query keys
 * that must be invalidated when that mutation succeeds.
 *
 * Special case: `deleteGroup` returns an object with `invalidate` (keys to invalidate)
 * and `remove` (keys to remove from cache entirely via prefix matching).
 */
export const invalidationMap = {
  createExpense: (groupId) => [
    queryKeys.groups.expenses(groupId),
    queryKeys.groups.balances(groupId),
    queryKeys.groups.settlements(groupId),
    queryKeys.dashboard.summary(),
    queryKeys.activities.all(),
  ],
  updateExpense: (groupId) => [
    queryKeys.groups.expenses(groupId),
    queryKeys.groups.balances(groupId),
    queryKeys.groups.settlements(groupId),
    queryKeys.dashboard.summary(),
  ],
  deleteExpense: (groupId) => [
    queryKeys.groups.expenses(groupId),
    queryKeys.groups.balances(groupId),
    queryKeys.groups.settlements(groupId),
    queryKeys.dashboard.summary(),
    queryKeys.activities.all(),
  ],
  createGroup: () => [
    queryKeys.groups.all(),
    queryKeys.dashboard.summary(),
    queryKeys.activities.all(),
  ],
  updateGroup: (groupId) => [
    queryKeys.groups.all(),
    queryKeys.groups.detail(groupId),
    queryKeys.dashboard.summary(),
  ],
  deleteGroup: (groupId) => ({
    invalidate: [queryKeys.groups.all(), queryKeys.dashboard.summary()],
    remove: [queryKeys.groups.detail(groupId)],
  }),
  recordSettlement: (groupId) => [
    queryKeys.groups.balances(groupId),
    queryKeys.groups.settlements(groupId),
    queryKeys.dashboard.summary(),
    queryKeys.activities.all(),
  ],
  regenerateSettlements: (groupId) => [
    queryKeys.groups.balances(groupId),
    queryKeys.groups.settlements(groupId),
  ],
  sendFriendRequest: () => [queryKeys.friends.sent()],
  acceptFriendRequest: () => [
    queryKeys.friends.all(),
    queryKeys.friends.requests(),
    queryKeys.activities.all(),
  ],
  rejectFriendRequest: () => [queryKeys.friends.requests()],
  removeFriend: () => [queryKeys.friends.all()],
  acceptInvitation: () => [
    queryKeys.groups.all(),
    queryKeys.invitations.all(),
    queryKeys.dashboard.summary(),
  ],
  rejectInvitation: () => [queryKeys.invitations.all()],
  leaveGroup: (groupId) => ({
    invalidate: [queryKeys.groups.all(), queryKeys.dashboard.summary()],
    remove: [queryKeys.groups.detail(groupId)],
  }),
  inviteToGroup: (groupId) => [queryKeys.invitations.group(groupId)],
  removeMember: (groupId) => [
    queryKeys.groups.detail(groupId),
    queryKeys.groups.balances(groupId),
    queryKeys.groups.settlements(groupId),
    queryKeys.groups.expenses(groupId),
    queryKeys.dashboard.summary(),
  ],
  markNotificationsRead: () => [queryKeys.notifications.all()],

  // Settlement Payments
  recordSettlementPayment: (settlementId, groupId) => [
    queryKeys.settlements.payments(settlementId),
    queryKeys.dashboard.summary(),
    ...(groupId ? [queryKeys.groups.settlements(groupId)] : []),
  ],
  confirmSettlementPayment: (settlementId, groupId) => [
    queryKeys.settlements.payments(settlementId),
    queryKeys.dashboard.summary(),
    ...(groupId ? [queryKeys.groups.balances(groupId), queryKeys.groups.settlements(groupId)] : []),
  ],
  rejectSettlementPayment: (settlementId) => [
    queryKeys.settlements.payments(settlementId),
  ],
  cancelSettlementPayment: (settlementId) => [
    queryKeys.settlements.payments(settlementId),
  ],
  uploadSettlementProof: (settlementId) => [
    queryKeys.settlements.payments(settlementId),
  ],
  forgiveSettlement: (settlementId, groupId) => [
    queryKeys.settlements.payments(settlementId),
    queryKeys.dashboard.summary(),
    ...(groupId ? [queryKeys.groups.balances(groupId), queryKeys.groups.settlements(groupId)] : []),
  ],
};
