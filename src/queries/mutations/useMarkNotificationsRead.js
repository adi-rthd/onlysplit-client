import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { invalidationMap } from '../invalidationMap';
import invitationService from '../../services/groupInviteService';

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => invitationService.markAllNotificationsAsRead(),

    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all() });

      // Snapshot previous state
      const previousNotifications = queryClient.getQueryData(queryKeys.notifications.list());

      // Optimistically mark all notifications as read
      queryClient.setQueryData(queryKeys.notifications.list(), (old) =>
        (old || []).map((notification) => ({ ...notification, isRead: true }))
      );

      return { previousNotifications };
    },

    onError: (_err, _variables, context) => {
      // Rollback
      if (context?.previousNotifications) {
        queryClient.setQueryData(queryKeys.notifications.list(), context.previousNotifications);
      }
    },

    onSettled: () => {
      // Always refetch to ensure server truth
      const keys = invalidationMap.markNotificationsRead();
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));

      if (import.meta.env.DEV) {
        console.log('[Mutation] markNotificationsRead settled → invalidated:', keys);
      }
    },
  });
}
