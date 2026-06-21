import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import settlementService from '../../services/settlementService';

export function useGroupSettlements(groupId, options = {}) {
  return useQuery({
    queryKey: queryKeys.groups.settlements(groupId),
    queryFn: () => settlementService.getPendingSettlements(groupId),
    enabled: !!groupId,
    staleTime: 30 * 1000, // 30s
    ...options,
  });
}
