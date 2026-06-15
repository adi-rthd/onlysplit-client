import React from 'react';
import { motion } from 'framer-motion';

const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-surface-charcoal">
      <div className="flex flex-col items-center gap-8">
        {/* Logo with animated glow ring */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing glow */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-24 h-24 rounded-full bg-primary/30 blur-xl"
          />

          {/* Rotating dashed border */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute w-20 h-20 rounded-full border-2 border-dashed border-primary/30"
          />

          {/* Logo */}
          <motion.img
            src="/logo.png"
            alt="OnlySplit"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative w-14 h-14 object-contain drop-shadow-[0_0_20px_rgba(124,108,255,0.4)]"
          />
        </div>

        {/* Animated text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-sm font-medium text-on-surface-variant tracking-widest"
        >
          ONLYSPLIT
        </motion.p>
      </div>
    </div>
  );
};

export const Spinner = ({ size = 24, className = '' }) => (
  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
    className={className} style={{ width: size, height: size }}>
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="text-primary">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" className="opacity-15" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  </motion.div>
);

export default PageLoader;
