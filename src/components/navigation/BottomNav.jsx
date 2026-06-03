import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BOTTOM_NAV_ITEMS } from '../../constants/navigation';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const location = useLocation();
  
  return (
    <nav className="md:hidden fixed bottom-0 w-full h-20 bg-surface-charcoal/90 backdrop-blur-2xl border-t border-glass-stroke z-50 flex justify-around items-center px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {BOTTOM_NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        
        return (
          <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-1 w-16 relative ${isActive ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
            {isActive && (
              <motion.div layoutId="bottom-nav-indicator" className="absolute -top-3 w-8 h-1 bg-neon-lime rounded-b-full shadow-[0_0_10px_rgba(228,242,34,0.5)]" />
            )}
            <Icon size={24} className={isActive ? 'text-primary' : 'text-on-surface-variant'} />
            <span className="text-[10px] leading-none">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
