import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidationMap } from '../invalidationMap';
import groupService from '../../services/groupService';
import toast from 'react-hot-toast';

export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId) => groupService.deleteGroup(groupId),

    onError: (err) => {
      toast.error(`Failed to delete group: ${err.message}`);
    },

    onSuccess: () => {
      toast.success('Group deleted.');
    },

    onSettled: (_data, _error, groupId) => {
      const { invalidate, remove } = invalidationMap.deleteGroup(groupId);

      // Invalidate keys that should refetch
      invalidate.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));

      // Remove keys by prefix (clears all group-specific cached data)
      remove.forEach((key) => queryClient.removeQueries({ queryKey: key }));

      if (import.meta.env.DEV) {
        console.log('[Mutation] deleteGroup settled → invalidated:', invalidate, '→ removed:', remove);
      }
    },
  });
}
