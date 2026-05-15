import React from 'react';
import { motion } from 'framer-motion';

const PaymentButton = ({ onClick, amount, recipient }) => {
  return (
    <motion.button 
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="px-4 py-2 rounded-lg bg-primary-container/20 text-primary border border-primary/30 hover:bg-primary-container/30 transition-colors font-medium whitespace-nowrap"
    >
      Pay {amount ? `$${amount}` : 'Now'}
    </motion.button>
  );
};

export default PaymentButton;
