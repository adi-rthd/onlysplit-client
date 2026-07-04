import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidationMap } from '../invalidationMap';
import settlementPaymentService from '../../services/settlementPaymentService';
import toast from 'react-hot-toast';

/**
 * Records a manual payment for a settlement.
 * Maps to: POST /api/settlements/{settlementId}/payments
 */
export function useRecordSettlementPayment(settlementId, { groupId } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => settlementPaymentService.recordPayment(settlementId, payload),

    onError: (err) => {
      toast.error(err.message || 'Failed to record payment.');
    },

    onSuccess: () => {
      toast.success('Payment submitted.');
    },

    onSettled: () => {
      const keys = invalidationMap.recordSettlementPayment(settlementId, groupId);
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    },
  });
}
