/**
 * Optional update bottom-sheet with in-app download progress.
 * User stays inside the app — never sees a browser.
 *
 * States: idle → downloading (with progress) → installing
 */
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { downloadApk, installApk } from '../../services/updateService';

const UpdateModal = ({ updateInfo, onDismiss }) => {
  const [state, setState] = useState('idle'); // idle | downloading | complete | installing | error
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  if (!updateInfo) return null;

  const handleUpdate = async () => {
    setState('downloading');
    setProgress(0);

    try {
      const fileUri = await downloadApk(updateInfo.apkUrl, (p) => {
        setProgress(p);
      });
      
      setState('complete');

      // Brief pause to show 100%, then trigger install
      setTimeout(async () => {
        setState('installing');
        await installApk(fileUri);
      }, 800);
    } catch (err) {
      console.error('[Update] Download failed:', err);
      setError(err.message || 'Download failed');
      setState('error');
    }
  };

  const handleRetry = () => {
    setError('');
    handleUpdate();
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 backdrop-blur-sm"
        style={{ margin: 0 }}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="w-full max-w-md bg-surface-container rounded-t-3xl border-t border-x border-glass-stroke shadow-2xl p-6"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 24px)' }}
        >
          {/* Handle bar */}
          <div className="w-10 h-1 rounded-full bg-outline-variant mx-auto mb-6" />

          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                {state === 'complete' || state === 'installing' ? (
                  <CheckCircle2 size={20} className="text-neon-lime" />
                ) : (
                  <Sparkles size={20} className="text-primary" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface">
                  {state === 'complete' ? 'Download Complete' :
                   state === 'installing' ? 'Installing...' :
                   'Update Available'}
                </h3>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  v{updateInfo.version}
                </p>
              </div>
            </div>
            {state === 'idle' && (
              <button
                onClick={onDismiss}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center"
              >
                <X size={14} className="text-on-surface-variant" />
              </button>
            )}
          </div>

          {/* Release notes (only in idle state) */}
          {state === 'idle' && updateInfo.releaseNotes?.length > 0 && (
            <div className="bg-surface-container-low rounded-xl border border-glass-stroke p-4 mb-6">
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

          {/* Progress bar (downloading state) */}
          {(state === 'downloading' || state === 'complete') && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-on-surface-variant">
                  {state === 'complete' ? 'Download complete' : 'Downloading...'}
                </span>
                <span className="text-sm font-semibold text-on-surface tabular-nums">
                  {progress}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-surface-container-low overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary-container"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Installing state */}
          {state === 'installing' && (
            <div className="flex items-center gap-3 mb-6 py-3">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-sm text-on-surface-variant">Opening installer...</span>
            </div>
          )}

          {/* Error state */}
          {state === 'error' && (
            <div className="bg-error/10 border border-error/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {state === 'idle' && (
              <>
                <button
                  onClick={onDismiss}
                  className="flex-1 py-3.5 rounded-xl border border-glass-stroke text-on-surface-variant text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Later
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 py-3.5 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <Download size={16} />
                  Update Now
                </button>
              </>
            )}

            {state === 'error' && (
              <>
                <button
                  onClick={onDismiss}
                  className="flex-1 py-3.5 rounded-xl border border-glass-stroke text-on-surface-variant text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRetry}
                  className="flex-1 py-3.5 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2"
                >
                  Retry
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default UpdateModal;
