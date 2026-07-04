import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidationMap } from '../invalidationMap';
import settlementPaymentService from '../../services/settlementPaymentService';
import toast from 'react-hot-toast';

/**
 * Cancels a pending settlement payment (payer only).
 * Maps to: POST /api/settlements/payments/{paymentId}/cancel
 */
export function useCancelSettlementPayment(settlementId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId) => settlementPaymentService.cancelPayment(paymentId),

    onError: (err) => {
      toast.error(err.message || 'Failed to cancel payment.');
    },

    onSuccess: () => {
      toast.success('Payment cancelled.');
    },

    onSettled: () => {
      const keys = invalidationMap.cancelSettlementPayment(settlementId);
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    },
  });
}
