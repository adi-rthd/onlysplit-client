import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { invalidationMap } from '../invalidationMap';
import invitationService from '../../services/groupInviteService';
import toast from 'react-hot-toast';

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId) => invitationService.acceptInvite(invitationId),

    onMutate: async (invitationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.invitations.all() });

      // Snapshot previous state
      const previousInvitations = queryClient.getQueryData(queryKeys.invitations.list());

      // Optimistically remove from invitations list
      queryClient.setQueryData(queryKeys.invitations.list(), (old) =>
        (old || []).filter((inv) => inv.id !== invitationId)
      );

      return { previousInvitations };
    },

    onError: (err, _variables, context) => {
      // Rollback
      if (context?.previousInvitations) {
        queryClient.setQueryData(queryKeys.invitations.list(), context.previousInvitations);
      }
      toast.error(`Failed to accept invitation: ${err.message}`);
    },

    onSuccess: () => {
      toast.success('Invitation accepted!');
    },

    onSettled: () => {
      // Always refetch to ensure server truth
      const keys = invalidationMap.acceptInvitation();
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));

      if (import.meta.env.DEV) {
        console.log('[Mutation] acceptInvitation settled → invalidated:', keys);
      }
    },
  });
}
