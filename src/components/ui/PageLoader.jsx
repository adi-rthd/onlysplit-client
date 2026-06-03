import React from 'react';
import { motion } from 'framer-motion';

/**
 * Full-page loader shown during auth hydration and route-level suspense.
 * Branded, minimal, smooth.
 */
const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-surface-charcoal">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-8"
      >
        {/* Logo with pulse */}
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.15, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 w-16 h-16 rounded-2xl bg-primary blur-xl"
          />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl tracking-tight">OS</span>
          </div>
        </div>

        {/* Animated dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
              className="w-2 h-2 rounded-full bg-primary/70"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Reusable spinner with configurable size.
 */
export const Spinner = ({ size = 24, className = '' }) => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      className={className}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="text-primary"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="opacity-15"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
};

export default PageLoader;
