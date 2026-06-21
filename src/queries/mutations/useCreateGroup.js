import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { invalidationMap } from '../invalidationMap';
import groupService from '../../services/groupService';
import toast from 'react-hot-toast';

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupData) => groupService.createGroup(groupData),

    onMutate: async (newGroup) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.groups.all() });

      // Snapshot previous state
      const previousGroups = queryClient.getQueryData(queryKeys.groups.all());

      // Optimistically insert
      const optimisticGroup = {
        ...newGroup,
        id: `temp-${Date.now()}`,
        _isPending: true,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(queryKeys.groups.all(), (old) =>
        [optimisticGroup, ...(old || [])]
      );

      return { previousGroups };
    },

    onError: (err, _variables, context) => {
      // Rollback
      if (context?.previousGroups) {
        queryClient.setQueryData(
          queryKeys.groups.all(),
          context.previousGroups
        );
      }
      toast.error(`Failed to create group: ${err.message}`);
    },

    onSuccess: () => {
      toast.success('Group created!');
    },

    onSettled: () => {
      // Always refetch to ensure server truth
      const keys = invalidationMap.createGroup();
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));

      if (import.meta.env.DEV) {
        console.log('[Mutation] createGroup settled → invalidated:', keys);
      }
    },
  });
}
