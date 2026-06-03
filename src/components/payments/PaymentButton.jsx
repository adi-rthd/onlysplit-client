import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../services/currencyService';
import useCurrencyStore from '../../store/useCurrencyStore';

const PaymentButton = ({ onClick, amount, recipient, currency: propCurrency }) => {
  const { currency: storeCurrency, locale } = useCurrencyStore();
  const currency = propCurrency || storeCurrency || 'INR';

  return (
    <motion.button 
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="px-4 py-2 rounded-xl bg-primary-container/20 text-primary border border-primary/30 hover:bg-primary-container/30 transition-colors font-medium whitespace-nowrap"
    >
      Pay {amount ? formatCurrency(amount, currency, locale) : 'Now'}
    </motion.button>
  );
};

export default PaymentButton;
