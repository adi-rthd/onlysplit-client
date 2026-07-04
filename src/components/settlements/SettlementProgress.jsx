import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { formatCurrency } from '../../services/currencyService';

/**
 * Animated progress bar for settlement payment progress.
 * Shows both percentage and actual values (e.g., "₹1,250 of ₹2,500 paid — 50%").
 * Animates only when the value changes, not on every re-render.
 *
 * @param {{
 *   percent: number,
 *   paidAmount: number,
 *   totalAmount: number,
 *   currency?: string,
 *   locale?: string,
 *   className?: string,
 * }} props
 */
const SettlementProgress = React.memo(({
  percent = 0,
  paidAmount = 0,
  totalAmount = 0,
  currency = 'INR',
  locale = 'en-IN',
  className = '',
}) => {
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const prevPercentRef = useRef(clampedPercent);
  const [displayWidth, setDisplayWidth] = useState(clampedPercent);

  // Animate only when percent value actually changes
  useEffect(() => {
    if (prevPercentRef.current !== clampedPercent) {
      const controls = animate(prevPercentRef.current, clampedPercent, {
        duration: 0.3,
        ease: 'easeOut',
        onUpdate: (v) => setDisplayWidth(v),
      });
      prevPercentRef.current = clampedPercent;
      return () => controls.stop();
    }
  }, [clampedPercent]);

  return (
    <div className={`w-full ${className}`}>
      {/* Values + percentage */}
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs text-on-surface-variant">
          <span className="font-semibold text-on-surface">
            {formatCurrency(paidAmount, currency, locale)}
          </span>
          {' '}of{' '}
          <span className="font-medium">
            {formatCurrency(totalAmount, currency, locale)}
          </span>
          {' '}paid
        </span>
        <span className="text-xs font-bold text-on-surface tabular-nums">
          {Math.round(clampedPercent)}%
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-2 w-full rounded-full bg-surface-container-high overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(clampedPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Settlement ${Math.round(clampedPercent)} percent paid`}
      >
        <div
          className={`h-full rounded-full transition-none ${
            clampedPercent >= 100
              ? 'bg-gradient-to-r from-green-400 to-emerald-400'
              : 'bg-gradient-to-r from-primary to-primary/70'
          }`}
          style={{ width: `${displayWidth}%` }}
        />
      </div>
    </div>
  );
});

SettlementProgress.displayName = 'SettlementProgress';

export default SettlementProgress;
