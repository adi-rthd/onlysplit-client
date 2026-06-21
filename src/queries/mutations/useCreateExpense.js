import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Network } from '@capacitor/network';
import { queryKeys } from '../queryKeys';
import { invalidationMap } from '../invalidationMap';
import expenseService from '../../services/expenseService';
import { getOfflineQueue } from '../../hooks/useOfflineQueue';
import toast from 'react-hot-toast';

export function useCreateExpense(groupId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseData) => {
      // Check network status
      let isOnline = true;
      try {
        const status = await Network.getStatus();
        isOnline = status.connected;
      } catch {
        // If Network plugin unavailable, assume online
        isOnline = true;
      }

      if (!isOnline) {
        // Queue the mutation for later replay
        const queue = getOfflineQueue();
        await queue.enqueue({
          type: 'createExpense',
          payload: expenseData,
          groupId: expenseData.groupId || groupId,
        });
        // Return a fake response for the optimistic update to work
        return { ...expenseData, id: `offline-${Date.now()}`, _isPending: true };
      }

      // Online: proceed normally
      return expenseService.createExpense(expenseData);
    },

    onMutate: async (newExpense) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.groups.expenses(groupId) });

      // Snapshot previous state
      const previousExpenses = queryClient.getQueryData(queryKeys.groups.expenses(groupId));

      // Optimistically insert
      const optimisticExpense = {
        ...newExpense,
        id: `temp-${Date.now()}`,
        _isPending: true,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(queryKeys.groups.expenses(groupId), (old) =>
        [optimisticExpense, ...(old || [])]
      );

      return { previousExpenses };
    },

    onError: (err, _variables, context) => {
      // Rollback
      if (context?.previousExpenses) {
        queryClient.setQueryData(
          queryKeys.groups.expenses(groupId),
          context.previousExpenses
        );
      }
      toast.error(`Failed to create expense: ${err.message}`);
    },

    onSuccess: (data) => {
      if (data?._isPending) {
        toast.success('Saved locally — will sync when online');
      } else {
        toast.success('Expense added!');
      }
    },

    onSettled: (data) => {
      // Skip invalidation for offline-queued mutations (no server truth to refetch)
      if (data?._isPending) {
        return;
      }

      // Always refetch to ensure server truth
      const keys = invalidationMap.createExpense(groupId);
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));

      if (import.meta.env.DEV) {
        console.log('[Mutation] createExpense settled → invalidated:', keys);
      }
    },
  });
}
