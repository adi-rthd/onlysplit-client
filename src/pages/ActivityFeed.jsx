import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Filter, Receipt, Banknote } from 'lucide-react';
import { activity } from '../data/activity';

const ActivityFeed = () => {
  return (
    <div className="max-w-[1000px] mx-auto w-full">
      <div className="mb-8 flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Recent Activity</h2>
          <p className="text-on-surface-variant mt-1">All your global interactions across groups.</p>
        </div>
        <div className="flex gap-3">
          <button className="glass-card px-4 py-2 rounded-full flex items-center gap-2 text-sm">
            <Filter size={18} /> Date
          </button>
        </div>
      </div>
      
      <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[23px] before:w-px before:bg-glass-stroke">
        <div className="flex items-center gap-4 relative pt-4">
          <div className="w-12 h-6 bg-surface-container-high rounded-full flex items-center justify-center border border-glass-stroke text-[10px] font-label-caps">TODAY</div>
        </div>
        
        <div className="relative flex gap-6 pb-6">
          <div className="w-12 h-12 rounded-full bg-primary-container/20 border border-primary/30 flex items-center justify-center shrink-0 z-10 shadow-[0_0_15px_rgba(94,92,230,0.2)]">
            <Receipt className="text-primary" size={24} />
          </div>
          <GlassCard className="flex-1 p-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium"><span className="font-bold">You</span> added <span className="text-primary">Dinner at Mario's</span></p>
                <p className="text-on-surface-variant text-sm mt-1">in group <span className="bg-white/5 px-2 py-0.5 rounded text-xs">Weekend Trip</span></p>
              </div>
              <span className="font-data-mono font-bold">$124.50</span>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-primary-container/40 border border-background"></div>
                <div className="w-6 h-6 rounded-full bg-secondary-container/40 border border-background"></div>
                <div className="w-6 h-6 rounded-full bg-surface-variant border border-background flex items-center justify-center text-[8px]">+2</div>
              </div>
              <span className="text-xs text-on-surface-variant">split equally</span>
            </div>
          </GlassCard>
        </div>
        
        <div className="relative flex gap-6 pb-6">
          <div className="w-12 h-12 rounded-full bg-neon-lime/10 border border-neon-lime/30 flex items-center justify-center shrink-0 z-10">
            <Banknote className="text-neon-lime" size={24} />
          </div>
          <GlassCard className="flex-1 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium"><span className="text-neon-lime font-bold">Sarah M.</span> settled up with you</p>
                <p className="text-on-surface-variant text-sm mt-1">via Venmo</p>
              </div>
              <span className="text-neon-lime font-bold font-data-mono">+$45.00</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
