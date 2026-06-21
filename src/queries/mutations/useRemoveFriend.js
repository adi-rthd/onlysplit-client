import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { invalidationMap } from '../invalidationMap';
import FriendshipStore from '../../services/friendshipService';
import toast from 'react-hot-toast';

export function useRemoveFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendId) => FriendshipStore.removeFriend(friendId),

    onMutate: async (friendId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.friends.list() });

      // Snapshot previous state
      const previousFriends = queryClient.getQueryData(queryKeys.friends.list());

      // Optimistically remove friend from list
      queryClient.setQueryData(queryKeys.friends.list(), (old) =>
        (old || []).filter((friend) => friend.id !== friendId)
      );

      return { previousFriends };
    },

    onError: (err, _variables, context) => {
      // Rollback
      if (context?.previousFriends) {
        queryClient.setQueryData(queryKeys.friends.list(), context.previousFriends);
      }
      toast.error(`Failed to remove friend: ${err.message}`);
    },

    onSuccess: () => {
      toast.success('Friend removed.');
    },

    onSettled: () => {
      // Always refetch to ensure server truth
      const keys = invalidationMap.removeFriend();
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));

      if (import.meta.env.DEV) {
        console.log('[Mutation] removeFriend settled → invalidated:', keys);
      }
    },
  });
}
