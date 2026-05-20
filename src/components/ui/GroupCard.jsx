// src/components/ui/GroupCard.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { Users, Trash2 } from 'lucide-react';

import { ROUTES } from '../../constants/routes';
import { GlassPanel } from './GlassCard';
import { formatCurrency } from '../../services/currencyService';
import useCurrencyStore from '../../store/useCurrencyStore';

const GroupCard = ({
  group,
  onDelete,
}) => {
  const navigate = useNavigate();
  const { currency, locale } = useCurrencyStore();

  const controls = useAnimation();

  const [isDeleting, setIsDeleting] =
    React.useState(false);

  const handleOpenGroup = () => {
    if (isDeleting) return;

    navigate(
      ROUTES.GROUP_DETAILS.replace(
        ':id',
        group.id
      )
    );
  };

  const resetCardPosition = async () => {
    await controls.start({
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 30,
      },
    });
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      await controls.start({
        x: -120,
        transition: {
          duration: 0.2,
        },
      });

      await onDelete?.(group.id);
    } catch (error) {

      await resetCardPosition();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[28px]">
      {/* DELETE AREA */}
      <div className="absolute inset-y-0 right-0 w-[120px] flex items-center justify-center">
        <motion.div
          animate={
            !isDeleting
              ? { scale: [1, 1.05, 1] }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
          className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 backdrop-blur-xl flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.25)]"
        >
          {isDeleting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full"
            />
          ) : (
            <Trash2
              size={24}
              className="text-red-500"
            />
          )}
        </motion.div>
      </div>

      {/* CARD */}
      <motion.div
        drag={!isDeleting ? 'x' : false}
        dragListener
        dragMomentum={false}
        dragConstraints={{
          left: -120,
          right: 0,
        }}
        dragElastic={0.12}
        animate={controls}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.985 }}
        onDragEnd={async (_, info) => {
          if (info.offset.x < -60) {
            await handleDelete();
          } else {
            await resetCardPosition();
          }
        }}
        className="relative z-10"
      >
        <GlassPanel
          onClick={handleOpenGroup}
          className="p-7 rounded-[28px] cursor-pointer border border-white/[0.04] hover:border-primary/30 hover:shadow-[0_0_40px_rgba(99,102,241,0.18)] transition-all duration-300 group bg-surface/90 backdrop-blur-xl"
        >
          {/* HEADER */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* AVATAR */}
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary-container to-inverse-primary flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {group?.name
                  ?.slice(0, 2)
                  ?.toUpperCase()}
              </div>

              {/* INFO */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl font-bold text-on-surface group-hover:text-primary transition-colors">
                    {group.name}
                  </h3>

                  <span className="px-2 py-0.5 text-[10px] rounded-md bg-surface-container-high text-on-surface-variant font-medium">
                    {group.currency || currency}
                  </span>
                </div>

                <p className="text-on-surface-variant text-sm">
                  {group.description ||
                    'No description'}
                </p>
              </div>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="border-t border-glass-stroke mb-5"></div>

          {/* STATS */}
          <div className="space-y-3">
            {/* SPENDING */}
            <div className="flex justify-between items-center">
              <span className="font-label-caps text-[11px] text-on-surface-variant">
                GROUP SPENDING
              </span>

              <span className="text-lg font-bold text-on-surface">
                {formatCurrency(
                  Number(
                    group.totalExpenses ||
                    group.totalSpending ||
                    0
                  ),
                  group.currency || currency,
                  locale
                )}
              </span>
            </div>

            {/* BALANCE */}
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
                  group.currency || currency,
                  locale
                )}
              </span>
            </div>

            {/* MEMBERS */}
            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Users size={16} />

                <span className="text-sm">
                  {group.members?.length || 1}{' '}
                  members
                </span>
              </div>

              <span className="text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                View Details →
              </span>
            </div>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
};

export default GroupCard;