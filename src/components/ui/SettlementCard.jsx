import React from 'react';
import { GlassPanel } from './GlassCard';
import { CheckCircle2, Circle } from 'lucide-react';
import { formatCurrency } from '../../services/currencyService';
import useCurrencyStore from '../../store/useCurrencyStore';

const SettlementCard = ({ settlement }) => {
  const { currency, locale } = useCurrencyStore();
  const isCompleted = settlement.status === 'completed' || settlement.isCompleted;

  return (
    <GlassPanel className={`p-4 flex items-center justify-between mb-3 ${isCompleted ? 'opacity-75' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center ${isCompleted ? 'text-neon-lime' : 'text-on-surface-variant'}`}>
          {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
        </div>
        <div>
          <p className="text-sm">
            <span className="font-bold text-on-surface">{settlement.payerName || 'Payer'}</span>
            <span className="text-on-surface-variant mx-1">paid</span>
            <span className="font-bold text-on-surface">{settlement.receiverName || 'Receiver'}</span>
          </p>
          <p className="text-xs text-on-surface-variant">
            {new Date(settlement.createdAt || settlement.date).toLocaleDateString()} {settlement.note && `• ${settlement.note}`}
          </p>
        </div>
      </div>
      <div className={`font-bold ${isCompleted ? 'text-neon-lime' : 'text-on-surface'}`}>
        {formatCurrency(Number(settlement.amount || 0), settlement.currency || currency, locale)}
      </div>
    </GlassPanel>
  );
};

export default SettlementCard;
