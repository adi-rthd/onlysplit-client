import { useState, useCallback } from 'react';
import { queryClient } from '../queries/queryClient';

/**
 * Custom hook to manage the soft refresh state.
 * It invalidates all active queries in TanStack Query and refetches them.
 */
export const usePullToRefresh = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const triggerRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    const startTime = Date.now();

    try {
      // Invalidate and refetch all active queries
      await queryClient.invalidateQueries({ refetchType: 'active' });
    } catch (error) {
      console.error('[PullToRefresh] Error invalidating queries:', error);
    } finally {
      // Enforce a minimum display duration of 800ms for smooth spinner animation
      const elapsedTime = Date.now() - startTime;
      const minDuration = 800;
      if (elapsedTime < minDuration) {
        await new Promise((resolve) => setTimeout(resolve, minDuration - elapsedTime));
      }
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  return {
    isRefreshing,
    triggerRefresh,
  };
};
