import React from 'react';
import { Banknote, Smartphone, Building2, CreditCard } from 'lucide-react';

const METHOD_CONFIG = {
  cash: { icon: Banknote, label: 'Cash', color: 'text-green-400' },
  upi: { icon: Smartphone, label: 'UPI', color: 'text-purple-400' },
  bank_transfer: { icon: Building2, label: 'Bank Transfer', color: 'text-blue-400' },
  banktransfer: { icon: Building2, label: 'Bank Transfer', color: 'text-blue-400' },
  razorpay: { icon: CreditCard, label: 'Razorpay', color: 'text-primary' },
};

/**
 * Renders a payment method icon with optional label.
 * @param {{ method: string, size?: number, showLabel?: boolean, className?: string }} props
 */
const PaymentMethodIcon = React.memo(({ method, size = 16, showLabel = false, className = '' }) => {
  const normalizedMethod = (method || 'cash').toLowerCase().replace(/[\s-]/g, '');
  // handle "bank_transfer" vs "banktransfer"
  const key = normalizedMethod === 'banktransfer' || normalizedMethod === 'bank_transfer'
    ? 'banktransfer'
    : normalizedMethod;
  const config = METHOD_CONFIG[key] || METHOD_CONFIG.cash;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} aria-label={`Payment method: ${config.label}`}>
      <Icon size={size} className={config.color} />
      {showLabel && (
        <span className="text-xs font-medium text-on-surface-variant">{config.label}</span>
      )}
    </span>
  );
});

PaymentMethodIcon.displayName = 'PaymentMethodIcon';

export default PaymentMethodIcon;
