import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

import SettlementOverviewCard from './SettlementOverviewCard';
import PaymentActionPanel from './PaymentActionPanel';
import SettlementTimeline from './SettlementTimeline';
import RecordPaymentModal from './RecordPaymentModal';
import RejectPaymentModal from './RejectPaymentModal';
import ConfirmDialog from './ConfirmDialog';
import SettlementCelebration from './SettlementCelebration';
import { isConfirmedPayment } from './utils';

import { useSettlementPayments } from '../../queries/hooks/useSettlementPayments';
import { useRecordSettlementPayment } from '../../queries/mutations/useRecordSettlementPayment';
import { useConfirmSettlementPayment } from '../../queries/mutations/useConfirmSettlementPayment';
import { useRejectSettlementPayment } from '../../queries/mutations/useRejectSettlementPayment';
import { useCancelSettlementPayment } from '../../queries/mutations/useCancelSettlementPayment';
import { useUploadSettlementProof } from '../../queries/mutations/useUploadSettlementProof';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../services/currencyService';
import useCurrencyStore from '../../store/useCurrencyStore';

/**
 * Settlement Detail Panel — the main orchestrator.
 *
 * Rendered as:
 * - Desktop (≥1024px): Slide-in side panel from the right (~480px wide)
 * - Mobile (<1024px): Full-screen bottom sheet
 *
 * Integrates all settlement payment sub-components.
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   settlement: object,
 *   groupId?: string,
 * }} props
 */
