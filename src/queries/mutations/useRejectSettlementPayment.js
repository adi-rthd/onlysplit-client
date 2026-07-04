import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidationMap } from '../invalidationMap';
import settlementPaymentService from '../../services/settlementPaymentService';
import toast from 'react-hot-toast';

/**
 * Rejects a pending settlement payment with a reason (receiver only).
 * Maps to: POST /api/settlements/payments/{paymentId}/reject
 */
export function useRejectSettlementPayment(settlementId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, reason }) =>
      settlementPaymentService.rejectPayment(paymentId, { reason }),

    onError: (err) => {
      toast.error(err.message || 'Failed to reject payment.');
    },

    onSuccess: () => {
      toast.success('Payment rejected.');
    },

    onSettled: () => {
      const keys = invalidationMap.rejectSettlementPayment(settlementId);
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    },
  });
}
