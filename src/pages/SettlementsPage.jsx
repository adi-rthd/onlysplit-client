import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  History,
  Sparkles,
  Wallet,
} from 'lucide-react';

import { GlassPanel } from '../components/ui/GlassCard';

import settlementService from '../services/settlementService';
import paymentService from '../services/paymentService';

import { useGroupStore } from '../store/groupStore';
import { useAuthStore } from '../store/authStore';
import GlowButton from '../components/ui/GlowButton';

const SettlementsPage = () => {
  const { currentGroup, groups, fetchGroups } = useGroupStore();
  const user = useAuthStore((state) => state.user);

  const [settlements, setSettlements] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [payingKey, setPayingKey] = useState(null); // Changed to track the grouped key
  
  const [activeTab, setActiveTab] = useState('pending');

  const groupId = currentGroup?.id || groups?.[0]?.id;

  const pendingSettlements = useMemo(() => {
    return settlements.filter(
      (settlement) =>
        !settlement.status || settlement.status?.toLowerCase() === 'pending'
    );
  }, [settlements]);

  const completedPayments = useMemo(() => {
    return paymentHistory || [];
  }, [paymentHistory]);

  const myPendingSettlements = useMemo(() => {
    return pendingSettlements.filter(
      (settlement) =>
        settlement.payerId === user?.id || settlement.receiverId === user?.id
    );
  }, [pendingSettlements, user]);

  // ✅ NEW FIX: Group the settlements by Payer and Receiver so they merge in the UI
  const groupedPendingSettlements = useMemo(() => {
    const grouped = {};

    myPendingSettlements.forEach((settlement) => {
      // Create a unique key for this pair of users
      const pairKey = `${settlement.payerId}-${settlement.receiverId}`;

      if (!grouped[pairKey]) {
        grouped[pairKey] = {
          ...settlement,
          amount: Number(settlement.amount),
          // Store ALL database IDs associated with this grouped debt
          settlementIds: [settlement.id], 
        };
      } else {
        grouped[pairKey].amount += Number(settlement.amount);
        if (settlement.id) {
          grouped[pairKey].settlementIds.push(settlement.id);
        }
      }
    });

    // Convert back to array and sort by highest amount
    return Object.values(grouped).sort((a, b) => b.amount - a.amount);
  }, [myPendingSettlements]);

  const totalYouOwe = useMemo(() => {
    return groupedPendingSettlements.reduce((total, settlement) => {
      if (settlement.payerId === user?.id) {
        return total + settlement.amount;
      }
      return total;
    }, 0);
  }, [groupedPendingSettlements, user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [settlementsResponse, paymentHistoryResponse] = await Promise.all([
        settlementService.getGlobalPendingSettlements(),
        paymentService.getPaymentHistory(),
      ]);

      setSettlements(settlementsResponse || []);
      setPaymentHistory(paymentHistoryResponse || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      if (!groups?.length) await fetchGroups();
    };
    initialize();
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const handleRegenerate = async () => {
    if (!groupId) {
      toast.error('No active group to recalculate.');
      return;
    }
    try {
      setIsRefreshing(true);
      await settlementService.regenerateSettlements(groupId);
      toast.success('Settlements recalculated!');
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to recalculate settlements.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePayment = async (groupedSettlement) => {
    const pairKey = `${groupedSettlement.payerId}-${groupedSettlement.receiverId}`;
    
    try {
      setPayingKey(pairKey);

      // ✅ PASSING AN ARRAY: We now send all underlying IDs to Razorpay
      const order = await paymentService.createOrder(groupedSettlement.settlementIds);

      if (!order) {
        setPayingKey(null);
        return;
      }

      paymentService.openCheckout({
        order,
        onSuccess: async (response) => {
          let payment = {
            paymentId: order.paymentId,
            razorpayOrderId: order.razorpayOrderId,
            razorpayPaymentId: order.paymentId,
            razorpaySignature: response.razorpay_signature,
          };
          const verified = await paymentService.verifyPayment(payment);

          if (!verified) return;

          toast.success('Settlement completed successfully!');
          await loadData();
        },
        onFailure: (message) => {
          toast.error(message || 'Payment failed.');
        },
      });
    } catch (error) {
      console.error(error);
      toast.error('Unable to process payment.');
    } finally {
      setPayingKey(null);
    }
  };

  return (
    <div className="space-y-4 md:space-y-8 pb-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-on-surface">Settlements</h1>
          <p className="mt-1 text-xs md:text-sm text-on-surface-variant">Track pending payments and history.</p>
        </div>
        {/* <GlowButton
          className="w-full sm:w-auto min-w-[180px] h-[48px] md:h-[56px] border border-[#4F46FF] text-sm"
          icon={Sparkles}
          onClick={handleRegenerate}
          isLoading={isRefreshing}
        >
          Recalculate
        </GlowButton> */}
      </header>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <GlassPanel className="rounded-2xl md:rounded-3xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
            <div>
              <p className="text-xs md:text-sm text-on-surface-variant">Total Pending</p>
              <h2 className="mt-1 md:mt-2 text-xl md:text-3xl font-bold text-on-surface">₹{totalYouOwe.toFixed(0)}</h2>
              <p className="mt-1 text-[10px] md:text-xs font-medium text-error">You owe</p>
            </div>
            <div className="hidden md:flex rounded-xl bg-error/10 p-3 text-error">
              <Wallet size={20} />
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="rounded-2xl md:rounded-3xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
            <div>
              <p className="text-xs md:text-sm text-on-surface-variant">Total History</p>
              <h2 className="mt-1 md:mt-2 text-xl md:text-3xl font-bold text-on-surface">{completedPayments.length}</h2>
              <p className="mt-1 text-[10px] md:text-xs font-medium text-green-400">Transactions</p>
            </div>
            <div className="hidden md:flex rounded-xl bg-green-400/10 p-3 text-green-400">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </GlassPanel>
      </div>

      <GlassPanel className="rounded-2xl md:rounded-3xl p-3 md:p-6 overflow-hidden">
        <div className="flex border-b border-white/5 mb-4 md:mb-6 overflow-x-auto no-scrollbar gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`relative flex items-center gap-1.5 md:gap-2 px-2 py-3 md:py-4 text-sm md:text-[17px] font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'pending' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Pending
            <span className={`flex items-center justify-center h-4 md:h-5 min-w-[16px] md:min-w-[20px] px-1 md:px-1.5 rounded-full text-[10px] md:text-[11px] font-bold ${
              activeTab === 'pending' ? 'bg-primary text-white' : 'bg-white/10 text-on-surface-variant'
            }`}>
              {groupedPendingSettlements.length}
            </span>
            {activeTab === 'pending' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-t-full" />}
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`relative flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-3 md:py-4 text-sm md:text-[17px] font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'completed' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            History
            <span className={`flex items-center justify-center h-4 md:h-5 min-w-[16px] md:min-w-[20px] px-1 md:px-1.5 rounded-full text-[10px] md:text-[11px] font-bold ${
              activeTab === 'completed' ? 'bg-primary text-white' : 'bg-white/10 text-on-surface-variant'
            }`}>
              {completedPayments.length}
            </span>
            {activeTab === 'completed' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-t-full" />}
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* PENDING TAB */}
            {activeTab === 'pending' && (
              groupedPendingSettlements.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {/* We map over the GROUPED settlements now! */}
                  {groupedPendingSettlements.map((settlement, index) => {
                    const iAmPayer = settlement.payerId === user?.id;
                    const pairKey = `${settlement.payerId}-${settlement.receiverId}`;

                    return (
                      <div
                        key={pairKey}
                        className="group flex flex-row items-center justify-between py-3 md:py-4 gap-2 hover:bg-white/[0.02] px-1 md:px-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`flex h-10 w-10 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-full ${
                              iAmPayer ? 'bg-error/15 text-error' : 'bg-green-400/15 text-green-400'
                            }`}
                          >
                            <CreditCard size={18} className="scale-90 md:scale-100" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-on-surface-variant mb-0.5 md:mb-1">
                              <span className="font-medium text-on-surface truncate max-w-[60px] xs:max-w-[80px] sm:max-w-[150px]">
                                {settlement.payerName || 'Unknown'}
                              </span>
                              <ArrowRight size={10} className="shrink-0" />
                              <span className="font-medium text-on-surface truncate max-w-[60px] xs:max-w-[80px] sm:max-w-[150px]">
                                {settlement.receiverName || 'Unknown'}
                              </span>
                            </div>
                            <div className="flex items-baseline gap-1.5 md:gap-2">
                              <span className="text-base md:text-xl font-bold text-on-surface">
                                ₹{settlement.amount.toFixed(2)}
                              </span>
                              <span className={`text-[9px] md:text-[10px] uppercase tracking-wider font-bold ${iAmPayer ? 'text-error' : 'text-green-400'}`}>
                                {iAmPayer ? 'You Owe' : 'Owes You'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 ml-2">
                          {iAmPayer ? (
                            settlement.settlementIds.length > 0 ? (
                              <button
                                onClick={() => handlePayment(settlement)}
                                disabled={payingKey === pairKey}
                                className="flex items-center justify-center gap-1.5 rounded-lg bg-primary/20 hover:bg-primary text-primary hover:text-white px-3 py-1.5 md:px-5 md:py-2 text-xs md:text-sm font-semibold transition-all disabled:opacity-50 border border-primary/20"
                              >
                                {payingKey === pairKey ? (
                                  <div className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                ) : (
                                  'Pay'
                                )}
                              </button>
                            ) : null
                          ) : (
                            <div className="text-center text-[10px] md:text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 md:px-3 md:py-1.5 rounded-lg border border-green-400/10">
                              Waiting
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 md:py-16 text-center">
                  <CheckCircle2 size={40} className="mb-3 md:mb-4 text-green-400/50 md:scale-110" />
                  <h3 className="text-base md:text-lg font-bold text-on-surface">You are all settled up!</h3>
                  <p className="mt-1 text-xs md:text-sm text-on-surface-variant">No pending settlements remaining.</p>
                </div>
              )
            )}

            {/* HISTORY TAB */}
            {activeTab === 'completed' && (
              completedPayments.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {completedPayments.map((payment) => {
                    const isCancelled = payment.status?.toLowerCase() === 'cancelled' || payment.status?.toLowerCase() === 'failed';
                    return (
                      <div
                        key={payment.id || payment.paymentId}
                        className={`group flex items-center justify-between py-3 md:py-4 hover:bg-white/[0.02] px-1 md:px-2 rounded-xl transition-colors ${isCancelled ? 'opacity-75' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-full ${isCancelled ? 'bg-surface-variant/30 text-on-surface-variant' : 'bg-green-400/10 text-green-400'}`}>
                            {isCancelled ? <History size={16} className="md:scale-110" /> : <CheckCircle2 size={16} className="md:scale-110" />}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className={`text-base md:text-xl font-bold truncate ${isCancelled ? 'text-on-surface-variant line-through decoration-white/20' : 'text-on-surface'}`}>
                              ₹{payment.amount}
                            </span>
                            <span className="text-[10px] md:text-xs text-on-surface-variant truncate">
                              {payment.createdAt 
                                ? new Date(payment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                                : 'Payment record'}
                            </span>
                          </div>
                        </div>
                        <div className={`rounded-lg border px-2 py-1 md:px-3 md:py-1.5 text-[10px] md:text-xs font-semibold capitalize shrink-0 ml-2 ${
                          isCancelled 
                            ? 'bg-surface-variant/20 border-white/5 text-on-surface-variant' 
                            : 'bg-green-400/10 border-green-400/10 text-green-400'
                        }`}>
                          {payment.status || 'Unknown'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 md:py-16 text-center">
                  <History size={40} className="mb-3 md:mb-4 text-on-surface-variant/50 md:scale-110" />
                  <h3 className="text-base md:text-lg font-bold text-on-surface">No history yet</h3>
                  <p className="mt-1 text-xs md:text-sm text-on-surface-variant">Your transaction history will appear here.</p>
                </div>
              )
            )}
          </div>
        )}
      </GlassPanel>
    </div>
  );
};

export default SettlementsPage;