import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassPanel } from '../components/ui/GlassCard';
import { Calendar, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Plus, Utensils, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Overview</h1>
          <p className="text-on-surface-variant">Your financial breakdown for this month.</p>
        </div>
        <div className="hidden md:flex gap-3">
          <button className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2">
            <Calendar size={18} />
            <span className="font-label-caps text-[12px]">THIS MONTH</span>
          </button>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GlassPanel className="p-6 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary-container/20 rounded-full blur-3xl group-hover:bg-primary-container/30 transition-all duration-500"></div>
          <div className="flex justify-between items-center mb-4">
            <span className="font-label-caps text-[12px] text-on-surface-variant">TOTAL BALANCE</span>
            <Wallet className="text-primary" size={24} />
          </div>
          <div className="text-[40px] font-bold text-on-surface tracking-tight mb-1">+$420.50</div>
          <div className="text-neon-lime flex items-center gap-1">
            <TrendingUp size={16} />
            <span>+12.5% vs last month</span>
          </div>
        </GlassPanel>
        
        <GlassPanel className="p-6 border-l-4 border-l-error">
          <div className="flex justify-between items-center mb-4">
            <span className="font-label-caps text-[12px] text-on-surface-variant">YOU OWE</span>
            <ArrowUpRight className="text-error" size={24} />
          </div>
          <div className="text-[32px] font-bold text-on-surface mb-1">$150.00</div>
          <p className="text-on-surface-variant text-sm">Across 3 groups</p>
        </GlassPanel>
        
        <GlassPanel className="p-6 border-l-4 border-l-neon-lime">
          <div className="flex justify-between items-center mb-4">
            <span className="font-label-caps text-[12px] text-on-surface-variant">YOU ARE OWED</span>
            <ArrowDownRight className="text-neon-lime" size={24} />
          </div>
          <div className="text-[32px] font-bold text-on-surface mb-1">$570.50</div>
          <p className="text-on-surface-variant text-sm">From 5 friends</p>
        </GlassPanel>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassPanel className="lg:col-span-2 p-6 h-80 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Expense Trends</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded bg-primary-container text-white text-xs">M</button>
              <button className="px-3 py-1 rounded bg-surface-container-high text-xs">Y</button>
            </div>
          </div>
          <div className="flex-1 flex items-end gap-2 px-2">
            {[30, 50, 80, 100, 20, 40, 15].map((h, i) => (
              <motion.div 
                key={i} 
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t transition-all" 
              />
            ))}
          </div>
        </GlassPanel>
        
        <GlassPanel className="p-6 flex flex-col h-80">
          <h3 className="font-medium mb-6">Recent Activity</h3>
          <div className="space-y-4 flex-1 overflow-y-auto hide-scrollbar">
            <div className="flex items-center justify-between group cursor-pointer" onClick={() => navigate('/activity')}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                  <Utensils size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium">Dinner at Sushi Ko</p>
                  <p className="text-xs text-on-surface-variant">Paid by Sarah</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-error">-$45.00</p>
              </div>
            </div>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => navigate('/activity')}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-neon-lime">
                  <Home size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium">Monthly Rent</p>
                  <p className="text-xs text-on-surface-variant">Paid by You</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-neon-lime">+$800.00</p>
              </div>
            </div>
          </div>
        </GlassPanel>
      </div>
      
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/add-expense')} 
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-primary-container to-inverse-primary rounded-full flex items-center justify-center shadow-lg neon-glow z-50"
      >
        <Plus className="text-white" size={28} />
      </motion.button>
    </>
  );
};

export default Dashboard;
