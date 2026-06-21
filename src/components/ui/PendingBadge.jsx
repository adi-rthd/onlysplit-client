import React from 'react';

/**
 * PendingBadge — a small pill indicator for optimistically-inserted items.
 *
 * Renders a subtle animated badge that signals an item hasn't been confirmed
 * by the server yet (i.e., `item._isPending === true`).
 *
 * Uses the app's glass-panel design tokens with a pulse animation.
 */
export function PendingBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary animate-pulse ${className}`}
    >
      Pending…
    </span>
  );
}

export default PendingBadge;
