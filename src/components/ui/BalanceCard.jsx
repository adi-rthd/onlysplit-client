import React from 'react';
import { GlassPanel } from './GlassCard';

const BalanceCard = ({ member, isCurrentUser }) => {
  const isPositive = Number(member.balance) > 0;
  const isZero = Number(member.balance) === 0;

  let statusText = "Settled up";
  let statusColor = "text-on-surface-variant";

  if (!isZero) {
    if (isPositive) {
      statusText = isCurrentUser ? "Gets back" : "Owes you";
      statusColor = "text-neon-lime";
    } else {
      statusText = isCurrentUser ? "Owes" : "You owe";
      statusColor = "text-error";
    }
  }

  return (
    <GlassPanel className="p-4 flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-container text-white font-bold flex items-center justify-center">
          {member.name?.slice(0, 2)?.toUpperCase() || 'U'}
        </div>
        <div>
          <h4 className="font-medium text-on-surface">
            {member.name} {isCurrentUser && "(You)"}
          </h4>
          <p className={`text-xs ${statusColor}`}>
            {statusText}
          </p>
        </div>
      </div>
      
      <div className={`font-bold ${statusColor}`}>
        ${Math.abs(Number(member.balance || 0)).toFixed(2)}
      </div>
    </GlassPanel>
  );
};

export default BalanceCard;
