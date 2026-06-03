import React from 'react';
import { ArrowRight } from 'lucide-react';
import PaymentButton from './PaymentButton';
import { formatCurrency } from '../../services/currencyService';
import useCurrencyStore from '../../store/useCurrencyStore';

const SettlementCard = ({ from, to, amount, fromAvatar, toAvatar, onPay, currency: propCurrency }) => {
  const { currency: storeCurrency, locale } = useCurrencyStore();
  const currency = propCurrency || storeCurrency || 'INR';

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container/50 border border-glass-stroke">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-primary/20 overflow-hidden">
          <img src={fromAvatar} alt={from} className="w-full h-full object-cover" />
        </div>
        <ArrowRight className="text-outline" size={20} />
        <div className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-primary/20 overflow-hidden">
          <img src={toAvatar} alt={to} className="w-full h-full object-cover" />
        </div>
        <div className="ml-2">
          <p className="text-sm font-medium">{from} owes {to}</p>
          <p className="text-primary font-bold font-data-mono">{formatCurrency(amount, currency, locale)}</p>
        </div>
      </div>
      <PaymentButton onClick={onPay} />
    </div>
  );
};

export default SettlementCard;
