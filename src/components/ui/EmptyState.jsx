import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Shown when a list or data set has no items.
 */
const EmptyState = ({ icon: Icon = Inbox, title = 'Nothing here yet', description = '' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
        <Icon className="text-on-surface-variant" size={28} />
      </div>
      <h3 className="text-lg font-medium text-on-surface mb-1">{title}</h3>
      {description && (
        <p className="text-on-surface-variant text-sm max-w-xs">{description}</p>
      )}
    </div>
  );
};

export default EmptyState;
