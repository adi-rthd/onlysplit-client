import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BOTTOM_NAV_ITEMS } from '../../constants/navigation';
import { motion } from 'framer-motion';
import { useFriendRequests } from '../../queries/hooks/useFriends';

const BottomNav = () => {
  const location = useLocation();
  const requestsQuery = useFriendRequests({ staleTime: 60 * 1000 });
  const requestCount = requestsQuery.data?.length || 0;

  return (
    <nav className="md:hidden fixed bottom-0 w-full h-20 bg-surface-charcoal/90 backdrop-blur-2xl border-t border-glass-stroke z-50 flex justify-around items-center px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {BOTTOM_NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        const showBadge = item.path === '/friends' && requestCount > 0;

        return (
          <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-1 w-16 relative ${isActive ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
            {isActive && (
              <motion.div layoutId="bottom-nav-indicator" className="absolute -top-3 w-8 h-1 bg-neon-lime rounded-b-full shadow-[0_0_10px_rgba(228,242,34,0.5)]" />
            )}
            <div className="relative">
              <Icon size={24} className={isActive ? 'text-primary' : 'text-on-surface-variant'} />
              {showBadge && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-error text-white text-[9px] font-bold flex items-center justify-center">
                  {requestCount > 9 ? '9+' : requestCount}
                </span>
              )}
            </div>
            <span className="text-[10px] leading-none">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
