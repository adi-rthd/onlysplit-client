import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import toast from 'react-hot-toast';

import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  History,
  Sparkles,
  Wallet,
} from 'lucide-react';

import {
  GlassPanel,
} from '../components/ui/GlassCard';

import settlementService from '../services/settlementService';
import paymentService from '../services/paymentService';

import {
  useGroupStore,
} from '../store/groupStore';

import {
  useAuthStore,
} from '../store/authStore';

import GlowButton from '../components/ui/GlowButton';

const SettlementsPage = () => {
  const {
    currentGroup,
    groups,
    fetchGroups,
  } = useGroupStore();

  const user =
    useAuthStore(
      state => state.user
    );

  const [
    settlements,
    setSettlements,
  ] = useState([]);

  const [
    paymentHistory,
    setPaymentHistory,
  ] = useState([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  const [
    payingId,
    setPayingId,
  ] = useState(null);

  const groupId =
    currentGroup?.id ||
    groups?.[0]?.id;

  const pendingSettlements =
    useMemo(() => {
      return settlements.filter(
        settlement =>
          settlement.status?.toLowerCase() ===
          'pending'
      );
    }, [settlements]);

  const completedPayments =
    useMemo(() => {
      return paymentHistory.filter(
        payment =>
          payment.status?.toLowerCase() ===
          'completed'
      );
    }, [paymentHistory]);

  const myPendingSettlements =
    useMemo(() => {
      return pendingSettlements.filter(
        settlement =>
          settlement.payerId ===
          user?.id
      );
    }, [
      pendingSettlements,
      user,
    ]);

  const totalYouOwe =
    useMemo(() => {
      return myPendingSettlements.reduce(
        (
          total,
          settlement
        ) =>
          total +
          Number(
            settlement.amount || 0
          ),

        0
      );
    }, [myPendingSettlements]);

  const loadData =
    async currentGroupId => {
      if (!currentGroupId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const [
          settlementsResponse,
          paymentHistoryResponse,
        ] =
          await Promise.all([
            settlementService.getPendingSettlements(
              currentGroupId
            ),

            paymentService.getPaymentHistory(),
          ]);

        setSettlements(
          settlementsResponse?.data ||
          settlementsResponse ||
          []
        );

        setPaymentHistory(
          paymentHistoryResponse?.data ||
          paymentHistoryResponse ||
          []
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
    const initialize =
      async () => {
        try {
          if (!groups?.length) {
            await fetchGroups();
          }
        } catch (error) {
          console.error(error);
        }
      };

    initialize();
  }, []);

  useEffect(() => {
    if (groupId) {
      loadData(groupId);
    }
  }, [groupId]);

  const handleRegenerate =
    async () => {
      if (!groupId) return;

      try {
        setIsRefreshing(true);

        const updatedSettlements =
          await settlementService.regenerateSettlements(
            groupId
          );

        setSettlements(
          updatedSettlements?.data ||
          updatedSettlements ||
          []
        );
debugger
        toast.success(
          'Settlements recalculated.'
        );
      } catch (error) {
        console.error(error);

        toast.error(
          'Failed to recalculate settlements.'
        );
      } finally {
        setIsRefreshing(false);
      }
    };

  const handlePayment =
    async settlement => {
      try {
        setPayingId(
          settlement.id
        );

        const order =
          await paymentService.createOrder(
            {
              settlementId:
                settlement.id,

              amount:
                settlement.amount,
            }
          );

        if (!order) {
          setPayingId(null);
          return;
        }

        paymentService.openCheckout({
          orderId:
            order.orderId,

          amount:
            order.amount,

          currency:
            order.currency,

          onSuccess:
            async response => {
              try {
                const verified =
                  await paymentService.verifyPayment(
                    {
                      razorpayOrderId:
                        response.razorpay_order_id,

                      razorpayPaymentId:
                        response.razorpay_payment_id,

                      razorpaySignature:
                        response.razorpay_signature,
                    }
                  );

                if (!verified) {
                  toast.error(
                    'Payment verification failed.'
                  );

                  return;
                }

                toast.success(
                  'Settlement completed successfully!'
                );

                await loadData(
                  groupId
                );
              } catch (error) {
                console.error(
                  error
                );

                toast.error(
                  'Payment verification failed.'
                );
              } finally {
                setPayingId(
                  null
                );
              }
            },

          onFailure:
            message => {
              setPayingId(
                null
              );

              toast.error(
                message ||
                'Payment failed.'
              );
            },
        });
      } catch (error) {
        console.error(error);

        setPayingId(null);

        toast.error(
          'Unable to process payment.'
        );
      }
    };

  return (
    <div className="space-y-6 md:space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">
            Settlements
          </h1>

          <p className="mt-1 text-sm text-on-surface-variant">
            Track pending payments and completed settlements.
          </p>
        </div>

        <GlowButton
          className="min-w-[220px] h-[70px] border border-[#4F46FF]"
          icon={Sparkles}
          onClick={
            handleRegenerate
          }
          isLoading={
            isRefreshing
          }
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
                {totalYouOwe.toFixed(
                  2
                )}
              </h2>

              <p className="mt-2 text-sm font-medium text-error">
                You owe
              </p>
            </div>

            <div className="rounded-2xl bg-error/10 p-4 text-error">
              <Wallet
                size={22}
              />
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

              <p className="mt-2 text-sm font-medium text-neon-lime">
                Transactions completed
              </p>
            </div>

            <div className="rounded-2xl bg-neon-lime/10 p-4 text-neon-lime">
              <CheckCircle2
                size={22}
              />
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
};

export default SettlementsPage;