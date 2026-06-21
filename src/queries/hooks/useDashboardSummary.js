import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import dashboardService from '../../services/dashboardService';

export function useDashboardSummary(options = {}) {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: () => dashboardService.getOverview(),
    staleTime: 60 * 1000,
    ...options,
  });
}
