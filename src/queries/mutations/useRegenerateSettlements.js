import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { invalidationMap } from '../invalidationMap';
import settlementService from '../../services/settlementService';
import toast from 'react-hot-toast';

export function useRegenerateSettlements(groupId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => settlementService.regenerateSettlements(groupId),

    onError: (err) => {
      toast.error(`Failed to regenerate settlements: ${err.message}`);
    },

    onSuccess: () => {
      toast.success('Settlements regenerated!');
    },

    onSettled: () => {
      const keys = invalidationMap.regenerateSettlements(groupId);
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));

      if (import.meta.env.DEV) {
        console.log('[Mutation] regenerateSettlements settled → invalidated:', keys);
      }
    },
  });
}
