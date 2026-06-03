import React from 'react';
import { formatCurrency } from '../../services/currencyService';
import useCurrencyStore from '../../store/useCurrencyStore';

const MemberBalanceList = ({ members, currency: propCurrency, onSettleUp }) => {
  const { currency: storeCurrency, locale } = useCurrencyStore();
  const currency = propCurrency || storeCurrency || 'INR';

  if (!members || members.length === 0) {
    return (
      <div className="text-center py-4 text-on-surface-variant text-sm">
        Everyone is settled up
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {members.map((member, index) => {
        const balance = Number(member.netBalance || 0);
        const isPositive = balance > 0;
        const isNegative = balance < 0;
        const isZero = balance === 0;

        let statusText = "Settled up";
        let statusColor = "text-on-surface-variant";
        let amountColor = "text-on-surface-variant";
        let amountText = formatCurrency(Math.abs(balance), currency, locale);

        if (isPositive) {
          statusText = `${member.firstName} owes you`;
          statusColor = "text-green-400/80";
          amountColor = "text-green-400";
        } else if (isNegative) {
          statusText = `You owe ${member.firstName}`;
          statusColor = "text-orange-300/80";
          amountColor = "text-orange-300";
        }

        const initials = member.name?.slice(0, 2)?.toUpperCase() || 'U';

        return (
          <div key={member.id || index}>
            <div className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-bold flex items-center justify-center">
                  {initials}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-on-surface">
                    {member.name}
                  </h4>
                  <p className={`text-xs ${statusColor}`}>
                    {statusText}
                  </p>
                </div>
              </div>

              <div className={`text-sm font-bold tabular-nums ${amountColor}`}>
                {isZero ? '—' : (isPositive ? '+' : '-') + amountText}
              </div>
            </div>

            {isNegative && onSettleUp && (
              <button
                onClick={() => onSettleUp(member.id, Math.abs(balance))}
                className="w-full text-[11px] font-semibold text-primary uppercase tracking-wider py-1.5 hover:bg-white/5 rounded-lg transition-colors"
              >
                Settle Up
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MemberBalanceList;
