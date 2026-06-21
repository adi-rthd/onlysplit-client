import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { invalidationMap } from '../invalidationMap';
import expenseService from '../../services/expenseService';
import toast from 'react-hot-toast';

export function useDeleteExpense(groupId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseId) => expenseService.deleteExpense(expenseId),

    onMutate: async (expenseId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.groups.expenses(groupId) });

      // Snapshot previous state
      const previousExpenses = queryClient.getQueryData(queryKeys.groups.expenses(groupId));

      // Optimistically remove
      queryClient.setQueryData(queryKeys.groups.expenses(groupId), (old) =>
        (old || []).filter((exp) => exp.id !== expenseId)
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
      toast.error(`Failed to delete expense: ${err.message}`);
    },

    onSuccess: () => {
      toast.success('Expense deleted.');
    },

    onSettled: () => {
      const keys = invalidationMap.deleteExpense(groupId);
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));

      if (import.meta.env.DEV) {
        console.log('[Mutation] deleteExpense settled → invalidated:', keys);
      }
    },
  });
}