const SettlementDetailPanel = ({ isOpen, onClose, settlement, groupId }) => {
  const { user } = useAuthStore();
  const { locale } = useCurrencyStore();
  const currentUserId = user?.id;
  const settlementId = settlement?.id;
  const currency = settlement?.currency || 'INR';

  // ─── Data Layer ─────────────────────────────────────────────────────
  const paymentsQuery = useSettlementPayments(settlementId);
  const payments = paymentsQuery.data || [];

  const recordMutation = useRecordSettlementPayment(settlementId, { groupId });
  const confirmMutation = useConfirmSettlementPayment(settlementId, { groupId });
  const rejectMutation = useRejectSettlementPayment(settlementId);
  const cancelMutation = useCancelSettlementPayment(settlementId);
  const uploadProofMutation = useUploadSettlementProof(settlementId);

  // ─── Derived State ──────────────────────────────────────────────────
  const { remainingAmount, isCompleted, wasCompleted } = useMemo(() => {
    const totalAmount = Number(settlement?.amount || 0);
    const confirmedTotal = (payments || [])
      .filter((p) => isConfirmedPayment(p))
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const remainingAmount = Math.max(0, totalAmount - confirmedTotal);
    const isCompleted = confirmedTotal >= totalAmount && totalAmount > 0;
    return { remainingAmount, isCompleted };
  }, [settlement, payments]);

  // Track completion for celebration
  const prevCompletedRef = useRef(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (isCompleted && !prevCompletedRef.current) {
      setShowCelebration(true);
    }
    prevCompletedRef.current = isCompleted;
  }, [isCompleted]);

  // ─── Modal State ────────────────────────────────────────────────────
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [recordModalMethod, setRecordModalMethod] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectPayment, setRejectPayment] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmPayment, setConfirmPayment] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelPayment, setCancelPayment] = useState(null);

  // Error state for dialogs
  const [confirmError, setConfirmError] = useState('');
  const [cancelError, setCancelError] = useState('');

  // Focus return ref
  const focusReturnRef = useRef(null);

  // ─── Escape to close panel ──────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      // Only close panel if no modals are open
      if (e.key === 'Escape' && !recordModalOpen && !rejectModalOpen && !confirmDialogOpen && !cancelDialogOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, recordModalOpen, rejectModalOpen, confirmDialogOpen, cancelDialogOpen, onClose]);

  // ─── Handlers ───────────────────────────────────────────────────────

  // Pay Now (Razorpay)
  const handlePayNow = useCallback(() => {
    // TODO: Integrate existing Razorpay flow from paymentService
    console.log('[SettlementDetailPanel] Razorpay flow — to be integrated');
  }, []);

  // I Paid Offline / method selection → open RecordPaymentModal
  const handlePaidOffline = useCallback((method) => {
    setRecordModalMethod(method || 'cash');
    setRecordModalOpen(true);
  }, []);

  // Submit record payment
  const handleRecordSubmit = useCallback((data) => {
    const { proof, ...payload } = data;

    recordMutation.mutate(payload, {
      onSuccess: async (response) => {
        // Upload proof if provided
        if (proof && response?.id) {
          uploadProofMutation.mutate({ paymentId: response.id, file: proof });
        }
        setRecordModalOpen(false);
      },
    });
  }, [recordMutation, uploadProofMutation]);

  // Confirm payment
  const handleConfirmPayment = useCallback((payment) => {
    setConfirmPayment(payment);
    setConfirmError('');
    setConfirmDialogOpen(true);
  }, []);

  const handleConfirmSubmit = useCallback(() => {
    if (!confirmPayment?.id) return;
    confirmMutation.mutate(confirmPayment.id, {
      onSuccess: () => {
        setConfirmDialogOpen(false);
        setConfirmPayment(null);
      },
      onError: (err) => {
        setConfirmError(err.message || 'Failed to confirm payment.');
      },
    });
  }, [confirmPayment, confirmMutation]);

  // Reject payment
  const handleRejectPayment = useCallback((payment) => {
    setRejectPayment(payment);
    setRejectModalOpen(true);
  }, []);

  const handleRejectSubmit = useCallback((reason) => {
    if (!rejectPayment?.id) return;
    rejectMutation.mutate(
      { paymentId: rejectPayment.id, reason },
      {
        onSuccess: () => {
          setRejectModalOpen(false);
          setRejectPayment(null);
        },
      }
    );
  }, [rejectPayment, rejectMutation]);

  // Cancel payment
  const handleCancelPayment = useCallback((payment) => {
    setCancelPayment(payment);
    setCancelError('');
    setCancelDialogOpen(true);
  }, []);

  const handleCancelSubmit = useCallback(() => {
    if (!cancelPayment?.id) return;
    cancelMutation.mutate(cancelPayment.id, {
      onSuccess: () => {
        setCancelDialogOpen(false);
        setCancelPayment(null);
      },
      onError: (err) => {
        setCancelError(err.message || 'Failed to cancel payment.');
      },
    });
  }, [cancelPayment, cancelMutation]);

  // Any mutation loading
  const isMutating = recordMutation.isPending || confirmMutation.isPending || rejectMutation.isPending || cancelMutation.isPending;

  // ─── Render ─────────────────────────────────────────────────────────

  if (!isOpen || !settlement) return null;

  return (
    <>
      {/* Celebration — fixed overlay, renders on top of everything */}
      <SettlementCelebration show={showCelebration} />

      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — Modal popup style (centered on desktop, full-screen on mobile) */}
      <motion.aside
        className="fixed z-[75] overflow-hidden flex flex-col rounded-none
          inset-0 md:inset-auto md:top-[5%] md:left-1/2 md:-translate-x-1/2 md:w-[520px] md:max-w-[92vw] md:max-h-[90vh] md:rounded-3xl md:border md:border-glass-stroke md:shadow-2xl"
        style={{ background: '#111111' }}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        role="dialog"
        aria-modal="true"
        aria-label={`Settlement details: ${settlement.payerName || 'Payer'} → ${settlement.receiverName || 'Receiver'}`}
      >
        {/* Header */}
        <div className="shrink-0 px-5 pt-5 pb-3 border-b border-glass-stroke/30 flex items-center justify-between bg-surface-charcoal">
          <h2 className="text-base font-bold text-on-surface">Settlement Details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="Close settlement details"
          >
            <X size={16} className="text-on-surface-variant" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain hide-scrollbar">
          <div className="p-5 space-y-5">
            {/* Overview Card */}
            <div>
              <SettlementOverviewCard
                settlement={settlement}
                payments={payments}
                currentUserId={currentUserId}
              />
            </div>

            {/* Action Panel */}
            <PaymentActionPanel
              settlement={settlement}
              payments={payments}
              currentUserId={currentUserId}
              onPayNow={handlePayNow}
              onPaidOffline={handlePaidOffline}
              onConfirmPayment={handleConfirmPayment}
              onRejectPayment={handleRejectPayment}
              isLoading={isMutating}
            />

            {/* Timeline */}
            <SettlementTimeline
              settlement={settlement}
              payments={payments}
              currentUserId={currentUserId}
              isLoading={paymentsQuery.isLoading}
              error={paymentsQuery.error}
              onRetry={() => paymentsQuery.refetch()}
              onRecordPayment={() => handlePaidOffline('cash')}
            />
          </div>
        </div>
      </motion.aside>

      {/* ─── Modals ─────────────────────────────────────────────── */}

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={recordModalOpen}
        onClose={() => setRecordModalOpen(false)}
        onSubmit={handleRecordSubmit}
        remainingAmount={remainingAmount}
        currency={currency}
        preSelectedMethod={recordModalMethod}
        isSubmitting={recordMutation.isPending}
        submitError={recordMutation.error?.message || ''}
      />

      {/* Confirm Payment Dialog */}
      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => { setConfirmDialogOpen(false); setConfirmPayment(null); }}
        onConfirm={handleConfirmSubmit}
        title="Confirm Payment"
        description={confirmPayment ? `Confirm receipt of ${formatCurrency(Number(confirmPayment.amount || 0), currency, locale)} via ${(confirmPayment.method || 'unknown').replace('_', ' ')}?` : ''}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        variant="default"
        isLoading={confirmMutation.isPending}
        error={confirmError}
      />

      {/* Reject Payment Modal */}
      <RejectPaymentModal
        isOpen={rejectModalOpen}
        onClose={() => { setRejectModalOpen(false); setRejectPayment(null); }}
        onSubmit={handleRejectSubmit}
        payment={rejectPayment}
        currency={currency}
        isSubmitting={rejectMutation.isPending}
        submitError={rejectMutation.error?.message || ''}
      />

      {/* Cancel Payment Dialog */}
      <ConfirmDialog
        isOpen={cancelDialogOpen}
        onClose={() => { setCancelDialogOpen(false); setCancelPayment(null); }}
        onConfirm={handleCancelSubmit}
        title="Cancel Payment"
        description={cancelPayment ? `Cancel your ${formatCurrency(Number(cancelPayment.amount || 0), currency, locale)} payment via ${(cancelPayment.method || 'unknown').replace('_', ' ')}? This action cannot be undone.` : ''}
        confirmLabel="Confirm Cancel"
        cancelLabel="Go Back"
        variant="danger"
        isLoading={cancelMutation.isPending}
        error={cancelError}
      />
    </>
  );
};

export default SettlementDetailPanel;
