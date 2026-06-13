import React from 'react';
import { formatCurrency } from '../../services/currencyService';
import useCurrencyStore from '../../store/useCurrencyStore';

const MemberBalanceList = ({ members, currency: propCurrency }) => {
  const { currency: storeCurrency, locale } = useCurrencyStore();

  const currency =
    propCurrency ||
    storeCurrency ||
    'INR';

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
        const balance = Number(
          member.netBalance || 0
        );

        const isPositive = balance > 0;
        const isNegative = balance < 0;
        const isZero = balance === 0;

        let statusText = 'Settled up';
        let statusColor = 'text-on-surface-variant';
        let amountColor = 'text-on-surface-variant';

        if (isPositive) {
          statusText = 'Should receive';
          statusColor = 'text-green-400/80';
          amountColor = 'text-green-400';
        } else if (isNegative) {
          statusText = 'Should pay';
          statusColor = 'text-orange-300/80';
          amountColor = 'text-orange-300';
        }

        const displayName =
          `${member.firstName || ''} ${member.lastName || ''}`.trim();

        const initials =
          `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase() ||
          'U';

        return (
          <div key={member.userId || index}>
            <div className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-bold flex items-center justify-center">
                  {initials}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-on-surface">
                    {displayName}
                  </h4>

                  <p className={`text-xs ${statusColor}`}>
                    {statusText}
                  </p>
                </div>
              </div>

              <div
                className={`text-sm font-bold tabular-nums ${amountColor}`}
              >
                {isZero
                  ? '—'
                  : formatCurrency(
                      Math.abs(balance),
                      currency,
                      locale
                    )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MemberBalanceList;