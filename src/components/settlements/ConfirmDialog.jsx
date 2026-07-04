import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

/**
 * Reusable confirmation dialog.
 * Used for confirm payment, cancel payment, and other destructive actions.
 *
 * Features:
 * - Focus trap + Escape to close
 * - Confirm + Cancel buttons with loading state
 * - Supports custom title, description, and button labels
 * - Renders as a centered modal on desktop, bottom sheet on mobile
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onConfirm: () => void,
 *   title: string,
 *   description?: string,
 *   confirmLabel?: string,
 *   cancelLabel?: string,
 *   variant?: 'default' | 'danger',
 *   isLoading?: boolean,
 *   error?: string,
 * }} props
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Go Back',
  variant = 'default',
  isLoading = false,
  error = '',
}) => {
  const cancelRef = useRef(null);

  // Focus cancel button on open + escape key
  useEffect(() => {
    if (!isOpen) return;

    setTimeout(() => cancelRef.current?.focus(), 100);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const confirmBtnClass = variant === 'danger'
    ? 'bg-error hover:bg-error/90 text-white'
    : 'bg-green-500 hover:bg-green-600 text-white';

  return (
    <motion.div
      className="fixed inset-0 z-[95] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <motion.div
        className="w-full max-w-sm bg-surface-container rounded-t-3xl md:rounded-3xl p-6"
        initial={{ y: 30, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {/* Icon */}
        {variant === 'danger' && (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-error/10 mb-4">
            <AlertTriangle size={20} className="text-error" />
          </div>
        )}

        {/* Title */}
        <h3 id="confirm-dialog-title" className="text-base font-bold text-on-surface">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p id="confirm-dialog-desc" className="mt-2 text-sm text-on-surface-variant leading-relaxed">
            {description}
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="mt-3 bg-error/5 rounded-lg p-2.5 border border-error/10">
            <p className="text-xs text-error font-medium">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex gap-3">
          <button
            ref={cancelRef}
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-surface-container-high border border-glass-stroke text-on-surface text-sm font-medium hover:bg-white/5 transition-all disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2 ${confirmBtnClass}`}
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmDialog;
