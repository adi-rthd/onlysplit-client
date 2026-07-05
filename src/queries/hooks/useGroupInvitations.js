import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import invitationService from '../../services/groupInviteService';

export function useGroupInvitations(options = {}) {
  return useQuery({
    queryKey: queryKeys.invitations.list(),
    queryFn: () => invitationService.getMyInvites(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}
