import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { invalidationMap } from '../invalidationMap';
import FriendshipStore from '../../services/friendshipService';
import toast from 'react-hot-toast';

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId) => FriendshipStore.acceptRequest(requestId),

    onMutate: async (requestId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.friends.requests() });

      // Snapshot previous state
      const previousRequests = queryClient.getQueryData(queryKeys.friends.requests());

      // Optimistically remove from requests list
      queryClient.setQueryData(queryKeys.friends.requests(), (old) =>
        (old || []).filter((req) => req.id !== requestId)
      );

      return { previousRequests };
    },

    onError: (err, _variables, context) => {
      // Rollback
      if (context?.previousRequests) {
        queryClient.setQueryData(queryKeys.friends.requests(), context.previousRequests);
      }
      toast.error(`Failed to accept friend request: ${err.message}`);
    },

    onSuccess: () => {
      toast.success('Friend request accepted!');
    },

    onSettled: () => {
      // Always refetch to ensure server truth
      const keys = invalidationMap.acceptFriendRequest();
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));

      if (import.meta.env.DEV) {
        console.log('[Mutation] acceptFriendRequest settled → invalidated:', keys);
      }
    },
  });
}
