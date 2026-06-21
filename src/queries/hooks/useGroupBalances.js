import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import settlementService from '../../services/settlementService';

export function useGroupBalances(groupId, options = {}) {
  return useQuery({
    queryKey: queryKeys.groups.balances(groupId),
    queryFn: () => settlementService.getBalances(groupId),
    enabled: !!groupId,
    staleTime: 30 * 1000, // 30s
    ...options,
  });
}
