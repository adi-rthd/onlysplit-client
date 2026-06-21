import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import invitationService from '../../services/groupInviteService';

export function useInvitations(options = {}) {
  return useQuery({
    queryKey: queryKeys.invitations.list(),
    queryFn: () => invitationService.getMyInvites(),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useGroupInvites(groupId, options = {}) {
  return useQuery({
    queryKey: queryKeys.invitations.group(groupId),
    queryFn: () => invitationService.getGroupInvites(groupId),
    enabled: !!groupId,
    staleTime: 60 * 1000,
    ...options,
  });
}
