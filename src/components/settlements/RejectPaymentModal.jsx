import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, XCircle } from 'lucide-react';
import { formatCurrency } from '../../services/currencyService';
import useCurrencyStore from '../../store/useCurrencyStore';
import PaymentMethodIcon from './PaymentMethodIcon';
import ConfirmDialog from './ConfirmDialog';

/**
 * Reject Payment Modal.
 * Requires a reason (1–500 characters).
 *
 * Features:
 * - Shows payment context (amount, method)
 * - Unsaved changes protection
 * - Ctrl/Cmd + Enter to submit
 * - Escape to close
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onSubmit: (reason: string) => void,
 *   payment: object | null,
 *   currency?: string,
 *   isSubmitting?: boolean,
 *   submitError?: string,
 * }} props
 */
const RejectPaymentModal = ({
  isOpen,
  onClose,
  onSubmit,
  payment = null,
  currency = 'INR',
  isSubmitting = false,
  submitError = '',
}) => {
  const { locale } = useCurrencyStore();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const textareaRef = useRef(null);

  const hasUnsavedChanges = reason.trim().length > 0;

  // Focus on open
  useEffect(() => {
    if (isOpen) setTimeout(() => textareaRef.current?.focus(), 100);
  }, [isOpen]);

  // Keyboard
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        e.preventDefault();
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, isSubmitting, hasUnsavedChanges]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => { setReason(''); setError(''); setShowDiscardDialog(false); }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges && !isSubmitting) {
      setShowDiscardDialog(true);
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, isSubmitting, onClose]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) { setError('A rejection reason is required.'); return; }
    if (trimmed.length > 500) { setError('Reason must be 500 characters or less.'); return; }
    setError('');
    onSubmit(trimmed);
  };

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[95] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-payment-title"
      >
        <motion.div
          className="w-full max-w-sm bg-surface-container rounded-t-3xl md:rounded-3xl"
          initial={{ y: 40, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-3 border-b border-glass-stroke/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-error/10">
                  <XCircle size={16} className="text-error" />
                </div>
                <h2 id="reject-payment-title" className="text-base font-bold text-on-surface">Reject Payment</h2>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-50"
                aria-label="Close"
              >
                <X size={14} className="text-on-surface-variant" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Payment context */}
            {payment && (
              <div className="bg-surface-container-high/50 rounded-xl p-3 border border-glass-stroke/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-on-surface tabular-nums">
                    {formatCurrency(Number(payment.amount || 0), currency, locale)}
                  </span>
                  <PaymentMethodIcon method={payment.method} size={14} showLabel />
                </div>
                {payment.notes && (
                  <p className="text-[11px] text-on-surface-variant mt-1.5 italic truncate">"{payment.notes}"</p>
                )}
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium" htmlFor="reject-reason">
                Reason *
              </label>
              <textarea
                ref={textareaRef}
                id="reject-reason"
                value={reason}
                onChange={(e) => { setReason(e.target.value); setError(''); }}
                placeholder="Why are you rejecting this payment?"
                rows={3}
                maxLength={500}
                className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-surface-container-high border border-glass-stroke text-on-surface text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-error/30 transition-all resize-none"
                disabled={isSubmitting}
                aria-required="true"
                aria-invalid={!!error}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <div className="flex items-center justify-between mt-0.5">
                {error && <p className="text-[11px] text-error font-medium" role="alert">{error}</p>}
                <span className="text-[10px] text-on-surface-variant/60 ml-auto">{reason.length}/500</span>
              </div>
            </div>

            {submitError && (
              <div className="bg-error/5 rounded-xl p-3 border border-error/10">
                <p className="text-xs text-error font-medium">{submitError}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-surface-container-high border border-glass-stroke text-on-surface text-sm font-medium hover:bg-white/5 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !reason.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-error hover:bg-error/90 text-white text-sm font-semibold transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <><XCircle size={14} /> Reject</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>

      <ConfirmDialog
        isOpen={showDiscardDialog}
        onClose={() => setShowDiscardDialog(false)}
        onConfirm={() => { setShowDiscardDialog(false); onClose(); }}
        title="Discard changes?"
        description="You have unsaved changes. Are you sure you want to close without saving?"
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        variant="danger"
      />
    </>
  );
};

export default RejectPaymentModal;
