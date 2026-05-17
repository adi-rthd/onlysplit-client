import React from 'react';
import { GlassPanel } from './GlassCard';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../services/currencyService';

const GroupCard = ({ group }) => {
  const navigate = useNavigate();
  const groupId = group?.id || group?.groupId;

  return (
    <GlassPanel
      whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(94, 92, 230, 0.2)' }}
      className="p-6 cursor-pointer transition-all group"
      onClick={() => navigate(`/groups/${groupId}`)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center font-bold text-white text-lg">
          {group?.name?.slice(0, 2)?.toUpperCase() || 'GR'}
        </div>

        <div className="flex -space-x-2">
          {Array.from({ length: Math.min(group.memberCount || 0, 3) }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-[#08090b] bg-surface-container-highest"
            />
          ))}
          {(group.memberCount || 0) > 3 && (
            <div className="w-8 h-8 rounded-full border-2 border-[#08090b] bg-surface-container-highest flex items-center justify-center text-xs">
              +{group.memberCount - 3}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <h4 className="font-bold text-lg truncate">{group.name}</h4>
        {group.currency && (
          <span className="text-[10px] font-bold bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant">
            {group.currency}
          </span>
        )}
      </div>

      <p className="text-sm text-on-surface-variant mb-4 truncate">
        {group.description || 'No description'}
      </p>

      <div className="pt-4 border-t border-glass-stroke flex justify-between items-center mb-2">
        <span className="text-xs text-on-surface-variant font-label-caps">GROUP SPENDING</span>
        <span className="font-medium text-sm text-primary">
          {formatCurrency(Number(group.totalExpenses || group.totalSpending || 0), group.currency)}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xs text-on-surface-variant font-label-caps">YOUR BALANCE</span>
        <span className={`font-medium text-sm ${Number(group.netBalance || group.balance || 0) >= 0 ? 'text-neon-lime' : 'text-error'}`}>
          {Number(group.netBalance || group.balance || 0) > 0 ? '+' : ''}{formatCurrency(Number(group.netBalance || group.balance || 0), group.currency)}
        </span>
      </div>
    </GlassPanel>
  );
};

export default GroupCard;
