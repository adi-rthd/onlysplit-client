import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { invalidationMap } from '../invalidationMap';
import FriendshipStore from '../../services/friendshipService';
import toast from 'react-hot-toast';

export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addresseeId) => FriendshipStore.sendRequest(addresseeId),

    onMutate: async (addresseeId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.friends.sent() });

      // Snapshot previous state
      const previousSent = queryClient.getQueryData(queryKeys.friends.sent());

      // Optimistically add to sent list
      const optimisticRequest = {
        id: `temp-${Date.now()}`,
        addresseeId,
        _isPending: true,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(queryKeys.friends.sent(), (old) =>
        [optimisticRequest, ...(old || [])]
      );

      return { previousSent };
    },

    onError: (err, _variables, context) => {
      // Rollback
      if (context?.previousSent) {
        queryClient.setQueryData(queryKeys.friends.sent(), context.previousSent);
      }
      toast.error(`Failed to send friend request: ${err.message}`);
    },

    onSuccess: () => {
      toast.success('Friend request sent!');
    },

    onSettled: () => {
      // Always refetch to ensure server truth
      const keys = invalidationMap.sendFriendRequest();
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));

      if (import.meta.env.DEV) {
        console.log('[Mutation] sendFriendRequest settled → invalidated:', keys);
      }
    },
  });
}
