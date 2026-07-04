import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Banknote, Smartphone, Building2, Zap } from 'lucide-react';
import ProofUploader from './ProofUploader';
import ConfirmDialog from './ConfirmDialog';
import { formatCurrency } from '../../services/currencyService';
import useCurrencyStore from '../../store/useCurrencyStore';

const PAYMENT_METHODS = [
  { key: 'cash', label: 'Cash', icon: Banknote, color: 'text-green-400' },
  { key: 'upi', label: 'UPI', icon: Smartphone, color: 'text-purple-400' },
  { key: 'bank_transfer', label: 'Bank Transfer', icon: Building2, color: 'text-blue-400' },
];

/**
 * Record Payment Modal.
 *
 * Features:
 * - "Pay Full Amount" shortcut
 * - Overpayment prevention
 * - Method pre-selection (from Pay Now picker)
 * - Drag & drop proof upload
 * - Validation with inline errors
 * - Preserves form data on API failure
 * - Unsaved changes protection on close
 * - Keyboard: Esc=close, Enter=submit (when valid)
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onSubmit: (data: object) => void,
 *   remainingAmount: number,
 *   currency?: string,
 *   preSelectedMethod?: string,
 *   isSubmitting?: boolean,
 *   submitError?: string,
 * }} props
 */
const RecordPaymentModal = ({
  isOpen,
  onClose,
  onSubmit,
  remainingAmount = 0,
  currency = 'INR',
  preSelectedMethod = '',
  isSubmitting = false,
  submitError = '',
}) => {
  const { locale } = useCurrencyStore();
  const firstInputRef = useRef(null);

  // Form state
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(preSelectedMethod || '');
  const [transactionReference, setTransactionReference] = useState('');
  const [notes, setNotes] = useState('');
  const [proof, setProof] = useState(null);
  const [errors, setErrors] = useState({});

  // Unsaved changes protection
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const hasUnsavedChanges = !!(amount || (method && method !== preSelectedMethod) || transactionReference || notes || proof);

  // Pre-fill method
  useEffect(() => {
    if (preSelectedMethod) setMethod(preSelectedMethod);
  }, [preSelectedMethod]);

  // Focus first input on open
  useEffect(() => {
    if (isOpen) setTimeout(() => firstInputRef.current?.focus(), 100);
  }, [isOpen]);

  // Keyboard shortcuts
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

  // Reset form on successful close
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setAmount('');
        setMethod(preSelectedMethod || '');
        setTransactionReference('');
        setNotes('');
        setProof(null);
        setErrors({});
        setShowDiscardDialog(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, preSelectedMethod]);

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges && !isSubmitting) {
      setShowDiscardDialog(true);
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, isSubmitting, onClose]);

  const handleConfirmDiscard = () => {
    setShowDiscardDialog(false);
    onClose();
  };

  // Pay Full Amount shortcut
  const handlePayFullAmount = () => {
    setAmount(remainingAmount.toFixed(2));
    setErrors((prev) => ({ ...prev, amount: undefined }));
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    const numAmount = parseFloat(amount);

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Enter a valid amount greater than zero.';
    } else if (numAmount > remainingAmount) {
      newErrors.amount = `Amount cannot exceed ${formatCurrency(remainingAmount, currency, locale)}.`;
    }

    if (!method) {
      newErrors.method = 'Select a payment method.';
    }

    if (transactionReference && transactionReference.length > 100) {
      newErrors.transactionReference = 'Reference must be 100 characters or less.';
    }

    if (notes && notes.length > 500) {
      newErrors.notes = 'Notes must be 500 characters or less.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    onSubmit({
      amount: parseFloat(amount),
      method,
      transactionReference: transactionReference.trim() || undefined,
      notes: notes.trim() || undefined,
      proof: proof || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[90] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-payment-title"
      >
        <motion.div
          className="w-full max-w-md bg-surface-container rounded-t-3xl md:rounded-3xl max-h-[90vh] overflow-y-auto"
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-surface-container z-10 px-5 pt-5 pb-3 border-b border-glass-stroke/30">
            <div className="flex items-center justify-between">
              <h2 id="record-payment-title" className="text-lg font-bold text-on-surface">
                Record Payment
              </h2>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-50"
                aria-label="Close modal"
              >
                <X size={16} className="text-on-surface-variant" />
              </button>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Remaining: <span className="font-bold text-on-surface">{formatCurrency(remainingAmount, currency, locale)}</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Amount + Pay Full Amount */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium" htmlFor="payment-amount">
                Amount *
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  ref={firstInputRef}
                  id="payment-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={remainingAmount}
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setErrors((prev) => ({ ...prev, amount: undefined }));
                  }}
                  placeholder="0.00"
                  className="flex-1 px-3 py-2.5 rounded-xl bg-surface-container-high border border-glass-stroke text-on-surface text-sm font-medium placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all tabular-nums"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.amount}
                  aria-describedby={errors.amount ? 'amount-error' : undefined}
                />
                <button
                  type="button"
                  onClick={handlePayFullAmount}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-all disabled:opacity-50 shrink-0"
                  aria-label="Pay full remaining amount"
                >
                  <Zap size={12} />
                  Full Amount
                </button>
              </div>
              {errors.amount && (
                <p id="amount-error" className="mt-1 text-[11px] text-error font-medium" role="alert">{errors.amount}</p>
              )}
            </div>

            {/* Payment method */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">Method *</label>
              <div className="mt-1.5 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Payment method">
                {PAYMENT_METHODS.map(({ key, label, icon: Icon, color }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setMethod(key); setErrors((prev) => ({ ...prev, method: undefined })); }}
                    disabled={isSubmitting}
                    className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-xs font-medium transition-all ${
                      method === key
                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30'
                        : 'border-glass-stroke bg-surface-container-high text-on-surface-variant hover:border-primary/20'
                    } disabled:opacity-50`}
                    role="radio"
                    aria-checked={method === key}
                  >
                    <Icon size={16} className={method === key ? 'text-primary' : color} />
                    {label}
                  </button>
                ))}
              </div>
              {errors.method && (
                <p className="mt-1 text-[11px] text-error font-medium" role="alert">{errors.method}</p>
              )}
            </div>

            {/* Transaction Reference */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium" htmlFor="payment-ref">
                Transaction Reference
              </label>
              <input
                id="payment-ref"
                type="text"
                maxLength={100}
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                placeholder="UPI ID, transaction number, etc."
                className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-surface-container-high border border-glass-stroke text-on-surface text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                disabled={isSubmitting}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium" htmlFor="payment-notes">
                Notes
              </label>
              <textarea
                id="payment-notes"
                maxLength={500}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional note..."
                rows={2}
                className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-surface-container-high border border-glass-stroke text-on-surface text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none"
                disabled={isSubmitting}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <div className="flex justify-end mt-0.5">
                <span className="text-[10px] text-on-surface-variant/60">{notes.length}/500</span>
              </div>
            </div>

            {/* Proof uploader */}
            <ProofUploader value={proof} onChange={setProof} readOnly={isSubmitting} />

            {/* Submit error */}
            {submitError && (
              <div className="bg-error/5 rounded-xl p-3 border border-error/10">
                <p className="text-xs text-error font-medium">{submitError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <><Banknote size={16} /> Submit Payment</>
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>

      {/* Unsaved changes confirmation */}
      <ConfirmDialog
        isOpen={showDiscardDialog}
        onClose={() => setShowDiscardDialog(false)}
        onConfirm={handleConfirmDiscard}
        title="Discard changes?"
        description="You have unsaved changes. Are you sure you want to close without saving?"
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        variant="danger"
      />
    </>
  );
};

export default RecordPaymentModal;
