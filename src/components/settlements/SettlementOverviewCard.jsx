import React, { useMemo } from 'react';
import { GlassPanel } from '../ui/GlassCard';
import SettlementProgress from './SettlementProgress';
import PaymentStatusBadge from './PaymentStatusBadge';
import { formatCurrency } from '../../services/currencyService';
import useCurrencyStore from '../../store/useCurrencyStore';
import { CheckCircle2 } from 'lucide-react';
import { isConfirmedPayment } from './utils';

/**
 * Premium settlement overview card.
 * All summary data is derived client-side from settlement + payments.
 * Memoized — only re-renders when settlement or payments data changes.
 *
 * Mobile: designed to be used as a sticky card (parent handles sticky positioning).
 *
 * @param {{
 *   settlement: object,
 *   payments: Array,
 *   currentUserId: string,
 *   className?: string,
 * }} props
 */
const SettlementOverviewCard = React.memo(({ settlement, payments = [], currentUserId, className = '' }) => {
  const { locale } = useCurrencyStore();
  const currency = settlement?.currency || 'INR';

  // Derive summary data (memoized)
  const summary = useMemo(() => {
    const totalAmount = Number(settlement?.amount || 0);
    const confirmedPayments = (payments || []).filter(
      (p) => isConfirmedPayment(p)
    );
    const paidAmount = confirmedPayments.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );
    const remainingAmount = Math.max(0, totalAmount - paidAmount);
    const progressPercent = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

    let status = 'pending';
    if (paidAmount >= totalAmount && totalAmount > 0) {
      status = 'completed';
    } else if (paidAmount > 0) {
      status = 'partially-paid';
    }

    return { totalAmount, paidAmount, remainingAmount, progressPercent, status };
  }, [settlement, payments]);

  // Role detection
  const isPayer = settlement?.payerId === currentUserId;

  return (
    <GlassPanel className={`rounded-2xl p-5 space-y-4 bg-surface-container-high ${className}`}>
      {/* Header: Status + Role badge */}
      <div className="flex items-center justify-between">
        <PaymentStatusBadge status={summary.status} size="md" />
        <span
          className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
            isPayer
              ? 'bg-error/10 text-error'
              : 'bg-green-400/10 text-green-400'
          }`}
          aria-label={isPayer ? 'You owe this amount' : 'They owe you this amount'}
        >
          {isPayer ? 'You owe' : 'They owe you'}
        </span>
      </div>

      {/* Amount section */}
      <div className="space-y-3">
        {/* Total amount (hero) */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
            Total Amount
          </p>
          <h2 className="mt-1 text-2xl md:text-3xl font-bold text-on-surface tabular-nums">
            {formatCurrency(summary.totalAmount, currency, locale)}
          </h2>
        </div>

        {/* Paid + Remaining row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-container-high rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
              Paid
            </p>
            <p className="mt-0.5 text-sm font-bold text-green-400 tabular-nums">
              {formatCurrency(summary.paidAmount, currency, locale)}
            </p>
          </div>
          <div className="bg-surface-container-high rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
              Remaining
            </p>
            <p className={`mt-0.5 text-sm font-bold tabular-nums ${
              summary.remainingAmount > 0 ? 'text-error' : 'text-green-400'
            }`}>
              {summary.remainingAmount === 0
                ? 'Nothing left to pay'
                : formatCurrency(summary.remainingAmount, currency, locale)
              }
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar with values */}
      <SettlementProgress
        percent={summary.progressPercent}
        paidAmount={summary.paidAmount}
        totalAmount={summary.totalAmount}
        currency={currency}
        locale={locale}
      />

      {/* Completion indicator */}
      {summary.status === 'completed' && (
        <div className="flex items-center gap-2 text-green-400 pt-1">
          <CheckCircle2 size={16} />
          <span className="text-xs font-semibold">Settlement Complete</span>
        </div>
      )}
    </GlassPanel>
  );
});

SettlementOverviewCard.displayName = 'SettlementOverviewCard';

export default SettlementOverviewCard;
