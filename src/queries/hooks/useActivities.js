import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import activityService from '../../services/activityService';

export function useActivities(options = {}) {
  return useQuery({
    queryKey: queryKeys.activities.list(),
    queryFn: () => activityService.getActivities(),
    staleTime: 60 * 1000, // 60 seconds
    ...options,
  });
}
