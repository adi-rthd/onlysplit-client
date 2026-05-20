import React from 'react';

import { motion } from 'framer-motion';

import { Loader2 } from 'lucide-react';

const   GlowButton = ({
  children,
  icon: Icon,
  onClick,
  iconSize = 30,
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
}) => {
  return (
    <motion.button
      type={type}
      whileHover={
        !isLoading && !disabled
          ? {
            scale: 1.02,
          }
          : {}
      }
      whileTap={
        !isLoading && !disabled
          ? {
            scale: 0.98,
          }
          : {}
      }
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`group relative flex items-center justify-center overflow-hidden rounded-[28px] bg-[#111111] px-8 shadow-[0_0_40px_rgba(79,70,255,0.12)] transition-all duration-500 hover:shadow-[0_0_70px_rgba(79,70,255,0.25)] disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
    >
      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#5B4DFF]/10 to-[#4F8CFF]/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Shine */}
      {!isLoading && (
        <div className="absolute -left-20 top-0 h-full w-20 rotate-12 bg-white/10 blur-2xl transition-all duration-700 group-hover:left-[130%]" />
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center">
          {Icon && (
            <motion.div
              animate={{
                scale: [1, 1.18, 1],
              }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Icon
                size={iconSize}
                strokeWidth={2.5}
                className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.45)]"
              />
            </motion.div>
          )}
        </div>
      ) : (
        <>
          {/* TEXT */}
          <span className="absolute inset-0 flex items-center justify-center text-[18px] font-semibold tracking-tight text-white transition-all duration-500 group-hover:-translate-y-2 group-hover:opacity-0">
            {children}
          </span>

          {/* ICON */}
          <div className="absolute inset-0 flex scale-50 items-center justify-center opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
            {Icon && (
              <Icon
                size={iconSize}
                strokeWidth={2.5}
                className="text-white transition-transform duration-500 group-hover:rotate-90"
              />
            )}
          </div>
        </>
      )}
    </motion.button>
  );
};

export default GlowButton;