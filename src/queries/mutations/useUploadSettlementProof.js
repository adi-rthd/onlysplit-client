import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidationMap } from '../invalidationMap';
import settlementPaymentService from '../../services/settlementPaymentService';
import toast from 'react-hot-toast';

/**
 * Uploads proof for a settlement payment.
 * Maps to: POST /api/settlements/payments/{paymentId}/proof
 */
export function useUploadSettlementProof(settlementId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, file }) =>
      settlementPaymentService.uploadProof(paymentId, file),

    onError: (err) => {
      toast.error(err.message || 'Failed to upload proof.');
    },

    onSuccess: () => {
      toast.success('Proof uploaded.');
    },

    onSettled: () => {
      const keys = invalidationMap.uploadSettlementProof(settlementId);
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    },
  });
}
