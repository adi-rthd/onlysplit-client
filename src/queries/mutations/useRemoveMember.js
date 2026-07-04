import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidationMap } from '../invalidationMap';
import groupService from '../../services/groupService';
import toast from 'react-hot-toast';

/**
 * Mutation hook to remove a member from a group.
 * Maps to: DELETE /api/groups/{groupId}/member/{memberId}
 */
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, memberId }) => groupService.removeMember(groupId, memberId),

    onError: (err) => {
      toast.error(err?.message || 'Failed to remove member.');
    },

    onSuccess: () => {
      toast.success('Member removed from group.');
    },

    onSettled: (_data, _error, variables) => {
      const keys = invalidationMap.removeMember(variables.groupId);
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));

      if (import.meta.env.DEV) {
        console.log('[Mutation] removeMember settled → invalidated:', keys);
      }
    },
  });
}
