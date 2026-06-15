import React, { useEffect, useMemo, useState } from 'react';
import { ROUTES } from '../constants/routes';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Utensils, UserPlus, Mail, ChevronRight, Search, SortAsc, X, Trash2 } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';

import { useGroupStore } from '../store/groupStore';
import { formatCurrency } from '../services/currencyService';
import { useInvitationStore } from '../store/groupInvitationStore';
import groupService from '../services/groupService';
import useCurrencyStore from '../store/useCurrencyStore';
import ConfirmModal from '../components/modals/ConfirmModal';

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'spending', label: 'Spending' },
  { value: 'members', label: 'Members' },
  { value: 'recent', label: 'Recent' },
];

const GroupsPage = () => {
  const navigate = useNavigate();
  const { currency, locale } = useCurrencyStore();
  const { groups, isLoading, fetchGroups } = useGroupStore();
  const { invitations, fetchMyInvitations } = useInvitationStore();

  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        fetchGroups(),
        fetchMyInvitations(),
      ]);
    };
    init();
  }, []);

  const handleDeleteGroup = async (groupId) => {
    try {
      await groupService.deleteGroup(groupId);
      await fetchGroups();
    } catch (err) {
      console.error('Failed to delete group');
    }
  };

  const totalGroups = groups?.length || 0;

  const totalSpending = useMemo(() => {
    if (!groups?.length) return 0;
    return groups.reduce(
      (acc, group) => acc + Number(group.totalExpenses || group.totalSpending || 0),
      0
    );
  }, [groups]);

  // Filtered and sorted groups
  const filteredGroups = useMemo(() => {
    let result = groups || [];

    // Search filter
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(
        (g) =>
          g.name?.toLowerCase().includes(term) ||
          g.description?.toLowerCase().includes(term) ||
          g.currency?.toLowerCase().includes(term)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'spending':
          return Number(b.totalExpenses || b.totalSpending || 0) - Number(a.totalExpenses || a.totalSpending || 0);
        case 'members':
          return (b.members?.length || 0) - (a.members?.length || 0);
        case 'recent':
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

    return result;
  }, [groups, search, sortBy]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-on-surface">Your Groups</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">Manage your shared expenses and groups.</p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate(ROUTES.CREATE_GROUP)}
            className="w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2.5 rounded-xl glass-button text-on-surface flex items-center justify-center gap-2"
          >
            <Plus size={18} className="text-primary" />
            <span className="hidden md:inline text-sm font-medium">Create Group</span>
          </button>

          <button
            onClick={() => navigate(ROUTES.FRIEND_MODAL)}
            className="w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2.5 rounded-xl glass-button text-on-surface flex items-center justify-center gap-2"
          >
            <UserPlus size={18} className="text-primary" />
            <span className="hidden md:inline text-sm font-medium">Add Friends</span>
          </button>

          <button
            onClick={() => navigate(ROUTES.INVITE_MODAL.replace(':id', 'bell'))}
            className="relative w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2.5 rounded-xl glass-button text-on-surface flex items-center justify-center gap-2"
          >
            <Mail size={18} className="text-primary" />
            <span className="hidden md:inline text-sm font-medium">Invites</span>
            {invitations?.length > 0 && (
              <span className="absolute -top-1 -right-1 md:static md:ml-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                {invitations.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* STATS — compact row, more data on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">Active Groups</span>
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users size={14} className="text-primary" />
            </div>
          </div>
          <div className="text-xl font-bold text-on-surface">
            {isLoading ? '--' : totalGroups}
          </div>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">Total Spending</span>
            <div className="w-7 h-7 rounded-lg bg-error/10 flex items-center justify-center">
              <Utensils size={14} className="text-error" />
            </div>
          </div>
          <div className="text-xl font-bold text-on-surface tabular-nums">
            {isLoading ? '--' : formatCurrency(totalSpending, currency, locale)}
          </div>
        </div>

        <div className="hidden lg:block bg-surface-container-low rounded-2xl p-4 border border-outline-variant/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">Total Members</span>
            <div className="w-7 h-7 rounded-lg bg-secondary-container/10 flex items-center justify-center">
              <UserPlus size={14} className="text-secondary" />
            </div>
          </div>
          <div className="text-xl font-bold text-on-surface">
            {isLoading ? '--' : groups?.reduce((acc, g) => acc + (g.members?.length || 1), 0)}
          </div>
        </div>

        <div className="hidden lg:block bg-surface-container-low rounded-2xl p-4 border border-outline-variant/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">Top Expenser</span>
            <div className="w-7 h-7 rounded-lg bg-green-400/10 flex items-center justify-center">
              <Utensils size={14} className="text-green-400" />
            </div>
          </div>
          <div className="text-xl font-bold text-on-surface truncate">
            {isLoading ? '--' : (() => {
              if (!groups?.length) return '--';
              const top = [...groups].sort((a, b) => Number(b.totalExpenses || b.totalSpending || 0) - Number(a.totalExpenses || a.totalSpending || 0))[0];
              return top?.name || '--';
            })()}
          </div>
        </div>
      </div>

      {/* SEARCH + SORT BAR */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-on-surface">All Groups</h2>

        <div className="flex items-center gap-2">
          {/* Search toggle */}
          {search !== null && showSearch ? (
            <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/50 rounded-xl px-3 py-2 animate-in fade-in">
              <Search size={14} className="text-on-surface-variant shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-32 md:w-48 bg-transparent border-none ring-0 focus:ring-0 outline-none text-sm text-on-surface placeholder:text-on-surface-variant/50"
              />
              <button onClick={() => { setSearch(''); setShowSearch(false); }} className="text-on-surface-variant hover:text-on-surface">
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="w-9 h-9 rounded-xl glass-button flex items-center justify-center"
            >
              <Search size={15} className="text-on-surface-variant" />
            </button>
          )}

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="w-9 h-9 rounded-xl glass-button flex items-center justify-center"
            >
              <SortAsc size={15} className="text-on-surface-variant" />
            </button>

            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                <div className="absolute right-0 top-11 z-50 w-40 bg-surface-container border border-glass-stroke rounded-xl shadow-2xl py-1 overflow-hidden">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortBy(opt.value);
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        sortBy === opt.value
                          ? 'text-primary bg-primary/5 font-medium'
                          : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* GROUPS LIST */}
      <div>

        {isLoading ? (
          <div className="py-10 flex justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : !groups || groups.length === 0 ? (
          <div className="bg-surface-container-low rounded-2xl p-10 border border-dashed border-outline-variant/50 text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center mx-auto mb-3">
              <Users size={20} className="text-on-surface-variant" />
            </div>
            <p className="text-sm font-medium text-on-surface mb-1">No groups yet</p>
            <p className="text-xs text-on-surface-variant">Create a group to start splitting expenses</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-on-surface-variant">No groups match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGroups.map((group) => {
              const spending = Number(group.totalExpenses || group.totalSpending || 0);
              const balance = Number(group.balance || 0);
              const memberCount = group.members?.length || 1;
              const initials = group.name?.slice(0, 2)?.toUpperCase() || 'GR';

              return (
                <GroupRow
                  key={group.id}
                  group={group}
                  initials={initials}
                  spending={spending}
                  balance={balance}
                  memberCount={memberCount}
                  currency={currency}
                  locale={locale}
                  onOpen={() => navigate(ROUTES.GROUP_DETAILS.replace(':id', group.id))}
                  onDelete={() => setDeleteTarget(group)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Group"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will permanently remove all expenses and settlements.`}
        confirmText="Delete Group"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await handleDeleteGroup(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />

      {/* MOBILE FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate(ROUTES.CREATE_GROUP)}
        className="md:hidden fixed bottom-24 right-5 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(124,108,255,0.4)] z-[60]"
      >
        <Plus className="text-white" size={22} />
      </motion.button>
    </div>
  );
};

// Swipe-to-delete group row
const GroupRow = ({ group, initials, spending, balance, memberCount, currency, locale, onOpen, onDelete }) => {
  const controls = useAnimation();

  const resetPosition = () => {
    controls.start({ x: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } });
  };

  return (
    <div className="relative overflow-hidden rounded-[28px]">
      {/* Delete background */}
      <div className="absolute inset-y-0 right-0 w-24 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 backdrop-blur-xl flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)]"
        >
          <Trash2 size={20} className="text-red-400" />
        </motion.div>
      </div>

      {/* Swipeable card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -96, right: 0 }}
        dragElastic={0.1}
        dragMomentum={false}
        animate={controls}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) {
            onDelete();
            resetPosition();
          } else {
            resetPosition();
          }
        }}
        onClick={onOpen}
        className="relative z-10 glass-panel rounded-[28px] p-6 cursor-pointer border border-white/[0.04] hover:border-primary/30 hover:shadow-[0_0_40px_rgba(99,102,241,0.18)] transition-all duration-300 bg-surface/90 backdrop-blur-xl group"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-primary-container to-inverse-primary flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">{group.name}</h3>
                <span className="text-[10px] text-on-surface-variant bg-surface-container-high px-1.5 py-0.5 rounded">
                  {group.currency || currency}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                {group.description || 'No description'}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-glass-stroke mb-4" />

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Spending</span>
            <p className="text-sm font-bold text-on-surface tabular-nums mt-0.5">
              {formatCurrency(spending, group.currency || currency, locale)}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Balance</span>
            <p className={`text-sm font-bold tabular-nums mt-0.5 ${balance > 0 ? 'text-green-400' : balance < 0 ? 'text-orange-300' : 'text-on-surface-variant'}`}>
              {balance === 0 ? '—' : (balance > 0 ? '+' : '') + formatCurrency(balance, group.currency || currency, locale)}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <Users size={14} />
            <span className="text-xs">{memberCount}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GroupsPage;
