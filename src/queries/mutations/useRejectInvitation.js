import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidationMap } from '../invalidationMap';
import invitationService from '../../services/groupInviteService';
import toast from 'react-hot-toast';

export function useRejectInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId) => invitationService.rejectInvite(invitationId),

    onError: (err) => {
      toast.error(`Failed to reject invitation: ${err.message}`);
    },

    onSuccess: () => {
      toast.success('Invitation rejected.');
    },

    onSettled: () => {
      // Always refetch to ensure server truth
      const keys = invalidationMap.rejectInvitation();
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));

      if (import.meta.env.DEV) {
        console.log('[Mutation] rejectInvitation settled → invalidated:', keys);
      }
    },
  });
}
