/**
 * Mandatory update full-screen blocker.
 * Shown when a mandatory update is available.
 * User cannot dismiss — they must update to continue.
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, Download, RefreshCw } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { downloadUpdate } from '../../services/updateService';

const MandatoryUpdateScreen = ({ updateInfo }) => {
  const [downloading, setDownloading] = useState(false);

  // Disable Android back button while this screen is active
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listener;

    import('@capacitor/app').then(({ App }) => {
      listener = App.addListener('backButton', () => {
        // Block back navigation
      });
    });

    return () => {
      if (listener) {
        listener.then((l) => l.remove());
      }
    };
  }, []);

  if (!updateInfo) return null;

  const handleUpdate = async () => {
    try {
      setDownloading(true);

      await downloadUpdate(updateInfo.apkUrl);

      // User may come back without installing
      setTimeout(() => {
        setDownloading(false);
      }, 5000);
    } catch (error) {
      console.error('Failed to start update:', error);
      setDownloading(false);
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,

        width: '100%',
        maxWidth: '100vw',
        height: '100dvh',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        boxSizing: 'border-box',

        padding:
          'max(24px, env(safe-area-inset-top)) 24px max(24px, env(safe-area-inset-bottom))',

        overflow: 'hidden',
        overflowX: 'hidden',

        backgroundColor: 'var(--surface-charcoal)',
      }}
    >
      {/* Responsive glow */}
      <div
        className="bg-primary/10"
        style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',

          width: 'min(70vw, 320px)',
          height: 'min(70vw, 320px)',

          borderRadius: '9999px',
          filter: 'blur(80px)',

          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div
        className="relative z-10"
        style={{
          width: '100%',
          maxWidth: 360,

          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',

          textAlign: 'center',
        }}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.2,
            type: 'spring',
            damping: 15,
          }}
          className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8"
        >
          <ShieldAlert
            size={36}
            className="text-primary"
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-on-surface mb-3"
          style={{
            wordBreak: 'break-word',
          }}
        >
          Update Required
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-on-surface-variant mb-6"
          style={{
            lineHeight: 1.6,
            wordBreak: 'break-word',
          }}
        >
          A critical update is required to continue using
          OnlySplit. Please update to v
          {updateInfo.version}.
        </motion.p>

        {/* Release Notes */}
        {updateInfo.releaseNotes?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full bg-surface-container-low rounded-xl border border-glass-stroke p-4 mb-8 text-left overflow-hidden"
            style={{
              wordBreak: 'break-word',
            }}
          >
            <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
              What's New
            </p>

            <ul className="space-y-2">
              {updateInfo.releaseNotes.map(
                (note, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-on-surface"
                    style={{
                      wordBreak: 'break-word',
                    }}
                  >
                    <span className="text-primary mt-0.5">
                      •
                    </span>

                    <span>{note}</span>
                  </li>
                )
              )}
            </ul>
          </motion.div>
        )}

        {/* Update Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={handleUpdate}
          disabled={downloading}
          className="w-full rounded-2xl bg-primary text-white font-semibold flex items-center justify-center gap-2.5 hover:bg-primary/90 transition-all shadow-[0_8px_30px_rgba(124,108,255,0.3)] disabled:opacity-60"
          style={{
            minHeight: 56,
            padding: '16px 24px',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {downloading ? (
            <>
              <RefreshCw
                size={18}
                className="animate-spin"
              />
              Preparing update...
            </>
          ) : (
            <>
              <Download size={18} />
              Update Now
            </>
          )}
        </motion.button>

        {/* Version */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xs text-on-surface-variant/50 mt-6"
        >
          v{updateInfo.version} • Build{' '}
          {updateInfo.versionCode}
        </motion.p>
      </div>
    </motion.div>,
    document.body
  );
};

export default MandatoryUpdateScreen;