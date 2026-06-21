/**
 * SignalR React hooks.
 *
 * useSignalR()         — Connect/disconnect based on auth state (call in App.jsx)
 * useActivityEvents()  — Listen for activity hub events (notifications)
 * useGroupEvents()     — Listen for group hub events (expenses, balances)
 * usePaymentEvents()   — Listen for payment hub events
 */
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  connectAll,
  disconnectAll,
  getActivityHub,
  getGroupHub,
  getPaymentHub,
  joinGroup,
  leaveGroup,
} from '../socket/signalrClient';

/**
 * Manages SignalR connection lifecycle tied to auth.
 * Call once in App.jsx.
 */
export function useSignalR() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (isAuthenticated && token) {
      connectAll().catch(console.error);
    } else {
      disconnectAll().catch(console.error);
    }

    return () => {
      disconnectAll().catch(console.error);
    };
  }, [isAuthenticated, token]);
}

/**
 * Listen for activity hub events (friend requests, group invitations).
 * @param {Record<string, Function>} handlers - Event name → callback map
 */
export function useActivityEvents(handlers) {
  useEffect(() => {
    const hub = getActivityHub();
    if (!hub) return;

    const entries = Object.entries(handlers);
    entries.forEach(([event, handler]) => {
      hub.on(event, handler);
    });

    return () => {
      entries.forEach(([event, handler]) => {
        hub.off(event, handler);
      });
    };
  }, [handlers]);
}

/**
 * Listen for group hub events (expenses, balances, members, settlements).
 * @param {Record<string, Function>} handlers - Event name → callback map
 */
export function useGroupEvents(handlers) {
  useEffect(() => {
    const hub = getGroupHub();
    if (!hub) return;

    const entries = Object.entries(handlers);
    entries.forEach(([event, handler]) => {
      hub.on(event, handler);
    });

    return () => {
      entries.forEach(([event, handler]) => {
        hub.off(event, handler);
      });
    };
  }, [handlers]);
}

/**
 * Listen for payment hub events.
 * @param {Record<string, Function>} handlers - Event name → callback map
 */
export function usePaymentEvents(handlers) {
  useEffect(() => {
    const hub = getPaymentHub();
    if (!hub) return;

    const entries = Object.entries(handlers);
    entries.forEach(([event, handler]) => {
      hub.on(event, handler);
    });

    return () => {
      entries.forEach(([event, handler]) => {
        hub.off(event, handler);
      });
    };
  }, [handlers]);
}

/**
 * Join/leave a group channel + listen for group events.
 * Call in GroupDetailsPage.
 */
export function useGroupSignalR(groupId, handlers) {
  useEffect(() => {
    if (!groupId) return;

    joinGroup(groupId);

    const hub = getGroupHub();
    if (hub) {
      const entries = Object.entries(handlers);
      entries.forEach(([event, handler]) => {
        hub.on(event, handler);
      });
    }

    return () => {
      leaveGroup(groupId);
      const hub = getGroupHub();
      if (hub) {
        Object.keys(handlers).forEach((event) => {
          hub.off(event);
        });
      }
    };
  }, [groupId]);
}
