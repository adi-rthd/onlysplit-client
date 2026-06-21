/**
 * SignalR real-time service — manages 3 hub connections:
 *   /hubs/groups   — group-level events (expenses, balances, members)
 *   /hubs/activity — per-user notifications (friend requests, invites)
 *   /hubs/payments — payment status events
 */
import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_SIGNALR_URL || 'https://api-split.onlylabs.in/hubs';

let activityConnection = null;
let groupConnection = null;
let paymentConnection = null;

function getToken() {
  return useAuthStore.getState().token;
}

function buildConnection(hubPath) {
  return new signalR.HubConnectionBuilder()
    .withUrl(`${BASE_URL}${hubPath}`, {
      accessTokenFactory: () => getToken() || '',
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();
}

export async function connectAll() {
  if (!getToken()) return;

  try {
    activityConnection = buildConnection('/activity');
    groupConnection = buildConnection('/groups');
    paymentConnection = buildConnection('/payments');

    await Promise.all([
      activityConnection.start(),
      groupConnection.start(),
      paymentConnection.start(),
    ]);

    console.log('[SignalR] Connected to all hubs.');
  } catch (err) {
    console.error('[SignalR] Connection failed:', err);
    // Retry after 5s
    setTimeout(connectAll, 5000);
  }
}

export async function disconnectAll() {
  const stops = [];
  if (activityConnection?.state === signalR.HubConnectionState.Connected) {
    stops.push(activityConnection.stop());
  }
  if (groupConnection?.state === signalR.HubConnectionState.Connected) {
    stops.push(groupConnection.stop());
  }
  if (paymentConnection?.state === signalR.HubConnectionState.Connected) {
    stops.push(paymentConnection.stop());
  }
  await Promise.all(stops);
  activityConnection = null;
  groupConnection = null;
  paymentConnection = null;
}

export function getActivityHub() {
  return activityConnection;
}

export function getGroupHub() {
  return groupConnection;
}

export function getPaymentHub() {
  return paymentConnection;
}

// Join a specific group channel (call when navigating to a group)
export async function joinGroup(groupId) {
  if (groupConnection?.state === signalR.HubConnectionState.Connected) {
    await groupConnection.invoke('JoinGroup', groupId);
  }
}

// Leave a specific group channel
export async function leaveGroup(groupId) {
  if (groupConnection?.state === signalR.HubConnectionState.Connected) {
    await groupConnection.invoke('LeaveGroup', groupId);
  }
}
