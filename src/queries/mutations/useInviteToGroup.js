import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidationMap } from '../invalidationMap';
import invitationService from '../../services/groupInviteService';
import toast from 'react-hot-toast';

export function useInviteToGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, invitedUserId }) =>
      invitationService.inviteToGroup(groupId, invitedUserId),

    onError: (err) => {
      toast.error(`Failed to send invitation: ${err.message}`);
    },

    onSuccess: () => {
      toast.success('Invitation sent!');
    },

    onSettled: (_data, _error, variables) => {
      // Always refetch to ensure server truth
      const keys = invalidationMap.inviteToGroup(variables.groupId);
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));

      if (import.meta.env.DEV) {
        console.log('[Mutation] inviteToGroup settled → invalidated:', keys);
      }
    },
  });
}
