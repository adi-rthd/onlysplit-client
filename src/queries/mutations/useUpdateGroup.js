import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { invalidationMap } from '../invalidationMap';
import groupService from '../../services/groupService';
import toast from 'react-hot-toast';

export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, groupData }) => groupService.updateGroup(groupId, groupData),

    onMutate: async ({ groupId, groupData }) => {
      // Cancel outgoing refetches for both list and detail
      await queryClient.cancelQueries({ queryKey: queryKeys.groups.all() });
      await queryClient.cancelQueries({ queryKey: queryKeys.groups.detail(groupId) });

      // Snapshot previous state
      const previousGroups = queryClient.getQueryData(queryKeys.groups.all());
      const previousDetail = queryClient.getQueryData(queryKeys.groups.detail(groupId));

      // Optimistically update groups list
      queryClient.setQueryData(queryKeys.groups.all(), (old) =>
        (old || []).map((group) =>
          group.id === groupId ? { ...group, ...groupData, _isPending: true } : group
        )
      );

      // Optimistically update group detail cache
      queryClient.setQueryData(queryKeys.groups.detail(groupId), (old) =>
        old ? { ...old, ...groupData, _isPending: true } : old
      );

      return { previousGroups, previousDetail, groupId };
    },

    onError: (err, _variables, context) => {
      // Rollback
      if (context?.previousGroups) {
        queryClient.setQueryData(
          queryKeys.groups.all(),
          context.previousGroups
        );
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(
          queryKeys.groups.detail(context.groupId),
          context.previousDetail
        );
      }
      toast.error(`Failed to update group: ${err.message}`);
    },

    onSuccess: () => {
      toast.success('Group updated!');
    },

    onSettled: (_data, _error, { groupId }) => {
      // Always refetch to ensure server truth
      const keys = invalidationMap.updateGroup(groupId);
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));

      if (import.meta.env.DEV) {
        console.log('[Mutation] updateGroup settled → invalidated:', keys);
      }
    },
  });
}
