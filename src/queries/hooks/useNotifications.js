import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import invitationService from '../../services/groupInviteService';

export function useNotifications(options = {}) {
  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => invitationService.getMyNotifications(),
    staleTime: 60 * 1000,
    ...options,
  });
}
