import React, { useMemo, useState } from 'react';
import { GlassPanel } from '../ui/GlassCard';
import SettlementTimelineItem from './SettlementTimelineItem';
import { Clock, Receipt, Filter } from 'lucide-react';
import ProofPreviewModal from './ProofPreviewModal';
import { normalizePaymentStatus, isConfirmedPayment } from './utils';

// ─── Relative time formatting ─────────────────────────────────────────────────

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Date group labels ────────────────────────────────────────────────────────

function getDateGroupLabel(dateStr) {
  if (!dateStr) return 'Unknown';
  const now = new Date();
  const date = new Date(dateStr);

  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Checks if two timestamps are within the same minute (for grouping).
 */
function isSameMinute(ts1, ts2) {
  if (!ts1 || !ts2) return false;
  const d1 = new Date(ts1);
  const d2 = new Date(ts2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate() &&
    d1.getHours() === d2.getHours() &&
    d1.getMinutes() === d2.getMinutes()
  );
}

// ─── Build unified timeline ───────────────────────────────────────────────────

function formatMethodLabel(method) {
  if (!method) return 'Unknown';
  const map = {
    cash: 'Cash',
    upi: 'UPI',
    bank_transfer: 'Bank Transfer',
    banktransfer: 'Bank Transfer',
    razorpay: 'Razorpay',
  };
  return map[(method || '').toLowerCase().replace(/[\s-]/g, '')] || method;
}

function buildUnifiedTimeline(settlement, payments = []) {
  const events = [];

  // Audit: Settlement Created
  if (settlement?.createdAt) {
    events.push({
      id: 'audit-created',
      type: 'settlement_created',
      title: 'Settlement Created',
      subtitle: `${settlement.payerName || 'Payer'} owes ${settlement.receiverName || 'Receiver'}`,
      timestamp: settlement.createdAt,
      amount: Number(settlement.amount || 0),
      currency: settlement.currency,
      category: 'system',
    });
  }

  // Payment events
  (payments || []).forEach((payment) => {
    const status = normalizePaymentStatus(payment.status);
    const curr = payment.currency || settlement?.currency || 'INR';

    // Payment submitted
    events.push({
      id: `payment-${payment.id}`,
      type: 'payment_submitted',
      title: `${payment.payerName || settlement?.payerName || 'Payer'} paid ${
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: curr, maximumFractionDigits: 2 }).format(Number(payment.amount || 0))
      } via ${formatMethodLabel(payment.method)}`,
      subtitle: payment.transactionReference ? `Ref: ${payment.transactionReference}` : undefined,
      timestamp: payment.createdAt || payment.submittedAt,
      amount: Number(payment.amount || 0),
      method: payment.method,
      status,
      notes: payment.notes,
      proofUrl: payment.proofUrl,
      currency: curr,
      paymentId: payment.id,
      category: 'payment',
    });

    // Confirmed
    if (status === 'confirmed' && payment.confirmedAt) {
      events.push({
        id: `confirmed-${payment.id}`,
        type: 'payment_confirmed',
        title: `${settlement?.receiverName || 'Receiver'} confirmed payment`,
        timestamp: payment.confirmedAt,
        amount: Number(payment.amount || 0),
        currency: curr,
        paymentId: payment.id,
        category: 'payment',
      });
    }

    // Rejected
    if (status === 'rejected' && payment.rejectedAt) {
      events.push({
        id: `rejected-${payment.id}`,
        type: 'payment_rejected',
        title: `${settlement?.receiverName || 'Receiver'} rejected payment`,
        timestamp: payment.rejectedAt,
        amount: Number(payment.amount || 0),
        rejectionReason: payment.rejectionReason || payment.reason,
        currency: curr,
        paymentId: payment.id,
        category: 'payment',
      });
    }

    // Cancelled
    if (status === 'cancelled' && payment.cancelledAt) {
      events.push({
        id: `cancelled-${payment.id}`,
        type: 'payment_cancelled',
        title: `${payment.payerName || settlement?.payerName || 'Payer'} cancelled payment`,
        timestamp: payment.cancelledAt,
        amount: Number(payment.amount || 0),
        currency: curr,
        paymentId: payment.id,
        category: 'payment',
      });
    }

    // Proof uploaded
    if (payment.proofUrl && payment.proofUploadedAt) {
      events.push({
        id: `proof-${payment.id}`,
        type: 'proof_uploaded',
        title: 'Screenshot uploaded',
        timestamp: payment.proofUploadedAt,
        proofUrl: payment.proofUrl,
        paymentId: payment.id,
        category: 'system',
      });
    }
  });

  // Audit: Settlement Completed
  const totalAmount = Number(settlement?.amount || 0);
  const confirmedTotal = (payments || [])
    .filter((p) => isConfirmedPayment(p))
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  if (confirmedTotal >= totalAmount && totalAmount > 0 && settlement?.completedAt) {
    events.push({
      id: 'audit-completed',
      type: 'settlement_completed',
      title: 'Settlement Completed',
      subtitle: 'This debt has been fully settled.',
      timestamp: settlement.completedAt,
      category: 'system',
    });
  }

  // Sort reverse chronological
  events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Add formatted time + determine if timestamp should be shown (group same-minute events)
  events.forEach((event, idx) => {
    event.formattedTime = formatRelativeTime(event.timestamp);
    const prev = events[idx - 1];
    event._showTimestamp = !prev || !isSameMinute(event.timestamp, prev.timestamp);
  });

  return events;
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const FILTER_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'payment', label: 'Payments' },
  { key: 'system', label: 'System Events' },
];

