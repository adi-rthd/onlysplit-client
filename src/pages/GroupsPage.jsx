import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import SettlementCard from '../components/payments/SettlementCard';
import { settlements as mockSettlements } from '../data/settlements';
import { Bell, Share, Receipt } from 'lucide-react';

const GroupsPage = () => {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center h-16 sticky top-0 bg-background/80 backdrop-blur-xl border-b border-glass-stroke z-30">
        <h1 className="text-2xl font-bold text-primary">Summer Trip 2024</h1>
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant"><Bell size={24} /></button>
          <div className="w-8 h-8 rounded-full bg-surface-container-high border border-glass-stroke overflow-hidden">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_WgyTM2sSHSAM8nHqPHDZacTPkHfnsyjoWcnXQb6AtP1dtVI9JCEcruzvhM1GEUM6RHADEJY2GbLlsMU-x98CHE1ZtifR5S6hiVUAGvpU0e-2f7opq0ZZLsY3n6f9RgrsBK62januv1vivi96tZVVbBQ_vxrHwLOZIxxYQoH45TGTUw2qB0jQxyyvswKAN7BWnX01PAduEiYtGfHkHAblj5TNXdx15UClqEZaa9_Amjuvr5gxHCGEw8nfl8acIj7m3O4lCoIjmDa4" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <GlassCard className="p-6 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div>
              <p className="font-label-caps text-[12px] text-on-surface-variant mb-2">TOTAL GROUP SPENDING</p>
              <h2 className="text-5xl font-bold text-white">$4,250.00</h2>
              <p className="mt-1 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-neon-lime"></span> Active trip · 5 members</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-glass-stroke bg-white/5 hover:bg-white/10 text-white transition-colors flex items-center justify-center gap-2">
                <Share size={18} /> Share
              </button>
              <GradientButton className="flex-1 sm:flex-none px-6 py-3" icon={Receipt}>
                Settle Up
              </GradientButton>
            </div>
          </GlassCard>
          
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold mb-6">Suggested Settlements</h3>
            <div className="space-y-4">
              {mockSettlements.map((settlement) => (
                <SettlementCard 
                  key={settlement.id}
                  from={settlement.from}
                  to={settlement.to}
                  amount={settlement.amount}
                  fromAvatar={settlement.fromAvatar}
                  toAvatar={settlement.toAvatar}
                  onPay={() => console.log('Initiating Razorpay...')}
                />
              ))}
            </div>
          </GlassCard>
        </div>
        
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="p-6">
            <h3 className="font-bold mb-6">Spending Analytics</h3>
            <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#343536" strokeWidth="12"></circle>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#5e5ce6" strokeWidth="12" strokeDasharray="100 151.3"></circle>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#a23cd5" strokeWidth="12" strokeDasharray="60 191.3" strokeDashoffset="-100"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] text-on-surface-variant font-label-caps">TOP CAT</span>
                <span className="font-bold text-sm">Food</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary-container"></span> Food</span><span className="font-data-mono">40%</span></div>
              <div className="flex justify-between text-sm"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-tertiary-container"></span> Transport</span><span className="font-data-mono">35%</span></div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default GroupsPage;
