import React, { Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../queries/queryClient';

// Lazy-load ReactQueryDevtools only in development
const ReactQueryDevtools = import.meta.env.DEV
  ? React.lazy(() =>
      import('@tanstack/react-query-devtools').then((mod) => ({
        default: mod.ReactQueryDevtools,
      }))
    )
  : null;

/**
 * QueryProvider wraps the application with TanStack Query's QueryClientProvider
 * and conditionally renders ReactQueryDevtools in development mode.
 */
const QueryProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {ReactQueryDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      )}
    </QueryClientProvider>
  );
};

export default QueryProvider;