/**
 * Unified Settlement Timeline.
 * Merges audit events + payment events into one chronological feed.
 * Supports filtering, date grouping, and fullscreen proof preview.
 *
 * Structure supports future virtualization — events rendered as a flat list
 * with stable keys and no nested scrolling.
 *
 * @param {{
 *   settlement: object,
 *   payments: Array,
 *   currentUserId: string,
 *   isLoading?: boolean,
 *   error?: object,
 *   onRetry?: () => void,
 *   onRecordPayment?: () => void,
 *   className?: string,
 * }} props
 */
const SettlementTimeline = React.memo(({
  settlement,
  payments = [],
  currentUserId,
  isLoading = false,
  error = null,
  onRetry,
  onRecordPayment,
  className = '',
}) => {
  const [filter, setFilter] = useState('all');
  const [proofPreviewUrl, setProofPreviewUrl] = useState(null);

  // Build unified timeline
  const allEvents = useMemo(
    () => buildUnifiedTimeline(settlement, payments),
    [settlement, payments]
  );

  // Apply filter
  const filteredEvents = useMemo(() => {
    if (filter === 'all') return allEvents;
    return allEvents.filter((e) => e.category === filter);
  }, [allEvents, filter]);

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups = [];
    let currentGroup = null;

    filteredEvents.forEach((event) => {
      const label = getDateGroupLabel(event.timestamp);
      if (!currentGroup || currentGroup.label !== label) {
        currentGroup = { label, events: [] };
        groups.push(currentGroup);
      }
      currentGroup.events.push(event);
    });

    return groups;
  }, [filteredEvents]);

  // ─── Loading state ───
  if (isLoading && allEvents.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-surface-container-high shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 bg-surface-container-high rounded w-3/4" />
              <div className="h-2.5 bg-surface-container-high rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─── Error state ───
  if (error) {
    return (
      <GlassPanel className={`rounded-2xl p-6 text-center ${className}`}>
        <p className="text-sm text-error font-medium">
          {error.message || 'Failed to load timeline.'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 px-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
          >
            Retry
          </button>
        )}
      </GlassPanel>
    );
  }

  // ─── Empty state (context-aware) ───
  if (allEvents.length === 0) {
    const isPayer = settlement?.payerId === currentUserId;

    return (
      <GlassPanel className={`rounded-2xl p-8 text-center border border-dashed border-white/10 ${className}`}>
        <Receipt size={32} className="mx-auto mb-3 text-on-surface-variant/50" />
        <h3 className="text-sm font-bold text-on-surface">No payments yet</h3>
        <p className="mt-1.5 text-xs text-on-surface-variant max-w-[240px] mx-auto">
          {isPayer
            ? 'Record your first payment to get started.'
            : 'Waiting for the payer to submit a payment.'
          }
        </p>
        {isPayer && onRecordPayment && (
          <button
            onClick={onRecordPayment}
            className="mt-4 px-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors border border-primary/20"
          >
            Record your first payment
          </button>
        )}
      </GlassPanel>
    );
  }

  // ─── Timeline with filters ───
  return (
    <div className={className}>
      {/* Header + Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-on-surface-variant" />
          <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">
            Timeline
          </h3>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-surface-container/50 rounded-lg p-0.5" role="tablist" aria-label="Filter timeline events">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              role="tab"
              aria-selected={filter === opt.key}
              className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all ${
                filter === opt.key
                  ? 'bg-primary/15 text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped events — virtualization-ready: flat structure with date headers */}
      <div className="relative" role="feed" aria-label="Settlement timeline">
        {groupedEvents.map((group) => (
          <div key={group.label}>
            {/* Date group header */}
            <div className="flex items-center gap-2 mb-3 mt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70">
                {group.label}
              </span>
              <div className="flex-1 h-px bg-glass-stroke/30" />
            </div>

            {/* Events in group */}
            {group.events.map((event, idx) => (
              <SettlementTimelineItem
                key={event.id}
                event={event}
                isLast={idx === group.events.length - 1 && group === groupedEvents[groupedEvents.length - 1]}
                index={idx}
                showTimestamp={event._showTimestamp}
                onProofClick={(url) => setProofPreviewUrl(url)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Fullscreen proof preview modal */}
      {proofPreviewUrl && (
        <ProofPreviewModal
          url={proofPreviewUrl}
          onClose={() => setProofPreviewUrl(null)}
        />
      )}
    </div>
  );
});

SettlementTimeline.displayName = 'SettlementTimeline';

export default SettlementTimeline;
