import React from 'react';
import { GlassPanel } from './GlassCard';
import { formatCurrency } from '../../utils/formatCurrency';

const MemberBalanceList = ({ members, currency = 'USD', onSettleUp }) => {
  if (!members || members.length === 0) {
    return (
      <div className="text-center py-4 text-on-surface-variant text-sm">
        Everyone is settled up
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {members.map((member, index) => {
        const balance = Number(member.balance || 0);
        const isPositive = balance > 0;
        const isNegative = balance < 0;
        const isZero = balance === 0;

        let statusText = "Settled up";
        let statusColor = "text-on-surface-variant";
        let amountText = formatCurrency(Math.abs(balance), currency);

        if (isPositive) {
          statusText = `${member.name} owes you`;
          statusColor = "text-neon-lime";
        } else if (isNegative) {
          statusText = `You owe ${member.name}`;
          statusColor = "text-error";
        }

        return (
          <div key={member.id || index} className="mb-2 last:mb-0">
            <GlassPanel className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container text-white font-bold flex items-center justify-center">
                  {member.name?.slice(0, 2)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h4 className="font-medium text-on-surface">
                    {member.name}
                  </h4>
                  <p className={`text-xs ${statusColor}`}>
                    {statusText}
                  </p>
                </div>
              </div>
              
              <div className={`font-bold ${statusColor}`}>
                {isZero ? '--' : amountText}
              </div>
            </GlassPanel>

            {isNegative && onSettleUp && (
              <button 
                onClick={() => onSettleUp(member.id, Math.abs(balance))}
                className="w-full mt-1 text-[11px] font-bold text-primary uppercase tracking-wider py-1.5 hover:bg-white/5 rounded transition-colors"
              >
                Settle Balance
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MemberBalanceList;
