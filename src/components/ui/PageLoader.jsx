import React from 'react';
import { motion } from 'framer-motion';

const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-surface-charcoal">
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-16 h-16">
          {/* Spinning ring */}
          <motion.svg viewBox="0 0 80 80" className="w-full h-full absolute inset-0"
            animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <defs>
              <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c6cff" />
                <stop offset="50%" stopColor="#4f8cff" />
                <stop offset="100%" stopColor="#7c6cff" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <circle cx="40" cy="40" r="34" fill="none" stroke="url(#rg)" strokeWidth="3" strokeLinecap="round" strokeDasharray="160 60" />
          </motion.svg>

          {/* OS text — drawn with path animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 44 24" className="w-10 h-6">
              {/* O — full closed circle */}
              <motion.ellipse
                cx="10" cy="12" rx="7" ry="9"
                fill="none" stroke="#7c6cff" strokeWidth="2.8" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
              {/* S — proper S curve (curves right first, then left) */}
              <motion.path
                d="M34 5c-3 0-5 1.5-5 4s2 3.5 5 4 5 1.5 5 4-2 4-5 4"
                fill="none" stroke="#4f8cff" strokeWidth="2.8" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
              />
            </svg>
          </div>
        </div>

        {/* Dots */}
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 rounded-full bg-primary/50" />
          ))}
        </div>
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
