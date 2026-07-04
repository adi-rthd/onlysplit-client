import React, { useMemo, useState } from 'react';
import { GlassPanel } from '../ui/GlassCard';
import { CreditCard, Banknote, Smartphone, Building2, Clock, Bell, CheckCircle2, XCircle, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PaymentMethodIcon from './PaymentMethodIcon';
import { formatCurrency } from '../../services/currencyService';
import useCurrencyStore from '../../store/useCurrencyStore';
import { isPendingPayment, isConfirmedPayment } from './utils';

/**
 * Formats a date as relative time (e.g., "15 minutes ago", "2 hours ago").
 */
function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Role-based action panel that shows exactly one clear next step.
 *
 * - Selecting Cash/UPI/Bank Transfer calls onPaidOffline(method) to open RecordPaymentModal with method pre-filled.
 * - Selecting Razorpay calls onPayNow() to immediately start Razorpay flow (one click).
 * - Waiting state shows payment details for reassurance.
 * - Multiple pending payments show individual review cards for receiver.
 *
 * @param {{
 *   settlement: object,
 *   payments: Array,
 *   currentUserId: string,
 *   onPayNow: () => void,
 *   onPaidOffline: (method: string) => void,
 *   onConfirmPayment: (payment: object) => void,
 *   onRejectPayment: (payment: object) => void,
 *   isLoading?: boolean,
 *   className?: string,
 * }} props
 */
const PaymentActionPanel = React.memo(({
  settlement,
  payments = [],
  currentUserId,
  onPayNow,
  onPaidOffline,
  onConfirmPayment,
  onRejectPayment,
  isLoading = false,
  className = '',
}) => {
  const [showMethodPicker, setShowMethodPicker] = useState(false);
  const { locale } = useCurrencyStore();
  const currency = settlement?.currency || 'INR';

  // Derived state
  const { isPayer, isReceiver, isCompleted, pendingPayments, myPendingPayments } = useMemo(() => {
    const isPayer = settlement?.payerId === currentUserId;
    const isReceiver = settlement?.receiverId === currentUserId;

    const totalAmount = Number(settlement?.amount || 0);
    const confirmedTotal = (payments || [])
      .filter((p) => isConfirmedPayment(p))
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const isCompleted = confirmedTotal >= totalAmount && totalAmount > 0;

    const pendingPayments = (payments || []).filter(
      (p) => isPendingPayment(p)
    );
    const myPendingPayments = pendingPayments.filter(
      (p) => p.payerId === currentUserId || p.submittedById === currentUserId
    );

    return { isPayer, isReceiver, isCompleted, pendingPayments, myPendingPayments };
  }, [settlement, payments, currentUserId]);

  // Completed — no actions
  if (isCompleted) return null;

  const handleMethodSelect = (method) => {
    setShowMethodPicker(false);
    if (method === 'razorpay') {
      // Razorpay: immediately start checkout flow — one click
      onPayNow?.();
    } else {
      // Cash/UPI/Bank Transfer: open RecordPaymentModal with method pre-filled
      onPaidOffline?.(method);
    }
  };

  // ─── PAYER view ─────────────────────────────────────────
  if (isPayer) {
    // Payer has pending payments → show waiting state with details
    if (myPendingPayments.length > 0) {
      return (
        <GlassPanel className={`rounded-2xl p-4 space-y-3 ${className}`}>
          {myPendingPayments.map((payment) => (
            <div key={payment.id} className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-400/10 mt-0.5">
                <Clock size={18} className="text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface">Waiting for confirmation</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-on-surface-variant">
                  <span className="font-bold text-on-surface tabular-nums">
                    {formatCurrency(Number(payment.amount || 0), currency, locale)}
                  </span>
                  <PaymentMethodIcon method={payment.method} size={13} showLabel />
                  <span>Submitted {formatRelativeTime(payment.createdAt || payment.submittedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </GlassPanel>
      );
    }

    // Payer can make a payment
    return (
      <GlassPanel className={`rounded-2xl p-4 space-y-3 ${className}`}>
        {/* Pay Now (primary) */}
        <button
          onClick={() => setShowMethodPicker(!showMethodPicker)}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm transition-all disabled:opacity-50 active:scale-[0.98]"
          aria-label="Pay now - choose payment method"
        >
          <CreditCard size={16} />
          Pay Now
        </button>

        {/* Payment method picker */}
        <AnimatePresence>
          {showMethodPicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2 pt-1" role="group" aria-label="Choose payment method">
                {[
                  { key: 'razorpay', label: 'Razorpay', icon: CreditCard, color: 'text-primary' },
                  { key: 'cash', label: 'Cash', icon: Banknote, color: 'text-green-400' },
                  { key: 'upi', label: 'UPI', icon: Smartphone, color: 'text-purple-400' },
                  { key: 'bank_transfer', label: 'Bank Transfer', icon: Building2, color: 'text-blue-400' },
                ].map(({ key, label, icon: Icon, color }) => (
                  <button
                    key={key}
                    onClick={() => handleMethodSelect(key)}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface-container/70 border border-glass-stroke hover:border-primary/30 hover:bg-surface-container text-on-surface text-xs font-medium transition-all disabled:opacity-50"
                    aria-label={`Pay with ${label}`}
                  >
                    <Icon size={14} className={color} />
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* I Paid Offline (secondary) */}
        <button
          onClick={() => onPaidOffline?.('cash')}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-semibold text-sm transition-all disabled:opacity-50 active:scale-[0.98]"
          aria-label="Record an offline payment"
        >
          <Banknote size={16} />
          I Paid Offline
        </button>
      </GlassPanel>
    );
  }

  // ─── RECEIVER view ──────────────────────────────────────
  if (isReceiver) {
    // Receiver has pending payments to review — show individual cards
    if (pendingPayments.length > 0) {
      return (
        <GlassPanel className={`rounded-2xl p-4 space-y-3 ${className}`}>
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Bell size={13} className="text-primary" />
            </div>
            <p className="text-sm font-semibold text-on-surface">
              {pendingPayments.length === 1
                ? 'Review Payment'
                : `Review ${pendingPayments.length} Payments`
              }
            </p>
          </div>

          {/* Individual payment review cards */}
          {pendingPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-surface-container/50 rounded-xl p-3 space-y-2.5 border border-glass-stroke/50"
            >
              {/* Payment info */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-on-surface tabular-nums">
                      {formatCurrency(Number(payment.amount || 0), currency, locale)}
                    </span>
                    <PaymentMethodIcon method={payment.method} size={13} showLabel />
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Submitted {formatRelativeTime(payment.createdAt || payment.submittedAt)}
                  </p>
                  {payment.notes && (
                    <p className="text-[11px] text-on-surface-variant mt-1 italic truncate">
                      "{payment.notes}"
                    </p>
                  )}
                </div>
                {/* Proof thumbnail */}
                {payment.proofUrl && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container-high border border-glass-stroke shrink-0">
                    <img
                      src={payment.proofUrl}
                      alt="Payment proof"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Confirm + Reject buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onConfirmPayment?.(payment)}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 font-semibold text-xs transition-all disabled:opacity-50 active:scale-[0.98]"
                  aria-label={`Confirm payment of ${formatCurrency(Number(payment.amount || 0), currency, locale)}`}
                >
                  <CheckCircle2 size={13} />
                  Confirm
                </button>
                <button
                  onClick={() => onRejectPayment?.(payment)}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-error/10 hover:bg-error/20 border border-error/20 text-error font-semibold text-xs transition-all disabled:opacity-50 active:scale-[0.98]"
                  aria-label={`Reject payment of ${formatCurrency(Number(payment.amount || 0), currency, locale)}`}
                >
                  <XCircle size={13} />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </GlassPanel>
      );
    }

    // Receiver — no pending payments, waiting
    return (
      <GlassPanel className={`rounded-2xl p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-on-surface-variant/10">
            <Clock size={18} className="text-on-surface-variant" />
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">Waiting for payment</p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              The payer hasn't submitted a payment yet.
            </p>
          </div>
        </div>
      </GlassPanel>
    );
  }

  return null;
});

PaymentActionPanel.displayName = 'PaymentActionPanel';

export default PaymentActionPanel;
