import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlassPanel } from '../components/ui/GlassCard';
import { 
  ArrowLeft, 
  Plus, 
  CheckCircle2,
  Users,
  Receipt
} from 'lucide-react';
import { useGroupStore } from '../store/groupStore';
import { useExpenseStore } from '../store/expenseStore';
import { useSettlementStore } from '../store/settlementStore';
import ExpenseCard from '../components/ui/ExpenseCard';
import SettlementCard from '../components/ui/SettlementCard';
import SettleUpModal from '../components/modals/SettleUpModal';
import MemberBalanceList from '../components/ui/MemberBalanceList';
import { formatCurrency } from '../utils/formatCurrency';
import { ROUTES } from '../constants/routes';

const GroupDetailsPage = () => {
  const { id: groupId } = useParams();
  const navigate = useNavigate();

  const { currentGroup, fetchGroupById, isLoading: isGroupLoading } = useGroupStore();
  const { expenses, fetchExpenses, isLoading: isExpensesLoading } = useExpenseStore();
  const { balances, settlements, fetchBalances, fetchSettlements, isLoading: isSettlementsLoading } = useSettlementStore();

  const [activeTab, setActiveTab] = useState('expenses');
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settleReceiverId, setSettleReceiverId] = useState(null);
  const [settleAmount, setSettleAmount] = useState(0);

  useEffect(() => {
    if (groupId) {
      fetchGroupById(groupId);
      fetchExpenses(groupId);
      fetchBalances(groupId);
      fetchSettlements(groupId);
    }
  }, [groupId]);

  const handleSettleUp = (memberId, amount) => {
    setSettleReceiverId(memberId);
    setSettleAmount(Math.abs(amount));
    setShowSettleModal(true);
  };

  if (isGroupLoading && !currentGroup) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!currentGroup) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Group not found</h2>
        <button onClick={() => navigate(ROUTES.GROUPS)} className="text-primary hover:underline">
          Back to Groups
        </button>
      </div>
    );
  }

  const totals = currentGroup?.totals || { totalSpent: 0, youOwe: 0, youAreOwed: 0, settledAmount: 0 };
  const membersList = currentGroup?.members || [];

  return (
    <>
      <header className="mb-8">
        <button 
          onClick={() => navigate(ROUTES.GROUPS)}
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-medium">Back to Groups</span>
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-on-surface flex items-center gap-3">
              {currentGroup.name}
            </h1>
            <p className="text-on-surface-variant mt-1">
              {currentGroup.description || 'No description'}
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={() => setShowSettleModal(true)}
              className="flex-1 md:flex-none bg-surface-container-high border border-glass-stroke text-on-surface px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-white/5 transition-colors font-medium"
            >
              <CheckCircle2 size={18} />
              <span>Settle Up</span>
            </button>
            <button 
              onClick={() => navigate(ROUTES.ADD_EXPENSE)}
              className="flex-1 md:flex-none bg-gradient-to-r from-primary-container to-secondary-container text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity font-medium"
            >
              <Plus size={18} />
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </header>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <GlassPanel className="p-4 md:p-5">
          <span className="font-label-caps text-[10px] md:text-[12px] text-on-surface-variant mb-2 block">
            TOTAL SPENT
          </span>
          <div className="text-xl md:text-2xl font-bold text-on-surface">
            {formatCurrency(Number(totals.totalSpent || 0), currentGroup.currency)}
          </div>
        </GlassPanel>

        <GlassPanel className="p-4 md:p-5 border-l-4 border-l-error">
          <span className="font-label-caps text-[10px] md:text-[12px] text-on-surface-variant mb-2 block">
            YOU OWE
          </span>
          <div className="text-xl md:text-2xl font-bold text-error">
            {formatCurrency(Number(totals.youOwe || 0), currentGroup.currency)}
          </div>
        </GlassPanel>

        <GlassPanel className="p-4 md:p-5 border-l-4 border-l-neon-lime">
          <span className="font-label-caps text-[10px] md:text-[12px] text-on-surface-variant mb-2 block">
            YOU ARE OWED
          </span>
          <div className="text-xl md:text-2xl font-bold text-neon-lime">
            {formatCurrency(Number(totals.youAreOwed || 0), currentGroup.currency)}
          </div>
        </GlassPanel>

        <GlassPanel className="p-4 md:p-5">
          <span className="font-label-caps text-[10px] md:text-[12px] text-on-surface-variant mb-2 block">
            MEMBERS
          </span>
          <div className="text-xl md:text-2xl font-bold text-on-surface">
            {membersList.length}
          </div>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: EXPENSES & SETTLEMENTS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-4 border-b border-glass-stroke pb-2">
            <button 
              className={`pb-2 px-1 font-medium text-sm transition-colors ${activeTab === 'expenses' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              onClick={() => setActiveTab('expenses')}
            >
              Expenses
            </button>
            <button 
              className={`pb-2 px-1 font-medium text-sm transition-colors ${activeTab === 'settlements' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              onClick={() => setActiveTab('settlements')}
            >
              Settlements
            </button>
          </div>

          <div className="min-h-[400px]">
            {activeTab === 'expenses' && (
              isExpensesLoading ? (
                <div className="flex justify-center py-10"><div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div></div>
              ) : expenses?.length > 0 ? (
                <div>
                  {expenses.map(expense => (
                    <ExpenseCard key={expense.id} expense={expense} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-surface-container-low rounded-xl border border-glass-stroke border-dashed">
                  <Receipt className="mx-auto text-on-surface-variant mb-3" size={32} />
                  <p className="text-on-surface font-medium mb-1">No expenses yet</p>
                  <p className="text-on-surface-variant text-sm">Add an expense to start splitting.</p>
                </div>
              )
            )}

            {activeTab === 'settlements' && (
              isSettlementsLoading ? (
                <div className="flex justify-center py-10"><div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div></div>
              ) : settlements?.length > 0 ? (
                <div>
                  {settlements.map(settlement => (
                    <SettlementCard key={settlement.id} settlement={settlement} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-surface-container-low rounded-xl border border-glass-stroke border-dashed">
                  <CheckCircle2 className="mx-auto text-on-surface-variant mb-3" size={32} />
                  <p className="text-on-surface font-medium mb-1">No settlements yet</p>
                  <p className="text-on-surface-variant text-sm">Settle up to clear debts.</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: BALANCES */}
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Users size={18} /> Group Balances
            </h3>
            <GlassPanel className="p-4">
              <MemberBalanceList 
                members={membersList} 
                currency={currentGroup.currency} 
                onSettleUp={handleSettleUp} 
              />
            </GlassPanel>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showSettleModal && (
        <SettleUpModal 
          groupId={groupId}
          receiverId={settleReceiverId}
          defaultAmount={settleAmount}
          onClose={(refresh) => {
            setShowSettleModal(false);
            if (refresh) {
              fetchGroupById(groupId);
              fetchSettlements(groupId);
              fetchBalances(groupId);
            }
          }}
        />
      )}
    </>
  );
};

export default GroupDetailsPage;
