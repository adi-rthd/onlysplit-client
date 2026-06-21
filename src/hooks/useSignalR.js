/**
 * useSignalR — hook to manage SignalR lifecycle tied to auth state.
 * Starts connections when authenticated, stops on logout.
 *
 * Usage: Call once in App.jsx or a top-level layout component.
 */
import { useEffect } from 'react';
import { signalR } from '../socket/signalrClient';
import { useAuthStore } from '../store/authStore';

export function useSignalR() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (isAuthenticated && token) {
      signalR.start();
    } else {
      signalR.stop();
    }

    return () => {
      signalR.stop();
    };
  }, [isAuthenticated, token]);
}

/**
 * useGroupSignalR — hook for group-specific real-time events.
 * Joins/leaves the group channel and registers event listeners.
 *
 * Usage: Call in GroupDetailsPage with the groupId.
 */
export function useGroupSignalR(groupId, handlers = {}) {
  useEffect(() => {
    if (!groupId) return;

    // Join the group channel
    signalR.joinGroup(groupId);

    // Register listeners
    if (handlers.onExpenseAdded) signalR.onExpenseAdded(handlers.onExpenseAdded);
    if (handlers.onExpenseUpdated) signalR.onExpenseUpdated(handlers.onExpenseUpdated);
    if (handlers.onExpenseDeleted) signalR.onExpenseDeleted(handlers.onExpenseDeleted);
    if (handlers.onBalanceUpdated) signalR.onBalanceUpdated(handlers.onBalanceUpdated);
    if (handlers.onMemberJoined) signalR.onMemberJoined(handlers.onMemberJoined);
    if (handlers.onMemberRemoved) signalR.onMemberRemoved(handlers.onMemberRemoved);
    if (handlers.onGroupUpdated) signalR.onGroupUpdated(handlers.onGroupUpdated);
    if (handlers.onSettlementUpdated) signalR.onSettlementUpdated(handlers.onSettlementUpdated);

    return () => {
      signalR.leaveGroup(groupId);
      signalR.offGroupEvents();
    };
  }, [groupId]);
}

/**
 * useActivitySignalR — hook for notification events.
 *
 * Usage: Call in a layout or notification component.
 */
export function useActivitySignalR(handlers = {}) {
  useEffect(() => {
    if (handlers.onFriendRequestReceived) signalR.onFriendRequestReceived(handlers.onFriendRequestReceived);
    if (handlers.onFriendRequestAccepted) signalR.onFriendRequestAccepted(handlers.onFriendRequestAccepted);
    if (handlers.onFriendRequestRejected) signalR.onFriendRequestRejected(handlers.onFriendRequestRejected);
    if (handlers.onGroupInvitationReceived) signalR.onGroupInvitationReceived(handlers.onGroupInvitationReceived);
    if (handlers.onGroupInvitationAccepted) signalR.onGroupInvitationAccepted(handlers.onGroupInvitationAccepted);
    if (handlers.onGroupInvitationRejected) signalR.onGroupInvitationRejected(handlers.onGroupInvitationRejected);

    return () => {
      signalR.offActivityEvents();
    };
  }, []);
}

/**
 * usePaymentSignalR — hook for payment status events.
 */
export function usePaymentSignalR(handlers = {}) {
  useEffect(() => {
    if (handlers.onPaymentCompleted) signalR.onPaymentCompleted(handlers.onPaymentCompleted);
    if (handlers.onPaymentFailed) signalR.onPaymentFailed(handlers.onPaymentFailed);
    if (handlers.onPaymentRefunded) signalR.onPaymentRefunded(handlers.onPaymentRefunded);

    return () => {
      signalR.offPaymentEvents();
    };
  }, []);
}
