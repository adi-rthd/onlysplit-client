import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper } from 'lucide-react';

/**
 * Settlement completion celebration overlay.
 * Renders as a fixed overlay on top of everything (z-[200]).
 * Non-blocking — pointer-events-none so user can still interact.
 * Fades automatically after 4 seconds.
 *
 * @param {{ show: boolean }} props
 */
const SettlementCelebration = ({ show }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Backdrop glow */}
          <div className="absolute inset-0 bg-green-400/5" />

          {/* Content */}
          <motion.div
            className="flex flex-col items-center gap-3 p-8 rounded-3xl bg-surface-container/95 border border-green-400/20 shadow-2xl shadow-green-400/10 backdrop-blur-xl"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {/* Icon with pulse ring */}
            <motion.div
              className="flex h-16 w-16 items-center justify-center rounded-full bg-green-400/15 ring-4 ring-green-400/20"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            >
              <PartyPopper size={28} className="text-green-400" />
            </motion.div>

            <h3 className="text-xl font-bold text-green-400">Settlement Complete</h3>
            <p className="text-sm text-on-surface-variant text-center max-w-[220px]">
              Everything has been settled successfully.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettlementCelebration;
