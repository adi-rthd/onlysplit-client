import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Full-section error state with an optional retry action.
 */
const ErrorState = ({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-error-container/20 flex items-center justify-center mb-4">
        <AlertTriangle className="text-error" size={28} />
      </div>
      <h3 className="text-lg font-medium text-on-surface mb-1">{title}</h3>
      <p className="text-on-surface-variant text-sm max-w-xs mb-6">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-container/20 text-primary border border-primary/30 hover:bg-primary-container/30 transition-colors font-medium"
        >
          <RefreshCw size={16} /> Try again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
