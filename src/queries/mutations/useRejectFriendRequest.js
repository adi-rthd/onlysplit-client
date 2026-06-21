import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidationMap } from '../invalidationMap';
import FriendshipStore from '../../services/friendshipService';
import toast from 'react-hot-toast';

export function useRejectFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId) => FriendshipStore.rejectRequest(requestId),

    onError: (err) => {
      toast.error(`Failed to reject friend request: ${err.message}`);
    },

    onSuccess: () => {
      toast.success('Friend request rejected.');
    },

    onSettled: () => {
      // Always refetch to ensure server truth
      const keys = invalidationMap.rejectFriendRequest();
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));

      if (import.meta.env.DEV) {
        console.log('[Mutation] rejectFriendRequest settled → invalidated:', keys);
      }
    },
  });
}
