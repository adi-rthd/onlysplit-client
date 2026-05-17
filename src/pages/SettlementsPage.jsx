import React, { useEffect } from 'react';
import { GlassPanel } from '../components/ui/GlassCard';
import { CheckCircle2, History } from 'lucide-react';
import { useSettlementStore } from '../store/settlementStore';
import SettlementCard from '../components/ui/SettlementCard';

const SettlementsPage = () => {
  const { settlements, isLoading, fetchSettlements } = useSettlementStore();

  useEffect(() => {
    // Fetch all settlements across all groups
    fetchSettlements();
  }, [fetchSettlements]);

  // Separate pending and completed for display if needed
  const pendingSettlements = settlements.filter(s => s.status === 'pending');
  const completedSettlements = settlements.filter(s => s.status === 'completed' || s.isCompleted);

  return (
    <>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Settlements</h1>
          <p className="text-on-surface-variant">Track your payments and debts.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* PENDING */}
        <div>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <History size={18} className="text-error" /> Pending Settlements
          </h3>
          <GlassPanel className="p-4 min-h-[300px]">
            {isLoading ? (
              <div className="flex justify-center py-10"><div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div></div>
            ) : pendingSettlements.length > 0 ? (
              pendingSettlements.map(settlement => (
                <SettlementCard key={settlement.id} settlement={settlement} />
              ))
            ) : (
              <div className="text-center py-12">
                <CheckCircle2 className="mx-auto text-on-surface-variant mb-3" size={32} />
                <p className="text-on-surface font-medium">You are all settled up!</p>
                <p className="text-on-surface-variant text-sm mt-1">No pending payments.</p>
              </div>
            )}
          </GlassPanel>
        </div>

        {/* COMPLETED */}
        <div>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-neon-lime" /> Completed Settlements
          </h3>
          <GlassPanel className="p-4 min-h-[300px]">
            {isLoading ? (
              <div className="flex justify-center py-10"><div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div></div>
            ) : completedSettlements.length > 0 ? (
              completedSettlements.map(settlement => (
                <SettlementCard key={settlement.id} settlement={settlement} />
              ))
            ) : (
              <div className="text-center py-12">
                <History className="mx-auto text-on-surface-variant mb-3" size={32} />
                <p className="text-on-surface-variant text-sm mt-1">No settlement history yet.</p>
              </div>
            )}
          </GlassPanel>
        </div>
      </div>
    </>
  );
};

export default SettlementsPage;
