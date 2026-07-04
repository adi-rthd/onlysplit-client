/**
 * Mandatory update full-screen blocker with in-app download.
 * User cannot dismiss — must update to continue.
 */
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, Download, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { downloadApk, installApk, shouldShowSamsungDialog, dismissSamsungDialog } from '../../services/updateService';
import { DeviceUtils } from '../../plugins/deviceUtils';
import SamsungAutoBlockerDialog from './SamsungAutoBlockerDialog';

const MandatoryUpdateScreen = ({ updateInfo }) => {
  const [state, setState] = useState('idle'); // idle | downloading | complete | installing | error
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [showSamsungDialog, setShowSamsungDialog] = useState(false);
  const fileUriRef = useRef(null);
  const dontShowAgainRef = useRef(false);

  // Disable Android back button
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listener;
    import('@capacitor/app').then(({ App }) => {
      listener = App.addListener('backButton', () => {});
    });

    return () => {
      if (listener) listener.then((l) => l.remove());
    };
  }, []);

  if (!updateInfo) return null;

  const handleUpdate = async () => {
    setState('downloading');
    setProgress(0);

    try {
      const fileUri = await downloadApk(updateInfo.apkUrl, (p) => {
        setProgress(p);
      });

      setState('complete');

      // Check if Samsung dialog should be shown before installing
      const showSamsungNotice = await shouldShowSamsungDialog();
      if (showSamsungNotice) {
        fileUriRef.current = fileUri;
        setShowSamsungDialog(true);
      } else {
        setTimeout(async () => {
          setState('installing');
          await installApk(fileUri);
          // If user comes back without installing, show button again
          setTimeout(() => setState('idle'), 5000);
        }, 800);
      }
    } catch (err) {
      setError(err.message || 'Download failed');
      setState('error');
    }
  };

  const handleSamsungContinue = async () => {
    setShowSamsungDialog(false);
    if (dontShowAgainRef.current) {
      await dismissSamsungDialog();
    }
    setState('installing');
    await installApk(fileUriRef.current);
    // If user comes back without installing, show button again
    setTimeout(() => setState('idle'), 5000);
  };

  const handleSamsungOpenSettings = async () => {
    await DeviceUtils.openSecuritySettings();
    setShowSamsungDialog(false);
    setState('idle');
  };

  const handleSamsungCancel = () => {
    setShowSamsungDialog(false);
    setState('idle');
  };

  return (
    <>
      {createPortal(
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-surface-charcoal p-6"
          style={{ margin: 0 }}
        >
          {/* Glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 15 }}
              className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8"
            >
              {state === 'complete' || state === 'installing' ? (
                <CheckCircle2 size={36} className="text-neon-lime" />
              ) : (
                <ShieldAlert size={36} className="text-primary" />
              )}
            </motion.div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-on-surface mb-3">
              {state === 'complete' ? 'Download Complete' :
               state === 'installing' ? 'Installing Update' :
               'Update Required'}
            </h1>

            {/* Subtitle */}
            <p className="text-on-surface-variant mb-6">
              {state === 'downloading' ? `Downloading v${updateInfo.version}...` :
               state === 'complete' ? 'Preparing to install...' :
               state === 'installing' ? 'Opening installer...' :
               `A critical update to v${updateInfo.version} is required.`}
            </p>

            {/* Release notes (idle state) */}
            {state === 'idle' && updateInfo.releaseNotes?.length > 0 && (
              <div className="w-full bg-surface-container-low rounded-xl border border-glass-stroke p-4 mb-8 text-left">
                <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  What's New
                </p>
                <ul className="space-y-1.5">
                  {updateInfo.releaseNotes.map((note, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-on-surface">
                      <span className="text-primary mt-0.5">✓</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Progress bar */}
            {(state === 'downloading' || state === 'complete') && (
              <div className="w-full mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-on-surface-variant">
                    {state === 'complete' ? 'Complete' : 'Downloading'}
                  </span>
                  <span className="text-sm font-semibold text-on-surface tabular-nums">{progress}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-surface-container-low overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary-container"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Installing spinner */}
            {state === 'installing' && (
              <div className="flex items-center gap-3 mb-8">
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span className="text-sm text-on-surface-variant">Opening installer...</span>
              </div>
            )}

            {/* Error */}
            {state === 'error' && (
              <div className="w-full bg-error/10 border border-error/20 rounded-xl p-4 mb-6">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            {/* Button */}
            {(state === 'idle' || state === 'error') && (
              <button
                onClick={handleUpdate}
                className="w-full py-4 rounded-2xl bg-primary text-white font-semibold flex items-center justify-center gap-2.5 hover:bg-primary/90 transition-all shadow-[0_8px_30px_rgba(124,108,255,0.3)]"
              >
                {state === 'error' ? (
                  <>
                    <RefreshCw size={18} />
                    Retry Download
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Update Now
                  </>
                )}
              </button>
            )}

            {/* Version */}
            <p className="text-xs text-on-surface-variant/50 mt-8">
              v{updateInfo.version} • Build {updateInfo.versionCode}
            </p>
          </div>
        </motion.div>,
        document.body
      )}
      <SamsungAutoBlockerDialog
        open={showSamsungDialog}
        onContinue={handleSamsungContinue}
        onOpenSettings={handleSamsungOpenSettings}
        onCancel={handleSamsungCancel}
        onDismissPreference={(checked) => { dontShowAgainRef.current = checked; }}
      />
    </>
  );
};

export default MandatoryUpdateScreen;
