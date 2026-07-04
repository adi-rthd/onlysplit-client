import React from 'react';
import { CheckCircle2, Clock, XCircle, Ban } from 'lucide-react';
import { normalizePaymentStatus } from './utils';

/**
 * User-friendly labels for settlement/payment statuses.
 * Underlying enum values remain unchanged — only display labels differ.
 */
const STATUS_CONFIG = {
  pending: {
    label: 'Waiting for payment',
    icon: Clock,
    className: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle2,
    className: 'bg-green-400/10 text-green-400 border-green-400/20',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-error/10 text-error border-error/20',
  },
  cancelled: {
    label: 'Cancelled',
    icon: Ban,
    className: 'bg-on-surface-variant/10 text-on-surface-variant border-on-surface-variant/20',
  },
  completed: {
    label: 'Settled',
    icon: CheckCircle2,
    className: 'bg-green-400/10 text-green-400 border-green-400/20',
  },
  'partially-paid': {
    label: 'Partially Paid',
    icon: Clock,
    className: 'bg-primary/10 text-primary border-primary/20',
  },
};

/**
 * Renders a status badge with icon and user-friendly label.
 * @param {{ status: string, size?: 'sm' | 'md', className?: string }} props
 */
const PaymentStatusBadge = React.memo(({ status, size = 'sm', className = '' }) => {
  const normalizedStatus = normalizePaymentStatus(status);
  const config = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  const sizeClasses = size === 'md'
    ? 'px-2.5 py-1.5 text-xs gap-1.5'
    : 'px-2 py-1 text-[10px] gap-1';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-lg border ${sizeClasses} ${config.className} ${className}`}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      <Icon size={size === 'md' ? 14 : 12} />
      {config.label}
    </span>
  );
});

PaymentStatusBadge.displayName = 'PaymentStatusBadge';

export default PaymentStatusBadge;
