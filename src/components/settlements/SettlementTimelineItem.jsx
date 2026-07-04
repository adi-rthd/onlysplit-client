import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CircleDot, CheckCircle2, XCircle, Ban, CreditCard,
  Paperclip, Sparkles, ChevronDown, ChevronUp, FileText,
} from 'lucide-react';
import PaymentStatusBadge from './PaymentStatusBadge';
import PaymentMethodIcon from './PaymentMethodIcon';

/**
 * Timeline event types and their visual config.
 */
const EVENT_ICON_CONFIG = {
  settlement_created: { icon: CircleDot, color: 'text-primary', bg: 'bg-primary/10' },
  settlement_completed: { icon: Sparkles, color: 'text-green-400', bg: 'bg-green-400/15' },
  payment_submitted: { icon: CreditCard, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  payment_confirmed: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
  payment_rejected: { icon: XCircle, color: 'text-error', bg: 'bg-error/10' },
  payment_cancelled: { icon: Ban, color: 'text-on-surface-variant', bg: 'bg-on-surface-variant/10' },
  proof_uploaded: { icon: Paperclip, color: 'text-blue-400', bg: 'bg-blue-400/10' },
};

/**
 * A single timeline item in the unified settlement timeline.
 * Supports expandable details (notes, proof, rejection reason).
 * Expand/collapse state is independent per item — expanding one does not collapse others.
 *
 * @param {{
 *   event: object,
 *   isLast?: boolean,
 *   index?: number,
 *   showTimestamp?: boolean,
 *   onProofClick?: (url: string) => void,
 * }} props
 */
const SettlementTimelineItem = React.memo(({ event, isLast = false, index = 0, showTimestamp = true, onProofClick }) => {
  const [expanded, setExpanded] = useState(false);

  const iconConfig = EVENT_ICON_CONFIG[event.type] || EVENT_ICON_CONFIG.payment_submitted;
  const Icon = iconConfig.icon;
  const isCompletedEvent = event.type === 'settlement_completed';

  const hasDetails = !!(event.notes || event.proofUrl || event.rejectionReason);

  return (
    <motion.div
      className="relative flex gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: Math.min(index * 0.04, 0.4) }}
    >
      {/* Timeline rail */}
      <div className="flex flex-col items-center">
        {/* Icon node */}
        <div
          className={`flex shrink-0 items-center justify-center rounded-full ${iconConfig.bg} ${
            isCompletedEvent ? 'h-10 w-10 ring-2 ring-green-400/30' : 'h-8 w-8'
          }`}
        >
          <Icon size={isCompletedEvent ? 18 : 14} className={iconConfig.color} />
        </div>
        {/* Connecting line */}
        {!isLast && (
          <div className="w-px flex-1 bg-glass-stroke/50 mt-1" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 min-w-0 ${isLast ? 'pb-1' : 'pb-5'}`}>
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-semibold leading-tight ${
                isCompletedEvent ? 'text-green-400' : 'text-on-surface'
              }`}
            >
              {event.title}
            </p>
            {event.subtitle && (
              <p className={`text-[11px] mt-0.5 ${
                isCompletedEvent ? 'text-green-400/70' : 'text-on-surface-variant'
              }`}>
                {event.subtitle}
              </p>
            )}
          </div>

          {/* Status badge for payment events */}
          {event.status && (
            <PaymentStatusBadge status={event.status} size="sm" />
          )}
        </div>

        {/* Meta row: amount, method, time */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
          {event.amount != null && (
            <span className="text-xs font-bold text-on-surface tabular-nums">
              {event.currency
                ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: event.currency, maximumFractionDigits: 2 }).format(event.amount)
                : `₹${Number(event.amount).toFixed(2)}`
              }
            </span>
          )}
          {event.method && (
            <PaymentMethodIcon method={event.method} size={12} showLabel />
          )}
          {showTimestamp && event.formattedTime && (
            <span className="text-[11px] text-on-surface-variant">
              {event.formattedTime}
            </span>
          )}
        </div>

        {/* Expandable details */}
        {hasDetails && (
          <div className="mt-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[11px] text-on-surface-variant hover:text-on-surface transition-colors"
              aria-expanded={expanded}
              aria-label={expanded ? 'Hide details' : 'Show details'}
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? 'Hide details' : 'Show details'}
            </button>

            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="mt-2 space-y-2"
              >
                {/* Notes */}
                {event.notes && (
                  <div className="bg-surface-container/50 rounded-lg p-2.5 border border-glass-stroke/30">
                    <p className="text-[11px] text-on-surface-variant italic">
                      "{event.notes}"
                    </p>
                  </div>
                )}

                {/* Rejection reason */}
                {event.rejectionReason && (
                  <div className="bg-error/5 rounded-lg p-2.5 border border-error/10">
                    <p className="text-[11px] font-medium text-error">
                      Reason: {event.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Proof preview — click opens fullscreen preview */}
                {event.proofUrl && (
                  <button
                    onClick={() => onProofClick?.(event.proofUrl)}
                    className="w-20 h-20 rounded-lg overflow-hidden bg-surface-container-high border border-glass-stroke hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer"
                    aria-label="View payment proof"
                  >
                    {event.proofUrl.toLowerCase().endsWith('.pdf') ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText size={24} className="text-on-surface-variant" />
                      </div>
                    ) : (
                      <img
                        src={event.proofUrl}
                        alt="Payment proof"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

SettlementTimelineItem.displayName = 'SettlementTimelineItem';

export default SettlementTimelineItem;
