import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  History,
  RefreshCcw,
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
  const { currentGroup, groups, fetchGroups } =
    useGroupStore();

  const user = useAuthStore(
    state => state.user
  );

  const [settlements, setSettlements] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [payingId, setPayingId] = useState(null);

  const groupId = currentGroup?.id || groups?.[0]?.id;

  const pendingSettlements = useMemo(() => {
    return settlements.filter(
      settlement =>
        settlement.status?.toLowerCase() ===
        'pending'
    );
  }, [settlements]);

  const completedPayments = useMemo(() => {
    return paymentHistory.filter(
      payment =>
        payment.status?.toLowerCase() ===
        'completed'
    );
  }, [paymentHistory]);

  const myPendingSettlements = useMemo(() => {
    return pendingSettlements.filter(
      settlement =>
        settlement.payerId === user?.id
    );
  }, [pendingSettlements, user]);

  const totalYouOwe = useMemo(() => {
    return myPendingSettlements.reduce(
      (total, settlement) =>
        total +
        Number(settlement.amount || 0),
      0
    );
  }, [myPendingSettlements]);

  const loadData = async currentGroupId => {
    if (!currentGroupId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const [
        settlementsResponse,
        paymentHistoryResponse,
      ] = await Promise.all([
        settlementService.getPendingSettlements(
          currentGroupId
        ),

        paymentService.getPaymentHistory(),
      ]);

      setSettlements(
        settlementsResponse || []
      );
      setPaymentHistory(
        paymentHistoryResponse || []
      );

    } catch (error) {
      console.error(error);
      toast.error(
        'Failed to load settlements.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      if (!groups?.length) {
        await fetchGroups();
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (groupId) {
      loadData(groupId);
    } else {
      setIsLoading(false);
    }
  }, [groupId]);

  const handleRegenerate = async () => {
    if (!groupId) return;

    try {
      setIsRefreshing(true);

      const updatedSettlements =
        await settlementService.regenerateSettlements(
          groupId
        );

      setSettlements(
        updatedSettlements || []
      );
    } catch (error) {
      setIsRefreshing(false);
      console.error(error);
    }
  };

  const handlePayment = async settlement => {
    try {
      setPayingId(settlement.id);

      const order = await paymentService.createOrder(settlement.id);

      if (!order) {
        setPayingId(null);
        return;
      }

      paymentService.openCheckout({
        order,

        onSuccess: async response => {
          let payment = {
            paymentId: order.paymentId,

            razorpayOrderId: order.razorpayOrderId,

            razorpayPaymentId: order.paymentId,

            razorpaySignature: response.razorpay_signature,
          }
          const verified = await paymentService.verifyPayment(payment);

          if (!verified) return;

          toast.success(
            'Settlement completed successfully!'
          );

          await loadData(groupId);
        },

        onFailure: message => {
          toast.error(
            message ||
            'Payment failed.'
          );
        },
      });
    } catch (error) {
      console.error(error);

      toast.error(
        'Unable to process payment.'
      );
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-on-surface">
            Settlements
          </h1>

          <p className="mt-1 text-sm text-on-surface-variant">
            Track pending payments and completed settlements.
          </p>
        </div>

        <GlowButton
          className="min-w-[220px] h-[76px] border border-[#4F46FF]"
          icon={Sparkles}
          onClick={handleRegenerate}
          isLoading={isRefreshing || !groupId}
        >
          Recalculate
        </GlowButton>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <GlassPanel className="rounded-3xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">
                Total Pending
              </p>

              <h2 className="mt-3 text-4xl font-bold text-on-surface">
                ₹
                {totalYouOwe.toFixed(2)}
              </h2>

              <p className="mt-2 text-sm font-medium text-error">
                You owe
              </p>
            </div>

            <div className="rounded-2xl bg-error/10 p-4 text-error">
              <Wallet size={22} />
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="rounded-3xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">
                Completed Payments
              </p>

              <h2 className="mt-3 text-4xl font-bold text-on-surface">
                {
                  completedPayments.length
                }
              </h2>

              <p className="mt-2 text-sm font-medium text-green-400">
                Transactions completed
              </p>
            </div>

            <div className="rounded-2xl bg-green-400/10 p-4 text-green-400">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <GlassPanel className="rounded-3xl p-5 md:p-6">
          <div className="mb-6 flex items-center gap-2">
            <History
              size={18}
              className="text-error"
            />

            <h2 className="text-xl font-bold text-on-surface">
              Pending Settlements
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : myPendingSettlements.length >
            0 ? (
            <div className="space-y-4">
              {myPendingSettlements.map(
                settlement => (
                  <div
                    key={settlement.id}
                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                          <CreditCard
                            size={22}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                            <span>
                              {settlement.payerName ||
                                'You'}
                            </span>

                            <ArrowRight
                              size={14}
                            />

                            <span>
                              {settlement.receiverName ||
                                'Receiver'}
                            </span>
                          </div>

                          <h3 className="mt-2 text-3xl font-bold text-on-surface">
                            ₹
                            {
                              settlement.amount
                            }
                          </h3>

                          <p className="mt-2 text-xs uppercase tracking-wider text-error">
                            Pending
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          handlePayment(
                            settlement
                          )
                        }
                        disabled={
                          payingId ===
                          settlement.id
                        }
                        className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                      >
                        {payingId ===
                          settlement.id ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>

                            Processing...
                          </>
                        ) : (
                          <>
                            <Wallet
                              size={16}
                            />

                            Pay Now
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <CheckCircle2
                size={52}
                className="mb-4 text-green-400"
              />

              <h3 className="text-xl font-bold text-on-surface">
                You are all settled up!
              </h3>

              <p className="mt-2 text-sm text-on-surface-variant">
                No pending settlements remaining.
              </p>
            </div>
          )}
        </GlassPanel>

        <GlassPanel className="rounded-3xl p-5 md:p-6">
          <div className="mb-6 flex items-center gap-2">
            <CheckCircle2
              size={18}
              className="text-green-400"
            />

            <h2 className="text-xl font-bold text-on-surface">
              Completed Payments
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : completedPayments.length >
            0 ? (
            <div className="space-y-4">
              {completedPayments.map(
                payment => (
                  <div
                    key={payment.id}
                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-400/10 text-green-400">
                          <CheckCircle2
                            size={20}
                          />
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-on-surface">
                            ₹
                            {
                              payment.amount
                            }
                          </h3>

                          <p className="mt-1 text-sm text-on-surface-variant">
                            Payment completed successfully
                          </p>
                        </div>
                      </div>

                      <div className="rounded-full bg-green-400/10 px-3 py-1 text-xs font-semibold text-green-400">
                        Completed
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <History
                size={52}
                className="mb-4 text-on-surface-variant"
              />

              <h3 className="text-lg font-semibold text-on-surface">
                No payment history yet
              </h3>

              <p className="mt-2 text-sm text-on-surface-variant">
                Completed settlements will appear here.
              </p>
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
};

export default SettlementsPage;
