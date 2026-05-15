import React from 'react';
import { GlassPanel } from '../components/ui/GlassCard';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const AnalyticsPage = () => {
  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold">Spending Insights</h1>
          <p className="text-on-surface-variant">Multi-layered financial analysis across your categories.</p>
        </div>
        <div className="flex items-center bg-surface-container-high rounded-lg p-1 border border-glass-stroke">
          <button className="px-4 py-2 rounded-md bg-surface-container-highest text-primary font-medium shadow-sm">Personal</button>
          <button className="px-4 py-2 rounded-md text-on-surface-variant hover:text-on-surface">Group Totals</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 flex flex-col gap-6">
          <GlassPanel className="p-6 relative overflow-hidden group">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
            <div className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider mb-4">Total Spent (This Month)</div>
            <div className="text-3xl font-bold mb-2">$4,250.00</div>
            <div className="flex items-center gap-2 text-error text-sm font-data-mono">
              <TrendingUp size={16} /> +12.5% <span className="text-on-surface-variant">vs last month</span>
            </div>
          </GlassPanel>
          
          <GlassPanel className="p-6 relative overflow-hidden">
            <div className="font-label-caps text-[10px] text-on-surface-variant uppercase mb-4">Top Category</div>
            <div className="text-2xl font-bold mb-2">Dining & Delivery</div>
            <div className="text-secondary font-data-mono">$1,240.50</div>
            <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-4 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                transition={{ duration: 1, delay: 0.2 }}
                className="bg-secondary h-1.5 rounded-full" 
              />
            </div>
          </GlassPanel>
        </div>
        
        <GlassPanel className="md:col-span-8 p-6">
          <h2 className="text-xl font-bold mb-6">Monthly Spending per Category</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {[
              { label: 'Groceries', h: '40%', color: 'primary' },
              { label: 'Dining', h: '85%', color: 'secondary' },
              { label: 'Transport', h: '60%', color: 'tertiary' },
              { label: 'Rent', h: '75%', color: 'primary' },
              { label: 'Entertain', h: '50%', color: 'secondary' }
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: bar.h }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className={`w-full bg-gradient-to-t from-${bar.color}/10 to-${bar.color}/40 rounded-t-md relative transition-all group-hover:to-${bar.color}/60`}
                />
                <span className="text-[10px] font-label-caps text-on-surface-variant rotate-[-45deg] origin-top-left mt-2 whitespace-nowrap">{bar.label}</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
};

export default AnalyticsPage;
