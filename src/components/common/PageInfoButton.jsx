import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, CheckCircle2, Lightbulb, StickyNote } from 'lucide-react';

/**
 * Page Information Button — ℹ icon that opens a floating panel.
 * Desktop: Popover anchored below the button.
 * Mobile: Bottom sheet.
 *
 * @param {{ guide: object }} props — guide is the pageInfo object (title, description, features, tips, notes)
 */
const PageInfoButton = ({ guide }) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  if (!guide) return null;

  const { title, description, features, tips, notes } = guide;

  return (
    <div className="relative">
      {/* Info Button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="w-9 h-9 md:w-10 md:h-10 rounded-xl glass-button flex items-center justify-center hover:bg-white/5 transition-colors"
        aria-label="Page information"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Info size={18} className={`transition-colors ${open ? 'text-primary' : 'text-on-surface-variant'}`} />
      </button>

      {/* Popover / Bottom Sheet */}
      <AnimatePresence>
        {open && (
          <>
            {/* Desktop: Popover */}
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="hidden md:block absolute right-0 top-12 z-[100] w-[380px] max-h-[70vh] overflow-y-auto rounded-2xl border border-glass-stroke bg-[#111113] shadow-2xl"
              role="dialog"
              aria-label={title}
            >
              <PageInfoContent
                title={title}
                description={description}
                features={features}
                tips={tips}
                notes={notes}
                onClose={() => setOpen(false)}
              />
            </motion.div>

            {/* Mobile: Bottom Sheet */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="md:hidden fixed inset-0 z-[100] bg-black/60 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
            >
              <motion.div
                ref={panelRef}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-3xl border-t border-glass-stroke bg-[#111113]"
                role="dialog"
                aria-label={title}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-on-surface-variant/30" />
                </div>
                <PageInfoContent
                  title={title}
                  description={description}
                  features={features}
                  tips={tips}
                  notes={notes}
                  onClose={() => setOpen(false)}
                />
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Shared content renderer for both popover and bottom sheet.
 */
const PageInfoContent = ({ title, description, features, tips, notes, onClose }) => {
  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-on-surface">{title}</h2>
          {description && (
            <p className="text-xs text-on-surface-variant/80 leading-relaxed mt-1">
              {description}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
          aria-label="Close"
        >
          <X size={14} className="text-on-surface-variant" />
        </button>
      </div>

      {/* Features */}
      {features?.length > 0 && (
        <div>
          <h3 className="text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-wider mb-2">Features</h3>
          <ul className="space-y-1.5">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-on-surface/80">
                <CheckCircle2 size={12} className="text-green-400/80 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tips */}
      {tips?.length > 0 && (
        <div>
          <h3 className="text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-wider mb-2">Tips</h3>
          <ul className="space-y-1.5">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-on-surface-variant/80">
                <Lightbulb size={12} className="text-yellow-400/70 shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes */}
      {notes?.length > 0 && (
        <div>
          <h3 className="text-[10px] font-semibold text-on-surface-variant/60 uppercase tracking-wider mb-2">Notes</h3>
          <ul className="space-y-1.5">
            {notes.map((note, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-on-surface-variant/80">
                <StickyNote size={12} className="text-primary/60 shrink-0 mt-0.5" />
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PageInfoButton;
