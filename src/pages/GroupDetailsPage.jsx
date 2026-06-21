import React, { useEffect, useState, useMemo } from 'react';
import { ROUTES } from '../constants/routes';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users, Receipt, Sparkles, Wallet, UserPlus, Search, SortAsc, X, RefreshCw, Pencil } from 'lucide-react';

import { GlassPanel } from '../components/ui/GlassCard';
import { useGroupStore } from '../store/groupStore';
import { useExpenseStore } from '../store/expenseStore';
import { useSettlementStore } from '../store/settlementStore';
import { formatCurrency } from '../services/currencyService';
import { useAuthStore } from '../store/authStore';

import ExpenseCard from '../components/ui/ExpenseCard';
import SettlementCard from '../components/ui/SettlementCard';
import MemberBalanceList from '../components/ui/MemberBalanceList';
import useCurrencyStore from '../store/useCurrencyStore';
import ExpenseDetailsModal from '../components/modals/ExpenseDetailsModal';
import EditGroupModal from '../components/modals/EditGroupModal';
import EditExpenseModal from '../components/modals/EditExpenseModal';
import { AnimatePresence } from 'framer-motion';
import { useGroupSignalR } from '../hooks/useSignalR';



const GroupDetailsPage = () => {
  const { id: groupId } = useParams();
  const { user } = useAuthStore();

  const navigate = useNavigate();
  const { currency: storeCurrency, locale } = useCurrencyStore();
  const { currentGroup, fetchGroupById, isLoading: isGroupLoading } = useGroupStore();
  const { expenses, fetchExpenses, isLoading: isExpensesLoading } = useExpenseStore();
  const { balances, settlements, fetchBalances, fetchSettlements, regenerateSettlements, isLoading: isSettlementsLoading } = useSettlementStore();
  const [activeTab, setActiveTab] = useState('expenses');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseSearch, setExpenseSearch] = useState('');
  const [showExpenseSearch, setShowExpenseSearch] = useState(false);
  const [expenseSort, setExpenseSort] = useState('recent');
  const [showExpenseSort, setShowExpenseSort] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Check if current user is the group owner
  const isOwner = currentGroup?.createdBy === user?.id || currentGroup?.createdById === user?.id || currentGroup?.ownerId === user?.id;

  // Debug: check in console what values are being compared
  useEffect(() => {
    if (currentGroup && user) {
      console.log('[GroupDetails] Owner check:', {
        'currentGroup.createdBy': currentGroup.createdBy,
        'currentGroup.createdById': currentGroup.createdById,
        'currentGroup.ownerId': currentGroup.ownerId,
        'user.id': user.id,
        isOwner,
      });
    }
  }, [currentGroup, user, isOwner]);

  useEffect(() => {
    if (!groupId) return;

    const loadData = async () => {
      await Promise.all([
        fetchGroupById(groupId),
        fetchExpenses(groupId),
        fetchBalances(groupId),
        fetchSettlements(groupId),
      ]);
    };

    loadData();
  }, [groupId]);

  // ─── Real-time updates via SignalR ─────────────────────────────────
  useGroupSignalR(groupId, {
    ExpenseAdded: () => fetchExpenses(groupId),
    ExpenseUpdated: () => fetchExpenses(groupId),
    ExpenseDeleted: () => fetchExpenses(groupId),
    BalanceUpdated: () => {
      fetchBalances(groupId);
      fetchSettlements(groupId);
    },
    MemberJoined: () => fetchGroupById(groupId),
    MemberRemoved: () => fetchGroupById(groupId),
    GroupUpdated: () => fetchGroupById(groupId),
    SettlementUpdated: () => fetchSettlements(groupId),
  });

  const currency = currentGroup?.currency || storeCurrency || 'INR';

  const totals = useMemo(() => {
    const totalSpent =
      expenses?.reduce(
        (sum, expense) =>
          sum + Number(expense.amount || 0),
        0
      ) || 0;

    const myBalance = balances.find(
      x => x.userId === user.id
    );

    let youOwe = 0;
    let youAreOwed = 0;

    if (myBalance) {
      if (myBalance.netBalance > 0) {
        youAreOwed = myBalance.netBalance;
      } else {
        youOwe = Math.abs(myBalance.netBalance);
      }
    }

    return {
      totalSpent,
      youOwe,
      youAreOwed,
    };
  }, [expenses, balances]);

  const [isRecalculating, setIsRecalculating] = useState(false);

  // Filtered & sorted expenses
  const filteredExpenses = useMemo(() => {
    let result = expenses || [];

    if (expenseSearch.trim()) {
      const term = expenseSearch.toLowerCase();
      result = result.filter(
        (e) =>
          e.title?.toLowerCase().includes(term) ||
          e.description?.toLowerCase().includes(term) ||
          e.paidByName?.toLowerCase().includes(term)
      );
    }

    result = [...result].sort((a, b) => {
      switch (expenseSort) {
        case 'amount':
          return Number(b.amount || 0) - Number(a.amount || 0);
        case 'name':
          return (a.title || '').localeCompare(b.title || '');
        case 'recent':
        default:
          return new Date(b.expenseDate || b.createdAt || 0) - new Date(a.expenseDate || a.createdAt || 0);
      }
    });

    return result;
  }, [expenses, expenseSearch, expenseSort]);

  const handleRecalculate = async () => {
    try {
      setIsRecalculating(true);

      await regenerateSettlements(groupId);

      await fetchBalances(groupId);

      await fetchSettlements(groupId);
    } finally {
      setIsRecalculating(false);
    }
  };

  if (isGroupLoading && !currentGroup) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!currentGroup) {
    return (
      <div className="py-20 text-center">
        <h2 className="mb-2 text-2xl font-bold">
          Group not found
        </h2>

        <button
          onClick={() =>
            navigate(ROUTES.GROUPS)
          }
          className="text-primary hover:underline"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER — back + title left, buttons top-right */}
      <header>
        <div className="flex items-start justify-between gap-4">
          <div>
            <button
              onClick={() => navigate(ROUTES.GROUPS)}
              className="mb-2 flex items-center gap-1.5 text-on-surface-variant transition-colors hover:text-on-surface text-sm"
            >
              <ArrowLeft size={14} />
              Back
            </button>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
              {currentGroup.name}
            </h1>

            <p className="mt-1 text-sm text-on-surface-variant">
              {currentGroup.description || 'No description'}
            </p>
          </div>

          {/* Action buttons — top right */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="w-9 h-9 md:w-auto md:h-auto md:px-3 md:py-2 rounded-xl glass-button text-on-surface flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={16} className={`text-primary ${isRecalculating ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline text-xs font-medium">Recalculate</span>
            </button>

            {isOwner && (
              <button
                onClick={() => setShowEditModal(true)}
                className="w-9 h-9 md:w-auto md:h-auto md:px-3 md:py-2 rounded-xl glass-button text-on-surface flex items-center justify-center gap-2"
              >
                <Pencil size={16} className="text-primary" />
                <span className="hidden md:inline text-xs font-medium">Edit</span>
              </button>
            )}

            <button
              onClick={() => navigate(ROUTES.INVITE_MODAL.replace(':id', groupId))}
              className="w-9 h-9 md:w-auto md:h-auto md:px-3 md:py-2 rounded-xl glass-button text-on-surface flex items-center justify-center gap-2"
            >
              <UserPlus size={16} className="text-primary" />
              <span className="hidden md:inline text-xs font-medium">Invite</span>
            </button>

            <button
              onClick={() => navigate(ROUTES.ADD_EXPENSE.replace(':id', groupId))}
              className="w-9 h-9 md:w-auto md:h-auto md:px-3 md:py-2 rounded-xl glass-button text-on-surface flex items-center justify-center gap-2"
            >
              <Plus size={16} className="text-primary" />
              <span className="hidden md:inline text-xs font-medium">Add Expense</span>
            </button>
          </div>
        </div>
      </header>

      {/* STATS — compact, consistent */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <GlassPanel className="rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
            Total Spent
          </p>
          <h2 className="mt-2 text-xl md:text-2xl font-bold text-on-surface tabular-nums">
            {formatCurrency(totals.totalSpent, currency, locale)}
          </h2>
        </GlassPanel>

        <GlassPanel className="rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
            You Owe
          </p>
          <h2 className="mt-2 text-xl md:text-2xl font-bold text-error tabular-nums">
            {formatCurrency(totals.youOwe, currency, locale)}
          </h2>
        </GlassPanel>

        <GlassPanel className="rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
            You Are Owed
          </p>
          <h2 className="mt-2 text-xl md:text-2xl font-bold text-green-400 tabular-nums">
            {formatCurrency(totals.youAreOwed, currency, locale)}
          </h2>
        </GlassPanel>

        <GlassPanel className="rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
            Members
          </p>
          <h2 className="mt-2 text-xl md:text-2xl font-bold text-on-surface">
            {balances?.length || 0}
          </h2>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {/* Tab bar + search/sort */}
          <div className="mb-5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveTab('expenses')}
                className={`pb-3 text-sm font-semibold transition-all ${activeTab === 'expenses'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-on-surface-variant'
                  }`}
              >
                Expenses
              </button>

              <button
                onClick={() => setActiveTab('settlements')}
                className={`pb-3 text-sm font-semibold transition-all ${activeTab === 'settlements'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-on-surface-variant'
                  }`}
              >
                Settlements
              </button>
            </div>

            {/* Search + Sort for expenses */}
            {activeTab === 'expenses' && (
              <div className="flex items-center gap-1.5 pb-2">
                {showExpenseSearch ? (
                  <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/50 rounded-lg px-2.5 py-1.5">
                    <Search size={13} className="text-on-surface-variant" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search..."
                      value={expenseSearch}
                      onChange={(e) => setExpenseSearch(e.target.value)}
                      className="w-28 md:w-36 bg-transparent border-none ring-0 focus:ring-0 outline-none text-xs text-on-surface placeholder:text-on-surface-variant/50"
                    />
                    <button onClick={() => { setExpenseSearch(''); setShowExpenseSearch(false); }}>
                      <X size={12} className="text-on-surface-variant" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setShowExpenseSearch(true)} className="w-8 h-8 rounded-lg glass-button flex items-center justify-center">
                    <Search size={14} className="text-on-surface-variant" />
                  </button>
                )}

                <div className="relative">
                  <button onClick={() => setShowExpenseSort(!showExpenseSort)} className="w-8 h-8 rounded-lg glass-button flex items-center justify-center">
                    <SortAsc size={14} className="text-on-surface-variant" />
                  </button>
                  {showExpenseSort && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowExpenseSort(false)} />
                      <div className="absolute right-0 top-10 z-50 w-36 bg-surface-container border border-glass-stroke rounded-xl shadow-2xl py-1">
                        {[
                          { value: 'recent', label: 'Recent' },
                          { value: 'amount', label: 'Amount' },
                          { value: 'name', label: 'Name' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => { setExpenseSort(opt.value); setShowExpenseSort(false); }}
                            className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                              expenseSort === opt.value ? 'text-primary bg-primary/5 font-medium' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
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
            )}
          </div>

          <AnimatePresence>
            {selectedExpense && (
              <ExpenseDetailsModal
                expense={selectedExpense}
                onClose={() => setSelectedExpense(null)}
                onEdit={(exp) => {
                  setSelectedExpense(null);
                  setEditingExpense(exp);
                }}
              />
            )}
          </AnimatePresence>

          {activeTab === 'expenses' && (
            <div className="space-y-4">
              {isExpensesLoading ? (
                <div className="flex justify-center py-16">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : filteredExpenses?.length > 0 ? (
                filteredExpenses.map(expense => (
                  <ExpenseCard
                    onClick={() => setSelectedExpense(expense)}
                    key={expense.id}
                    expense={expense}
                  />
                ))
              ) : expenses?.length > 0 && expenseSearch ? (
                <div className="py-10 text-center text-sm text-on-surface-variant">
                  No expenses match "{expenseSearch}"
                </div>
              ) : (
                <GlassPanel className="rounded-3xl border border-dashed border-white/10 py-16 text-center">
                  <Receipt
                    size={40}
                    className="mx-auto mb-4 text-on-surface-variant"
                  />

                  <h3 className="text-lg font-bold text-on-surface">
                    No expenses yet
                  </h3>

                  <p className="mt-2 text-sm text-on-surface-variant">
                    Add your first expense.
                  </p>
                </GlassPanel>
              )}
            </div>
          )}

          {activeTab === 'settlements' && (
            <div className="space-y-5">
              {isSettlementsLoading ? (
                <div className="flex justify-center py-16">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : settlements?.length > 0 ? (
                settlements.map(
                  settlement => (
                    <SettlementCard
                      key={settlement.id}
                      settlement={
                        settlement
                      }
                    />
                  )
                )
              ) : (
                <GlassPanel className="rounded-3xl border border-dashed border-white/10 py-16 text-center">
                  <Wallet
                    size={40}
                    className="mx-auto mb-4 text-on-surface-variant"
                  />

                  <h3 className="text-lg font-bold text-on-surface">
                    No pending settlements
                  </h3>

                  <p className="mt-2 text-sm text-on-surface-variant">
                    Everyone is settled up.
                  </p>
                </GlassPanel>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Users size={18} />

            Group Balances
          </h3>

          <GlassPanel className="rounded-3xl p-4">
            <MemberBalanceList
              members={balances || []}
              currency={currency}
            />
          </GlassPanel>
        </div>
      </div>

      {/* Edit Group Modal — only rendered for owner */}
      {showEditModal && (
        <EditGroupModal
          group={currentGroup}
          onClose={() => setShowEditModal(false)}
          onUpdated={() => fetchGroupById(groupId)}
        />
      )}

      {/* Edit Expense Modal */}
      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          groupId={groupId}
          onClose={() => setEditingExpense(null)}
          onUpdated={() => {
            fetchExpenses(groupId);
            fetchBalances(groupId);
            fetchSettlements(groupId);
          }}
        />
      )}
    </div>
  );
};

export default GroupDetailsPage;