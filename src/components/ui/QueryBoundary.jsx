import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Skeleton from './Skeleton';

/**
 * Default loading skeleton shown while a query is loading for the first time.
 */
function DefaultSkeleton() {
  return (
    <div className="space-y-3 py-4">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

/**
 * QueryBoundary — handles loading, error, and success states for a TanStack Query.
 *
 * Renders:
 * - Loading skeleton when `isLoading && !data` (first-time fetch)
 * - Error state with retry button when `isError && !data`
 * - `children(data)` on success
 *
 * Background refetches with existing cached data render children normally.
 *
 * @param {{ query: object, loadingFallback?: React.ReactNode, children: (data: any) => React.ReactNode }} props
 */
export function QueryBoundary({ query, loadingFallback, children }) {
  // First-time loading — no cached data yet
  if (query.isLoading && !query.data) {
    return loadingFallback || <DefaultSkeleton />;
  }

  // Error state with no cached data to show
  if (query.isError && !query.data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-container/20">
          <AlertTriangle className="text-error" size={24} />
        </div>
        <p className="mb-1 text-sm font-medium text-on-surface">
          {query.error?.message || 'Something went wrong'}
        </p>
        <p className="mb-5 text-xs text-on-surface-variant">
          Check your connection and try again
        </p>
        <button
          onClick={() => query.refetch()}
          className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary-container/20 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary-container/30"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      </div>
    );
  }

  // Success — render children with data
  return children(query.data);
}

export default QueryBoundary;
