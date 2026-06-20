/**
 * Optional update bottom-sheet modal.
 * Shown when a non-mandatory update is available.
 * User can dismiss with "Later" or proceed with "Update Now".
 */
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Sparkles, X } from 'lucide-react';
import { downloadUpdate } from '../../services/updateService';

const UpdateModal = ({ updateInfo, onDismiss }) => {
  const [downloading, setDownloading] = useState(false);

  if (!updateInfo) return null;

  const handleUpdate = async () => {
    setDownloading(true);
    await downloadUpdate(updateInfo.apkUrl);
    // Keep the modal visible briefly so user sees feedback
    setTimeout(() => {
      setDownloading(false);
      onDismiss();
    }, 2000);
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
        {/* Bottom sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="w-full max-w-md bg-surface-container rounded-t-3xl border-t border-x border-glass-stroke shadow-2xl p-6 pb-8"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 24px)' }}
        >
          {/* Handle bar */}
          <div className="w-10 h-1 rounded-full bg-outline-variant mx-auto mb-6" />

          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface">Update Available</h3>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  v{updateInfo.version}
                </p>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center"
            >
              <X size={14} className="text-on-surface-variant" />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-on-surface-variant mb-4">
            A new version of OnlySplit is ready.
          </p>

          {/* Release notes */}
          {updateInfo.releaseNotes?.length > 0 && (
            <div className="bg-surface-container-low rounded-xl border border-glass-stroke p-4 mb-6">
              <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                What's New
              </p>
              <ul className="space-y-1.5">
                {updateInfo.releaseNotes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-on-surface">
                    <span className="text-primary mt-0.5">•</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onDismiss}
              className="flex-1 py-3.5 rounded-xl border border-glass-stroke text-on-surface-variant text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Later
            </button>
            <button
              onClick={handleUpdate}
              disabled={downloading}
              className="flex-1 py-3.5 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {downloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Update Now
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default UpdateModal;
