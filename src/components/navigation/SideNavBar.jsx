import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../../constants/navigation';
import { ROUTES } from '../../constants/routes';
import { Plus, Settings, HelpCircle, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import authService from '../../services/authService';

const SideNavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    authService.logout();
    navigate(ROUTES.LANDING);
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 border-r border-glass-stroke bg-surface-charcoal/90 backdrop-blur-2xl z-40 flex-col py-6">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white font-bold">OS</div>
          <div>
            <h2 className="font-display-lg text-[18px] font-bold text-primary leading-tight">Main Workspace</h2>
            <p className="text-on-surface-variant font-body-md text-[12px]">Personal Finance</p>
          </div>
        </div>
      </div>
      
      <div className="px-4 mb-6">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(ROUTES.ADD_EXPENSE)} 
          className="w-full bg-gradient-to-r from-primary-container to-secondary-container text-white rounded-lg py-2.5 px-4 font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus size={18} /> Add Expense
        </motion.button>
      </div>
      
      <nav className="flex-1 px-2 space-y-1">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all duration-300 hover:translate-x-1 ${
                isActive(item.path) 
                ? 'bg-primary-container/20 text-primary border-l-4 border-neon-lime' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
              }`}
            >
              <Icon size={20} className={isActive(item.path) ? 'fill-primary/20' : ''} />
              <span className="font-body-md font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="px-2 mt-auto border-t border-glass-stroke pt-4 space-y-1">
        <Link to={ROUTES.SETTINGS} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(ROUTES.SETTINGS) ? 'bg-primary-container/20 text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'}`}>
          <Settings size={20} />
          <span>Settings</span>
        </Link>
        <Link to="#" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all rounded-lg">
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
