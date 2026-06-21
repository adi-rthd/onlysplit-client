import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { invalidationMap } from '../invalidationMap';
import settlementService from '../../services/settlementService';
import toast from 'react-hot-toast';

export function useRecordSettlement(groupId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settlementData) =>
      settlementService.recordSettlement
        ? settlementService.recordSettlement(groupId, settlementData)
        : Promise.reject(new Error('recordSettlement not implemented')),

    onError: (err) => {
      toast.error(`Failed to record settlement: ${err.message}`);
    },

    onSuccess: () => {
      toast.success('Settlement recorded!');
    },

    onSettled: () => {
      const keys = invalidationMap.recordSettlement(groupId);
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));

      if (import.meta.env.DEV) {
        console.log('[Mutation] recordSettlement settled → invalidated:', keys);
      }
    },
  });
}
