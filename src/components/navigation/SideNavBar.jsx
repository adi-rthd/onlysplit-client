// src/components/navigation/SideNavBar.jsx

import React, { useEffect, useState } from 'react';

import {
  Link,
  useLocation,
  useNavigate
} from 'react-router-dom';

import {
  Plus,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';

import { motion } from 'framer-motion';

import { NAVIGATION_ITEMS } from '../../constants/navigation';

import { ROUTES } from '../../constants/routes';

import authService from '../../services/authService';

import { getProfile } from '../../services/settingsService';

const SideNavBar = () => {
  const location = useLocation();

  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    firstName: 'Aditya',
    lastName: 'Rathod',
    avatarUrl: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const user = await getProfile();

      setProfile({
        firstName: user?.firstName || 'Aditya',

        lastName: user?.lastName || 'Rathod',

        avatarUrl:
          user?.avatarUrl ||
          `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${user?.firstName}+${user?.lastName}`
      });
    } catch (error) {
      console.error(error);
    }
  };

  const isActive = (path) =>
    location.pathname === path;

  const handleLogout = () => {
    authService.logout();

    navigate(ROUTES.LANDING);
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 border-r border-glass-stroke bg-surface-charcoal/90 backdrop-blur-2xl z-40 flex-col py-6">
      {/* TOP PROFILE */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          {/* AVATAR */}
          <div className="w-12 h-12 rounded-full overflow-hidden border border-primary/30 shrink-0">
            <img
              src={profile.avatarUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          {/* INFO */}
          <div className="min-w-0">
            <h2 className="font-display-lg text-[18px] font-bold text-primary leading-tight truncate">
              {profile.firstName}{' '}
              {profile.lastName}
            </h2>

            <p className="text-on-surface-variant font-body-md text-[12px]">
              🇮🇳 India • ₹ INR
            </p>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="px-4 mb-6 space-y-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() =>
            navigate(ROUTES.CREATE_GROUP)
          }
          className="w-full bg-surface-container-high border border-glass-stroke text-on-surface rounded-lg py-2.5 px-4 font-medium flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
        >
          <Plus size={18} />
          Create Group
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() =>
            navigate(ROUTES.ADD_EXPENSE)
          }
          className="w-full bg-gradient-to-r from-primary-container to-secondary-container text-white rounded-lg py-2.5 px-4 font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          Add Expense
        </motion.button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-2 space-y-1">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all duration-300 hover:translate-x-1 ${isActive(item.path)
                ? 'bg-primary-container/20 text-primary border-l-4 border-neon-lime'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                }`}
            >
              <Icon
                size={20}
                className={
                  isActive(item.path)
                    ? 'fill-primary/20'
                    : ''
                }
              />

              <span className="font-body-md font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="px-2 mt-auto border-t border-glass-stroke pt-4 space-y-1">
        <Link
          to={ROUTES.SETTINGS}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(ROUTES.SETTINGS)
            ? 'bg-primary-container/20 text-primary'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
            }`}
        >
          <Settings size={20} />

          <span>Settings</span>
        </Link>

        <Link
          to="#"
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all rounded-lg"
        >
          <HelpCircle size={20} />

          <span>Support</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-error hover:bg-white/5 transition-all rounded-lg"
        >
          <LogOut size={20} />

          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default SideNavBar;