/**
 * SignalR → Query Cache Invalidation Bridge
 *
 * This is the single global bridge that maps ALL SignalR hub events to
 * Query Cache invalidations. No component should manage its own SignalR
 * subscriptions after Phase 4.
 *
 * Call setupSignalRBridge() ONCE at app startup (in useSignalR hook after connectAll).
 */
import { queryKeys } from './queryKeys';

const isDev = import.meta.env.DEV;

/**
 * Log a SignalR event and the query keys being invalidated (DEV only).
 */
function logEvent(hub, event, keys) {
  if (isDev) {
    console.log(
      `[SignalR Bridge] ${hub}::${event} → invalidating:`,
      keys.map((k) => JSON.stringify(k))
    );
  }
}

/**
 * Sets up the global SignalR-to-QueryCache bridge.
 *
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {{ groupHub: object, activityHub: object, paymentHub: object }} hubs
 */
export function setupSignalRBridge(queryClient, { groupHub, activityHub, paymentHub }) {
  // --- Groups Hub ---
  const groupEvents = {
    ExpenseAdded: (gId) => [
      queryKeys.groups.expenses(gId),
      queryKeys.groups.balances(gId),
      queryKeys.groups.settlements(gId),
    ],
    ExpenseUpdated: (gId) => [
      queryKeys.groups.expenses(gId),
      queryKeys.groups.balances(gId),
      queryKeys.groups.settlements(gId),
    ],
    ExpenseDeleted: (gId) => [
      queryKeys.groups.expenses(gId),
      queryKeys.groups.balances(gId),
      queryKeys.groups.settlements(gId),
    ],
    BalanceUpdated: (gId) => [
      queryKeys.groups.balances(gId),
      queryKeys.groups.settlements(gId),
    ],
    GroupUpdated: (gId) => [
      queryKeys.groups.detail(gId),
      queryKeys.groups.all(),
    ],
    MemberJoined: (gId) => [
      queryKeys.groups.detail(gId),
      queryKeys.groups.balances(gId),
    ],
    MemberRemoved: (gId) => [
      queryKeys.groups.detail(gId),
      queryKeys.groups.balances(gId),
    ],
    SettlementUpdated: (gId) => [
      queryKeys.groups.settlements(gId),
      queryKeys.groups.balances(gId),
      queryKeys.dashboard.summary(),
    ],
  };

  Object.entries(groupEvents).forEach(([event, getKeys]) => {
    groupHub.on(event, (payload) => {
      const gId = payload?.groupId || payload;
      const keys = getKeys(gId);
      logEvent('/groups', event, keys);
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    });
  });

  // --- Activity Hub ---
  const activityEvents = {
    FriendRequestReceived: () => [
      queryKeys.notifications.all(),
      queryKeys.friends.requests(),
    ],
    FriendRequestAccepted: () => [
      queryKeys.notifications.all(),
      queryKeys.friends.all(),
    ],
    GroupInvitationReceived: () => [
      queryKeys.notifications.all(),
      queryKeys.invitations.all(),
    ],
    GroupInvitationAccepted: () => [
      queryKeys.notifications.all(),
      queryKeys.groups.all(),
    ],
  };

  Object.entries(activityEvents).forEach(([event, getKeys]) => {
    activityHub.on(event, () => {
      const keys = getKeys();
      logEvent('/activity', event, keys);
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    });
  });

  // --- Payments Hub ---
  const paymentEvents = {
    PaymentCompleted: (gId) => [
      queryKeys.groups.balances(gId),
      queryKeys.groups.settlements(gId),
      queryKeys.dashboard.summary(),
    ],
    PaymentRefunded: (gId) => [
      queryKeys.groups.balances(gId),
      queryKeys.groups.settlements(gId),
      queryKeys.dashboard.summary(),
    ],
  };

  Object.entries(paymentEvents).forEach(([event, getKeys]) => {
    paymentHub.on(event, (payload) => {
      const gId = payload?.groupId || payload;
      const keys = getKeys(gId);
      logEvent('/payments', event, keys);
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    });
  });

  // --- Reconnection handler ---
  // On any hub reconnect, invalidate broad keys to trigger full resync.
  [groupHub, activityHub, paymentHub].forEach((hub) => {
    hub.onreconnected(() => {
      const keys = [
        queryKeys.groups.all(),
        queryKeys.dashboard.all(),
        queryKeys.activities.all(),
        queryKeys.notifications.all(),
      ];

      if (isDev) {
        console.log(
          '[SignalR Bridge] Reconnected — full invalidation triggered:',
          keys.map((k) => JSON.stringify(k))
        );
      }

      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    });
  });
}
