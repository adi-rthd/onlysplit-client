import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,       // 60s default
      gcTime: 10 * 60 * 1000,     // 10 min garbage collection
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,  // Refetch when app returns to foreground
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0, // Mutations don't auto-retry (offline queue handles this)
    },
  },
});
