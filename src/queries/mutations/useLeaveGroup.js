import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidationMap } from '../invalidationMap';
import groupService from '../../services/groupService';
import toast from 'react-hot-toast';

export function useLeaveGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId) => groupService.leaveGroup(groupId),

    onError: (err) => {
      const message = err?.response?.data?.message || err.message || 'Failed to leave group';
      toast.error(message);
    },

    onSuccess: () => {
      toast.success('You have left the group.');
    },

    onSettled: (_data, _error, groupId) => {
      const { invalidate, remove } = invalidationMap.leaveGroup(groupId);

      invalidate.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      remove.forEach((key) => queryClient.removeQueries({ queryKey: key }));

      if (import.meta.env.DEV) {
        console.log('[Mutation] leaveGroup settled → invalidated:', invalidate, '→ removed:', remove);
      }
    },
  });
}
