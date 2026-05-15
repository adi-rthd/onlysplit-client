/**
 * SignalR client placeholder.
 *
 * When the ASP.NET Core backend is ready, install the client:
 *   npm install @microsoft/signalr
 *
 * Then uncomment and configure the connection below.
 */

const SIGNALR_URL = import.meta.env.VITE_SIGNALR_URL || 'http://localhost:5000/hubs';

// ── Future implementation ──
//
// import { HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';
// import { useAuthStore } from '../store/authStore';
//
// let connection = null;
//
// export const createSignalRConnection = () => {
//   const token = useAuthStore.getState().token;
//
//   connection = new HubConnectionBuilder()
//     .withUrl(`${SIGNALR_URL}/expenses`, {
//       accessTokenFactory: () => token,
//       transport: HttpTransportType.WebSockets,
//     })
//     .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
//     .configureLogging(LogLevel.Information)
//     .build();
//
//   return connection;
// };
//
// export const startConnection = async () => {
//   try {
//     if (connection) {
//       await connection.start();
//       console.log('[SignalR] Connected');
//     }
//   } catch (err) {
//     console.error('[SignalR] Connection failed:', err);
//     // Retry after 5s
//     setTimeout(startConnection, 5000);
//   }
// };
//
// export const stopConnection = async () => {
//   if (connection) {
//     await connection.stop();
//     connection = null;
//   }
// };
//
// // ── Event registration helpers ──
// export const onExpenseCreated = (callback) => connection?.on('ExpenseCreated', callback);
// export const onSettlementUpdated = (callback) => connection?.on('SettlementUpdated', callback);
// export const onBalanceRefreshed = (callback) => connection?.on('BalanceRefreshed', callback);
// export const onActivityFeedUpdate = (callback) => connection?.on('ActivityUpdate', callback);

export const SIGNALR_EVENTS = {
  EXPENSE_CREATED: 'ExpenseCreated',
  EXPENSE_UPDATED: 'ExpenseUpdated',
  EXPENSE_DELETED: 'ExpenseDeleted',
  SETTLEMENT_UPDATED: 'SettlementUpdated',
  BALANCE_REFRESHED: 'BalanceRefreshed',
  ACTIVITY_UPDATE: 'ActivityUpdate',
};
