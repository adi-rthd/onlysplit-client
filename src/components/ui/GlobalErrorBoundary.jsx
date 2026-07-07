import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Global error boundary — catches unhandled rendering errors anywhere
 * in the component tree and displays a recovery screen.
 *
 * The "Reload" button resets internal state so React re-renders children
 * (re-mounts the current route) without a full page refresh.
 */
class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[GlobalErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-surface-charcoal p-6">
          {/* Subtle glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-error/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full">
            {/* Icon */}
            <div className="w-20 h-20 rounded-3xl bg-error-container/20 border border-error/20 flex items-center justify-center mb-8">
              <AlertTriangle size={36} className="text-error" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-on-surface mb-3">
              Something went wrong
            </h1>

            {/* Error description */}
            <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
              {this.state.error?.message || 'An unexpected error occurred. Please reload to continue.'}
            </p>

            {/* Reload button */}
            <button
              onClick={this.handleReset}
              className="flex items-center justify-center gap-2.5 w-full max-w-[220px] py-4 rounded-2xl glass-panel text-on-surface font-semibold transition-all hover:border-primary/30 hover:shadow-[0_0_30px_rgba(124,108,255,0.15)]"
            >
              <RefreshCw size={18} />
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
