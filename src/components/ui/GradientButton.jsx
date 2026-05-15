import React from 'react';
import { motion } from 'framer-motion';

export const GradientButton = ({ children, onClick, className = '', icon: Icon, ...props }) => {
  return (
    <motion.button 
      whileTap={{ scale: 0.95 }}
      onClick={onClick} 
      className={`bg-gradient-to-r from-primary-container to-secondary-container text-white rounded-xl font-medium transition-opacity hover:opacity-90 flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {Icon && <Icon size={18} />}
      {children}
    </motion.button>
  );
};
