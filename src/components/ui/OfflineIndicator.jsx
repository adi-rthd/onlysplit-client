import React from 'react';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';

/**
 * OfflineIndicator — a persistent floating badge that shows the number
 * of pending offline mutations waiting to be synced.
 *
 * Only renders when there are queued mutations (pendingCount > 0).
 * Uses the app's glass-panel design system with pulse animation.
 */
export function OfflineIndicator() {
  const { pendingCount } = useOfflineQueue();

  if (pendingCount <= 0) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
      <div className="glass-panel rounded-full px-4 py-2 flex items-center gap-2 shadow-lg animate-pulse">
        <span className="inline-block w-2 h-2 rounded-full bg-primary" />
        <span className="text-xs font-medium text-primary">
          {pendingCount} pending
        </span>
      </div>
    </div>
  );
}

export default OfflineIndicator;
