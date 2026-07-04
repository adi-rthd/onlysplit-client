import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidationMap } from '../invalidationMap';
import settlementPaymentService from '../../services/settlementPaymentService';
import toast from 'react-hot-toast';

/**
 * Confirms a pending settlement payment (receiver only).
 * Maps to: POST /api/settlements/payments/{paymentId}/confirm
 */
export function useConfirmSettlementPayment(settlementId, { groupId } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId) => settlementPaymentService.confirmPayment(paymentId),

    onError: (err) => {
      toast.error(err.message || 'Failed to confirm payment.');
    },

    onSuccess: () => {
      toast.success('Payment confirmed.');
    },

    onSettled: () => {
      const keys = invalidationMap.confirmSettlementPayment(settlementId, groupId);
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    },
  });
}
