import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import groupService from '../../services/groupService';

export function useGroups(options = {}) {
  return useQuery({
    queryKey: queryKeys.groups.lists(),
    queryFn: () => groupService.getGroups(),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useGroupDetail(groupId, options = {}) {
  return useQuery({
    queryKey: queryKeys.groups.detail(groupId),
    queryFn: () => groupService.getGroupById(groupId),
    enabled: !!groupId,
    staleTime: 60 * 1000,
    ...options,
  });
}
