import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { invalidationMap } from '../invalidationMap';
import expenseService from '../../services/expenseService';
import toast from 'react-hot-toast';

export function useCreateExpense(groupId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseData) => expenseService.createExpense(expenseData),

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

    onSuccess: () => {
      toast.success('Expense added!');
    },

    onSettled: () => {
      // Always refetch to ensure server truth
      const keys = invalidationMap.createExpense(groupId);
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));

      if (import.meta.env.DEV) {
        console.log('[Mutation] createExpense settled → invalidated:', keys);
      }
    },
  });
}
