import React, { useState, useRef, useEffect } from 'react';
import { GlassPanel } from './GlassCard';
import { CheckCircle2, Circle, ChevronRight, MoreVertical, CheckCheck } from 'lucide-react';
import { formatCurrency } from '../../services/currencyService';
import useCurrencyStore from '../../store/useCurrencyStore';
import { useAuthStore } from '../../store/authStore';

const SettlementCard = ({ settlement, onClick, onMarkAsSettled }) => {
  const { currency, locale } = useCurrencyStore();
  const { user } = useAuthStore();
  const isCompleted = settlement.status === 'completed' || settlement.isCompleted;
  const isReceiver = settlement.receiverId === user?.id;
  const showMenu = !isCompleted && isReceiver;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <GlassPanel
      className={`p-4 flex items-center justify-between mb-3 cursor-pointer hover:bg-white/[0.02] transition-colors ${isCompleted ? 'opacity-75' : ''} ${menuOpen ? 'relative z-50' : 'relative'}`}
      onClick={() => onClick?.(settlement)}
      role="button"
      tabIndex={0}
      aria-label={`Settlement: ${settlement.payerName || 'Payer'} owes ${settlement.receiverName || 'Receiver'} ${formatCurrency(Number(settlement.amount || 0), settlement.currency || currency, locale)}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(settlement);
        }
      }}
    >
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center ${isCompleted ? 'text-neon-lime' : 'text-on-surface-variant'}`}>
          {isCompleted ? <CheckCircle2 size={24} color='green' /> : <Circle size={24} />}
        </div>
        <div>
          <p className="text-sm">
            <span className="font-bold text-on-surface">
              {settlement.payerName || 'Payer'}
            </span>
            <span className="text-on-surface-variant mx-1">owes</span>
            <span className="font-bold text-on-surface">
              {settlement.receiverName || 'Receiver'}
            </span>
          </p>
          <p className="text-xs text-on-surface-variant">
            {new Date(settlement.createdAt || settlement.date).toLocaleDateString()} {settlement.note && `• ${settlement.note}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`font-bold ${isCompleted ? 'text-neon-lime' : 'text-on-surface'}`}>
          {formatCurrency(Number(settlement.amount || 0), settlement.currency || currency, locale)}
        </span>

        {showMenu && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Settlement options"
            >
              <MoreVertical size={16} className="text-on-surface-variant" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
                <div className="absolute right-0 top-8 z-50 w-48 bg-surface-container border border-glass-stroke rounded-xl shadow-2xl py-1 overflow-hidden">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onMarkAsSettled?.(settlement);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-green-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <CheckCheck size={16} />
                    Mark as Settled
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {!showMenu && (
          <ChevronRight size={16} className="text-on-surface-variant" />
        )}
      </div>
    </GlassPanel>
  );
};

export default SettlementCard;
