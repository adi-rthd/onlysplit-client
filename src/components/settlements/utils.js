/**
 * Settlement Payment UI — shared utilities.
 */

/**
 * Normalizes a payment status from the backend to a consistent frontend key.
 * Backend may return: "PendingConfirmation", "Confirmed", "Rejected", "Cancelled"
 * Frontend uses: "pending", "confirmed", "rejected", "cancelled"
 */
export function normalizePaymentStatus(status) {
  if (!status) return 'pending';
  const s = status.toLowerCase();
  if (s === 'pendingconfirmation' || s === 'pending_confirmation' || s === 'pending') return 'pending';
  if (s === 'confirmed') return 'confirmed';
  if (s === 'rejected') return 'rejected';
  if (s === 'cancelled' || s === 'canceled') return 'cancelled';
  if (s === 'completed') return 'completed';
  return s;
}

/**
 * Checks if a payment is in a "pending" state (awaiting confirmation).
 */
export function isPendingPayment(payment) {
  return normalizePaymentStatus(payment?.status) === 'pending';
}

/**
 * Checks if a payment is confirmed.
 */
export function isConfirmedPayment(payment) {
  return normalizePaymentStatus(payment?.status) === 'confirmed';
}
