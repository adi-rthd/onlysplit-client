import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../services/currencyService';
import useCurrencyStore from '../../store/useCurrencyStore';
import Avatar from '../common/Avatar';

const RemoveMemberConfirmModal = ({ member, isRemoving, onConfirm, onCancel }) => {
  const displayName = `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'this member';

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      style={{ margin: 0, padding: 16, top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={(e) => e.target === e.currentTarget && !isRemoving && onCancel()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-sm glass-card rounded-2xl shadow-2xl p-6"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-red-400" />
          </div>

          <h3 className="text-lg font-bold text-on-surface mb-2">Remove Member</h3>

          <p className="text-sm text-on-surface-variant mb-6">
            Are you sure you want to remove <span className="font-semibold text-on-surface">{displayName}</span> from this group? This action cannot be undone.
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              disabled={isRemoving}
              className="flex-1 py-3 rounded-xl border border-glass-stroke text-on-surface-variant text-sm font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isRemoving}
              className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isRemoving ? <Loader2 size={16} className="animate-spin" /> : 'Remove'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

const MemberBalanceList = ({ members, currency: propCurrency, isOwner, currentUserId, onRemoveMember }) => {
  const { currency: storeCurrency, locale } = useCurrencyStore();
  const [removingId, setRemovingId] = useState(null);
  const [confirmMember, setConfirmMember] = useState(null);

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

  const handleRemove = async () => {
    if (!onRemoveMember || !confirmMember) return;
    const memberId = confirmMember.userId || confirmMember.id;
    setRemovingId(memberId);
    try {
      await onRemoveMember(memberId);
    } finally {
      setRemovingId(null);
      setConfirmMember(null);
    }
  };

  return (
    <>
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

          const memberId = member.userId || member.id;
          const isSelf = memberId === currentUserId;
          const canRemove = isOwner && !isSelf && onRemoveMember;

          return (
            <div key={memberId || index}>
              <div className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar
                    firstName={member.firstName}
                    lastName={member.lastName}
                    avatarUrl={member.avatarUrl}
                    size="sm"
                  />

                  <div>
                    <h4 className="text-sm font-medium text-on-surface">
                      {displayName} {isSelf && <span className="text-xs text-on-surface-variant">(You)</span>}
                    </h4>

                    <p className={`text-xs ${statusColor}`}>
                      {statusText}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
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

                  {canRemove && (
                    <button
                      onClick={() => setConfirmMember(member)}
                      className="ml-2 w-6 h-6 rounded-full flex items-center justify-center text-on-surface-variant hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      aria-label={`Remove ${displayName} from group`}
                      title="Remove member"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {confirmMember && (
        <RemoveMemberConfirmModal
          member={confirmMember}
          isRemoving={removingId === (confirmMember.userId || confirmMember.id)}
          onConfirm={handleRemove}
          onCancel={() => setConfirmMember(null)}
        />
      )}
    </>
  );
};

export default MemberBalanceList;
