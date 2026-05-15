import React from 'react';
import { motion } from 'framer-motion';

export const PrimaryButton = ({ children, className = '', ...props }) => {
  return (
    <motion.button 
      whileTap={{ scale: 0.95 }}
      className={`bg-primary-container/20 text-primary border border-primary/30 hover:bg-primary-container/30 transition-colors px-4 py-2 rounded-lg ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
