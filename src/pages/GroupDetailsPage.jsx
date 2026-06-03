import React, { useEffect, useState, useMemo } from 'react';
import { ROUTES } from '../constants/routes';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle2, Users, Receipt, Sparkles, Wallet,} from 'lucide-react';

import { GlassPanel } from '../components/ui/GlassCard';
import { useGroupStore } from '../store/groupStore';
import { useExpenseStore } from '../store/expenseStore';
import { useSettlementStore } from '../store/settlementStore';
import { formatCurrency } from '../services/currencyService';

import ExpenseCard from '../components/ui/ExpenseCard';
import SettlementCard from '../components/ui/SettlementCard';
import MemberBalanceList from '../components/ui/MemberBalanceList';
import GlowButton from '../components/ui/GlowButton';
import useCurrencyStore from '../store/useCurrencyStore';



const GroupDetailsPage = () => {
  const { id: groupId } = useParams();

  const navigate = useNavigate();
  const { currency: storeCurrency, locale } = useCurrencyStore();
  const { currentGroup, fetchGroupById, isLoading: isGroupLoading} = useGroupStore();
  const { expenses, fetchExpenses, isLoading: isExpensesLoading} = useExpenseStore();
  const { balances, settlements, fetchBalances, fetchSettlements, regenerateSettlements, isLoading: isSettlementsLoading} = useSettlementStore();
  const [activeTab, setActiveTab] = useState('expenses');


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

  const currency = currentGroup?.currency || storeCurrency || 'INR';

  const totals = useMemo(() => {
    const totalSpent =
      expenses?.reduce(
        (sum, expense) =>
          sum + Number(expense.netBalance || 0),
        0
      ) || 0;

    let youOwe = 0;
    let youAreOwed = 0;

    // balances?.forEach(balance => {
    //   const amount = Number(
    //     balance.amount ||
    //     balance.balance ||
    //     balance.netAmount ||
    //     0
    //   );

    //   if (amount < 0) {
    //     youOwe += Math.abs(amount);
    //   }

    //   if (amount > 0) {
    //     youAreOwed += amount;
    //   }
    // });

    return {
      totalSpent,
      youOwe,
      youAreOwed,
    };
  }, [expenses, balances]);

  const [isRecalculating, setIsRecalculating] = useState(false);

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
    <div className="space-y-8">
      <header>

        <button
          onClick={() =>
            navigate(ROUTES.GROUPS)
          }
          className="mb-4 flex items-center gap-2 text-on-surface-variant transition-colors hover:text-on-surface"
        >
          <ArrowLeft size={16} />

          <span className="text-sm font-medium">
            Back
          </span>
        </button>

        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface">
              {currentGroup.name}
            </h1>

            <p className="mt-2 text-base text-on-surface-variant">
              {currentGroup.description ||
                'No description'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <GlowButton
              className="min-w-[140px] h-[76px] border border-[#4F46FF]"
              icon={Sparkles}
              onClick={handleRecalculate}
              isLoading={isRecalculating}
            >
              Recalculate
            </GlowButton>
            <GlowButton
              className='min-w-[140px] h-[76px] border border-[#4F46FF]'
              icon={Plus}
              onClick={() =>
                navigate(ROUTES.INVITE_MODAL.replace(
                  ':id',
                  groupId))
              }
            >Invite
            </GlowButton>
            <GlowButton
              className='min-w-[140px] h-[76px] border border-[#4F46FF]'
              icon={Plus}
              onClick={() =>
                navigate(ROUTES.ADD_EXPENSE.replace(
                  ':id',
                  groupId))
              }
            >Add Expense
            </GlowButton>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <GlassPanel className="rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">
            Total Spent
          </p>

          <h2 className="mt-4 text-4xl font-black text-on-surface">
            {formatCurrency(
              totals.totalSpent,
              currency,
              locale
            )}
          </h2>
        </GlassPanel>

        <GlassPanel className="rounded-3xl border border-error/20 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">
            You Owe
          </p>

          <h2 className="mt-4 text-4xl font-black text-error">
            {formatCurrency(
              totals.youOwe,
              currency,
              locale
            )}
          </h2>
        </GlassPanel>

        <GlassPanel className="rounded-3xl border border-neon-lime/20 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">
            You Are Owed
          </p>

          <h2 className="mt-4 text-4xl font-black text-neon-lime">
            {formatCurrency(
              totals.youAreOwed,
              currency,
              locale
            )}
          </h2>
        </GlassPanel>

        <GlassPanel className="rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">
            Members
          </p>

          <h2 className="mt-4 text-4xl font-black text-on-surface">
            {balances?.length || 0}
          </h2>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="mb-6 flex items-center gap-6 border-b border-white/10">
            <button
              onClick={() =>
                setActiveTab('expenses')
              }
              className={`pb-3 text-sm font-semibold transition-all ${activeTab === 'expenses'
                ? 'border-b-2 border-primary text-primary'
                : 'text-on-surface-variant'
                }`}
            >
              Expenses
            </button>

            <button
              onClick={() =>
                setActiveTab('settlements')
              }
              className={`pb-3 text-sm font-semibold transition-all ${activeTab === 'settlements'
                ? 'border-b-2 border-primary text-primary'
                : 'text-on-surface-variant'
                }`}
            >
              Settlements
            </button>
          </div>

          {activeTab === 'expenses' && (
            <div className="space-y-5">
              {isExpensesLoading ? (
                <div className="flex justify-center py-16">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : expenses?.length > 0 ? (
                expenses.map(expense => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                  />
                ))
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
    </div>
  );
};

export default GroupDetailsPage;