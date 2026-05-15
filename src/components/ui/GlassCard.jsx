import React from 'react';
import { motion } from 'framer-motion';

export const GlassCard = ({ children, className = '', ...props }) => {
  return (
    <motion.div 
      className={`glass-card rounded-2xl ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const GlassPanel = ({ children, className = '', ...props }) => {
  return (
    <motion.div 
      className={`glass-panel rounded-2xl ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
