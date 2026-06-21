import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import FriendshipStore from '../../services/friendshipService';

export function useFriends(options = {}) {
  return useQuery({
    queryKey: queryKeys.friends.list(),
    queryFn: () => FriendshipStore.getFriends(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useFriendRequests(options = {}) {
  return useQuery({
    queryKey: queryKeys.friends.requests(),
    queryFn: () => FriendshipStore.getRequests(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useSentRequests(options = {}) {
  return useQuery({
    queryKey: queryKeys.friends.sent(),
    queryFn: () => FriendshipStore.getSent(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}
