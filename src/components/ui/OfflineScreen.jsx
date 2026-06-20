/**
 * Full-screen offline indicator — truly mobile native.
 * No horizontal scroll, safe-area aware, perfectly centered.
 */
import { WifiOff, RefreshCw } from 'lucide-react';

const OfflineScreen = ({ onRetry }) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        maxWidth: '100vw',
        height: '100dvh',
        boxSizing: 'border-box',
        zIndex: 9999,

        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',

        padding: 'max(24px, env(safe-area-inset-top)) 24px max(24px, env(safe-area-inset-bottom))',

        backgroundColor: '#090909',

        overflow: 'hidden',
        overflowX: 'hidden',

        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Content wrapper */}
      <div
        style={{
          width: '100%',
          maxWidth: 320,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            backgroundColor: '#1d1d1d',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
            flexShrink: 0,
          }}
        >
          <WifiOff size={40} color="#9e9ea7" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#f5f5f5',
            margin: '0 0 12px',
            lineHeight: 1.2,
            wordBreak: 'break-word',
          }}
        >
          No Connection
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 15,
            color: '#9e9ea7',
            margin: '0 0 40px',
            lineHeight: 1.5,
            maxWidth: '100%',
            wordBreak: 'break-word',
          }}
        >
          Connect to the internet to sync your expenses and groups.
        </p>

        {/* Retry Button */}
        <button
          onClick={onRetry}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,

            width: '100%',
            maxWidth: 220,

            minHeight: 56,
            padding: '16px 24px',

            borderRadius: 16,
            backgroundColor: '#1d1d1d',
            border: '1px solid rgba(255,255,255,0.08)',

            color: '#f5f5f5',
            fontSize: 15,
            fontWeight: 600,

            cursor: 'pointer',

            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
        >
          <RefreshCw size={18} />
          Try Again
        </button>
      </div>
    </div>
  );
};

export default OfflineScreen;