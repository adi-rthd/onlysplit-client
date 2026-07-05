import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidationMap } from '../invalidationMap';
import settlementService from '../../services/settlementService';
import toast from 'react-hot-toast';

/**
 * Forgives (marks as settled) a pending settlement (receiver only).
 * Maps to: POST /api/settlements/{settlementId}/forgive
 *
 * Variables: { settlementId, reason?, groupId? }
 */
export function useForgiveSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ settlementId, reason }) =>
      settlementService.forgiveSettlement(settlementId, reason),

    onError: (err) => {
      toast.error(err.message || 'Failed to mark as settled.');
    },

    onSuccess: () => {
      toast.success('Settlement marked as settled.');
    },

    onSettled: (_data, _error, variables) => {
      const { settlementId, groupId } = variables;
      const keys = invalidationMap.forgiveSettlement(settlementId, groupId);
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    },
  });
}
