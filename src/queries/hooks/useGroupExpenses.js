import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import expenseService from '../../services/expenseService';

export function useGroupExpenses(groupId, options = {}) {
  return useQuery({
    queryKey: queryKeys.groups.expenses(groupId),
    queryFn: () => expenseService.getGroupExpenses(groupId),
    enabled: !!groupId,
    staleTime: 60 * 1000, // 60s
    ...options,
  });
}
