import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { invalidationMap } from '../invalidationMap';
import expenseService from '../../services/expenseService';
import toast from 'react-hot-toast';

export function useUpdateExpense(groupId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ expenseId, expenseData }) =>
      expenseService.updateExpense(expenseId, expenseData),

    onMutate: async ({ expenseId, expenseData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.groups.expenses(groupId) });

      // Snapshot previous state
      const previousExpenses = queryClient.getQueryData(queryKeys.groups.expenses(groupId));

      // Optimistically update the expense in-place
      queryClient.setQueryData(queryKeys.groups.expenses(groupId), (old) =>
        (old || []).map((exp) =>
          exp.id === expenseId
            ? { ...exp, ...expenseData, _isPending: true }
            : exp
        )
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
      toast.error(`Failed to update expense: ${err.message}`);
    },

    onSuccess: () => {
      toast.success('Expense updated!');
    },

    onSettled: () => {
      const keys = invalidationMap.updateExpense(groupId);
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));

      if (import.meta.env.DEV) {
        console.log('[Mutation] updateExpense settled → invalidated:', keys);
      }
    },
  });
}
