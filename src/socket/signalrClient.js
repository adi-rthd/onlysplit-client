/**
 * SignalR real-time client — manages 3 hub connections:
 *   /hubs/groups   — group-level events (expenses, balances, members)
 *   /hubs/activity — per-user notifications (friend requests, invites)
 *   /hubs/payments — payment status events
 *
 * Usage:
 *   import { signalR } from '../socket/signalrClient';
 *   signalR.start();    // Call after login
 *   signalR.stop();     // Call on logout
 *   signalR.joinGroup(groupId);   // When navigating to a group
 *   signalR.leaveGroup(groupId);  // When leaving a group page
 */
import { HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_SIGNALR_URL || 'https://api-split.onlylabs.in/hubs';

// ─── Connection instances ────────────────────────────────────────────
let groupConnection = null;
let activityConnection = null;
let paymentConnection = null;

// ─── Build a hub connection ──────────────────────────────────────────
function buildConnection(hubPath) {
  return new HubConnectionBuilder()
    .withUrl(`${BASE_URL}${hubPath}`, {
      accessTokenFactory: () => useAuthStore.getState().token || '',
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(LogLevel.Warning)
    .build();
}

// ─── Start all connections ───────────────────────────────────────────
async function start() {
  const token = useAuthStore.getState().token;
  if (!token) {
    console.warn('[SignalR] No token, skipping connection.');
    return;
  }

  try {
    groupConnection = buildConnection('/groups');
    activityConnection = buildConnection('/activity');
    paymentConnection = buildConnection('/payments');

    await Promise.all([
      groupConnection.start(),
      activityConnection.start(),
      paymentConnection.start(),
    ]);

    console.log('[SignalR] All hubs connected.');
  } catch (err) {
    console.error('[SignalR] Connection failed:', err);
    // Retry after 5s
    setTimeout(start, 5000);
  }
}

// ─── Stop all connections ────────────────────────────────────────────
async function stop() {
  const stops = [];
  if (groupConnection?.state === HubConnectionState.Connected) {
    stops.push(groupConnection.stop());
  }
  if (activityConnection?.state === HubConnectionState.Connected) {
    stops.push(activityConnection.stop());
  }
  if (paymentConnection?.state === HubConnectionState.Connected) {
    stops.push(paymentConnection.stop());
  }
  await Promise.all(stops);
  groupConnection = null;
  activityConnection = null;
  paymentConnection = null;
  console.log('[SignalR] Disconnected.');
}

// ─── Group channel management ────────────────────────────────────────
async function joinGroup(groupId) {
  if (groupConnection?.state === HubConnectionState.Connected) {
    await groupConnection.invoke('JoinGroup', groupId);
  }
}

async function leaveGroup(groupId) {
  if (groupConnection?.state === HubConnectionState.Connected) {
    await groupConnection.invoke('LeaveGroup', groupId);
  }
}

// ─── Event subscription helpers ──────────────────────────────────────
// Group hub events
function onExpenseAdded(callback) { groupConnection?.on('ExpenseAdded', callback); }
function onExpenseUpdated(callback) { groupConnection?.on('ExpenseUpdated', callback); }
function onExpenseDeleted(callback) { groupConnection?.on('ExpenseDeleted', callback); }
function onBalanceUpdated(callback) { groupConnection?.on('BalanceUpdated', callback); }
function onMemberJoined(callback) { groupConnection?.on('MemberJoined', callback); }
function onMemberRemoved(callback) { groupConnection?.on('MemberRemoved', callback); }
function onGroupUpdated(callback) { groupConnection?.on('GroupUpdated', callback); }
function onSettlementUpdated(callback) { groupConnection?.on('SettlementUpdated', callback); }

// Activity hub events
function onFriendRequestReceived(callback) { activityConnection?.on('FriendRequestReceived', callback); }
function onFriendRequestAccepted(callback) { activityConnection?.on('FriendRequestAccepted', callback); }
function onFriendRequestRejected(callback) { activityConnection?.on('FriendRequestRejected', callback); }
function onGroupInvitationReceived(callback) { activityConnection?.on('GroupInvitationReceived', callback); }
function onGroupInvitationAccepted(callback) { activityConnection?.on('GroupInvitationAccepted', callback); }
function onGroupInvitationRejected(callback) { activityConnection?.on('GroupInvitationRejected', callback); }

// Payment hub events
function onPaymentCompleted(callback) { paymentConnection?.on('PaymentCompleted', callback); }
function onPaymentFailed(callback) { paymentConnection?.on('PaymentFailed', callback); }
function onPaymentRefunded(callback) { paymentConnection?.on('PaymentRefunded', callback); }

// ─── Unsubscribe helpers ─────────────────────────────────────────────
function offGroupEvents() {
  if (!groupConnection) return;
  groupConnection.off('ExpenseAdded');
  groupConnection.off('ExpenseUpdated');
  groupConnection.off('ExpenseDeleted');
  groupConnection.off('BalanceUpdated');
  groupConnection.off('MemberJoined');
  groupConnection.off('MemberRemoved');
  groupConnection.off('GroupUpdated');
  groupConnection.off('SettlementUpdated');
}

function offActivityEvents() {
  if (!activityConnection) return;
  activityConnection.off('FriendRequestReceived');
  activityConnection.off('FriendRequestAccepted');
  activityConnection.off('FriendRequestRejected');
  activityConnection.off('GroupInvitationReceived');
  activityConnection.off('GroupInvitationAccepted');
  activityConnection.off('GroupInvitationRejected');
}

function offPaymentEvents() {
  if (!paymentConnection) return;
  paymentConnection.off('PaymentCompleted');
  paymentConnection.off('PaymentFailed');
  paymentConnection.off('PaymentRefunded');
}

// ─── Connection state checks ─────────────────────────────────────────
function isConnected() {
  return groupConnection?.state === HubConnectionState.Connected;
}

// ─── Export ──────────────────────────────────────────────────────────
export const signalR = {
  start,
  stop,
  joinGroup,
  leaveGroup,
  isConnected,

  // Group events
  onExpenseAdded,
  onExpenseUpdated,
  onExpenseDeleted,
  onBalanceUpdated,
  onMemberJoined,
  onMemberRemoved,
  onGroupUpdated,
  onSettlementUpdated,
  offGroupEvents,

  // Activity events
  onFriendRequestReceived,
  onFriendRequestAccepted,
  onFriendRequestRejected,
  onGroupInvitationReceived,
  onGroupInvitationAccepted,
  onGroupInvitationRejected,
  offActivityEvents,

  // Payment events
  onPaymentCompleted,
  onPaymentFailed,
  onPaymentRefunded,
  offPaymentEvents,
};

// Legacy export for backward compat
export const SIGNALR_EVENTS = {
  EXPENSE_CREATED: 'ExpenseAdded',
  EXPENSE_UPDATED: 'ExpenseUpdated',
  EXPENSE_DELETED: 'ExpenseDeleted',
  SETTLEMENT_UPDATED: 'SettlementUpdated',
  BALANCE_UPDATED: 'BalanceUpdated',
  MEMBER_JOINED: 'MemberJoined',
  MEMBER_REMOVED: 'MemberRemoved',
  GROUP_UPDATED: 'GroupUpdated',
};

export default signalR;
