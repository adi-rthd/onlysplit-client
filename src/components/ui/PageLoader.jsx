import React from 'react';
import { motion } from 'framer-motion';

/**
 * Full-page loader shown during auth hydration and route-level suspense.
 */
const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-surface-charcoal">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-xl">
          OS
        </div>
        <Spinner size={32} />
        <span className="text-on-surface-variant text-sm font-label-caps tracking-widest">
          LOADING
        </span>
      </motion.div>
    </div>
  );
};

/**
 * Reusable spinner with configurable size.
 */
export const Spinner = ({ size = 24, className = '' }) => {
  return (
    <svg
      className={`animate-spin text-primary ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
};

export default PageLoader;
