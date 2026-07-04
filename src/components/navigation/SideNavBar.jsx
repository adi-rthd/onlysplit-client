// src/components/navigation/SideNavBar.jsx

import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, Settings, HelpCircle, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

import { ROUTES } from '../../constants/routes';
import { NAVIGATION_ITEMS } from '../../constants/navigation';
import { getProfile } from '../../services/settingsService';
import { useAuthStore } from '../../store/authStore';
import authService from '../../services/authService';
import Avatar from '../common/Avatar';
import { useFriendRequests } from '../../queries/hooks/useFriends';

const SideNavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const storeUser = useAuthStore((s) => s.user);
  const requestsQuery = useFriendRequests({ staleTime: 60 * 1000 });
  const requestCount = requestsQuery.data?.length || 0;

  const [profile, setProfile] = useState({
    firstName: 'Aditya',
    lastName: 'Rathod',
    avatarUrl: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  // Keep avatar in sync with auth store (updates after upload)
  useEffect(() => {
    if (storeUser?.avatarUrl) {
      setProfile((prev) => ({ ...prev, avatarUrl: storeUser.avatarUrl }));
    }
  }, [storeUser?.avatarUrl]);

  const fetchProfile = async () => {
    try {
      const user = await getProfile();

      setProfile({
        firstName: user?.firstName,
        lastName: user?.lastName,
        avatarUrl: user?.avatarUrl || null
      });
    } catch (error) {
      console.error(error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await authService.logout();
    navigate(ROUTES.LANDING);
  };

  return (
    <div className="hidden md:flex fixed left-0 top-0 h-screen w-50 border-r border-glass-stroke bg-surface-charcoal/90 backdrop-blur-2xl z-40 flex-col py-6">
      
      {/* TOP PROFILE */}
      <div className="px-4 mb-8">
        <div className="flex flex-col items-center text-center gap-3">
          
          {/* AVATAR */}
          <Avatar
            firstName={profile.firstName}
            lastName={profile.lastName}
            avatarUrl={profile.avatarUrl}
            size="lg"
            className="border-2 border-primary/30 shadow-[0_0_20px_rgba(124,108,255,0.15)]"
          />

          {/* INFO */}
          <div className="w-full overflow-hidden">
            <h2 className="font-display-lg text-[15px] font-bold text-primary truncate text-center">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-on-surface-variant text-center text-[11px] mt-0.5">
              🇮🇳 India • ₹ INR
            </p>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      {/* <div className="px-4 mb-6 space-y-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(ROUTES.CREATE_GROUP)}
          className="w-full bg-surface-container-high border border-glass-stroke text-on-surface rounded-lg py-2.5 px-4 font-medium flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
        >
          <Plus size={18} />
          Create Group
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(ROUTES.ADD_EXPENSE)}
          className="w-full bg-gradient-to-r from-primary-container to-secondary-container text-white rounded-lg py-2.5 px-4 font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          Add Expense
        </motion.button>
      </div> */}

      {/* NAVIGATION */}
      <nav className="flex-1 px-2 space-y-1">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          const showBadge = item.path === '/friends' && requestCount > 0;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all duration-300 hover:translate-x-1 border-l-4 ${
                isActive(item.path)
                  ? 'bg-primary-container/20 text-primary border-neon-lime'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5 border-transparent'
              }`}
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={isActive(item.path) ? 'fill-primary/20' : ''}
                />
                {showBadge && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-error" />
                )}
              </div>
              <span className="font-body-md font-medium">
                {item.label}
              </span>
              {showBadge && (
                <span className="ml-auto text-[10px] font-bold bg-error/15 text-error px-1.5 py-0.5 rounded-full">
                  {requestCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="px-2 mt-auto border-t border-glass-stroke pt-4 space-y-1">
        <Link
          to={ROUTES.SETTINGS}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive(ROUTES.SETTINGS)
              ? 'bg-primary-container/20 text-primary'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
          }`}
        >
          <Settings size={20} />
          <span>Settings</span>
        </Link>

        {/* <Link
          to="#"
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all rounded-lg"
        >
          <HelpCircle size={20} />
          <span>Support</span>
        </Link> */}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-error hover:bg-white/5 transition-all rounded-lg"
        >
          <LogOut size={20} />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
};

export default SideNavBar;