// src/components/ui/GroupCard.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import { ROUTES } from '../../constants/routes';

import { GlassPanel } from './GlassCard';

import { Users } from 'lucide-react';

import { formatCurrency } from '../../services/currencyService';

const GroupCard = ({ group }) => {
  const navigate = useNavigate();

  const handleOpenGroup = () => {
    navigate(
      ROUTES.GROUP_DETAILS.replace(':id', group.id)
    );
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <GlassPanel
        onClick={handleOpenGroup}
        className="
          p-7
          rounded-[28px]
          cursor-pointer
          border border-white/[0.04]
          hover:border-primary/30
          hover:shadow-[0_0_40px_rgba(99,102,241,0.18)]
          transition-all
          duration-300
          group
        "
      >
        {/* HEADER */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="
                w-16
                h-16
                rounded-2xl
                bg-gradient-to-br
                from-primary-container
                to-inverse-primary
                flex
                items-center
                justify-center
                text-white
                font-bold
                text-2xl
                shadow-lg
              "
            >
              {group?.name?.slice(0, 2)?.toUpperCase()}
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-bold text-on-surface group-hover:text-primary transition-colors">
                  {group.name}
                </h3>

                <span className="px-2 py-0.5 text-[10px] rounded-md bg-surface-container-high text-on-surface-variant font-medium">
                  {group.currency || 'USD'}
                </span>
              </div>

              <p className="text-on-surface-variant text-sm">
                {group.description || 'No description'}
              </p>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="border-t border-glass-stroke mb-5"></div>

        {/* STATS */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-label-caps text-[11px] text-on-surface-variant">
              GROUP SPENDING
            </span>

            <span className="text-lg font-bold text-on-surface">
              {formatCurrency(
                Number(group.totalExpenses || group.totalSpending || 0),
                group.currency
              )}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-label-caps text-[11px] text-on-surface-variant">
              YOUR BALANCE
            </span>

            <span
              className={`text-lg font-bold ${Number(group.balance || 0) > 0
                  ? 'text-neon-lime'
                  : Number(group.balance || 0) < 0
                    ? 'text-error'
                    : 'text-yellow-400'
                }`}
            >
              {formatCurrency(
                Number(group.balance || 0),
                group.currency
              )}
            </span>
          </div>

          {/* MEMBERS */}
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <Users size={16} />
              <span className="text-sm">
                {group.members?.length || 1} members
              </span>
            </div>

            <span className="text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              View Details →
            </span>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
};

export default GroupCard;