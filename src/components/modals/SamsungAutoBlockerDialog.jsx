import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import analyticsService from '../../services/analyticsService';

const SamsungAutoBlockerDialog = ({
    open,
    onContinue,
    onOpenSettings,
    onCancel,
    onDismissPreference
}) => {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    // 5.1: Emit samsung_notice_shown when the dialog opens
    useEffect(() => {
        if (open) {
            analyticsService.trackDownloadEvent('samsung_notice_shown');
        }
    }, [open]);

    const handleCheckboxChange = (e) => {
        const checked = e.target.checked;
        setDontShowAgain(checked);
        onDismissPreference(checked);
    };

    // 5.2 & 5.5: Emit samsung_continue_clicked, and samsung_dont_show_again_enabled if checkbox is checked
    const handleContinue = () => {
        analyticsService.trackDownloadEvent('samsung_continue_clicked');
        if (dontShowAgain) {
            analyticsService.trackDownloadEvent('samsung_dont_show_again_enabled');
        }
        onContinue();
    };

    // 5.3: Emit samsung_open_settings_clicked
    const handleOpenSettings = () => {
        analyticsService.trackDownloadEvent('samsung_open_settings_clicked');
        onOpenSettings();
    };

    // 5.4: Emit samsung_cancel_clicked
    const handleCancel = () => {
        analyticsService.trackDownloadEvent('samsung_cancel_clicked');
        onCancel();
    };

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.9,
                            y: 20
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.9,
                            y: 20
                        }}
                        transition={{
                            duration: 0.2
                        }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="samsung-dialog-title"
                        className="w-full max-w-md rounded-3xl bg-[#0f0f12] border border-white/10 shadow-2xl overflow-hidden"
                    >
                        <div className="p-6">
                            {/* Header with icon and title */}
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-500/15">
                                    <Shield
                                        size={28}
                                        className="text-amber-400"
                                    />
                                </div>

                                <div>
                                    <h3
                                        id="samsung-dialog-title"
                                        className="text-xl font-bold text-white"
                                    >
                                        Samsung Security Notice
                                    </h3>
                                </div>
                            </div>

                            {/* Subtitle */}
                            <p className="text-on-surface-variant mb-4">
                                Some Samsung devices enable Auto Blocker, which
                                may prevent installing updates downloaded outside
                                the Play Store.
                            </p>

                            {/* Instruction box */}
                            <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4 mb-4">
                                <p className="text-on-surface-variant text-sm mb-2">
                                    If the installer doesn&apos;t appear:
                                </p>
                                <p className="text-white font-medium text-sm mb-2">
                                    Settings → Security &amp; Privacy → Auto
                                    Blocker → Turn Off
                                </p>
                                <p className="text-on-surface-variant text-sm">
                                    You can enable it again after the
                                    installation is complete.
                                </p>
                            </div>

                            {/* Checkbox */}
                            <label className="flex items-center gap-3 mb-6 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={dontShowAgain}
                                    onChange={handleCheckboxChange}
                                    className="w-4 h-4 rounded border-white/20 bg-white/5 accent-primary"
                                />
                                <span className="text-on-surface-variant text-sm">
                                    Don&apos;t show this message again
                                </span>
                            </label>

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 py-3 rounded-2xl border border-white/10 hover:bg-white/5 transition text-sm"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleOpenSettings}
                                    className="flex-1 py-3 rounded-2xl border border-white/10 hover:bg-white/5 transition text-sm"
                                >
                                    Open Settings
                                </button>

                                <button
                                    onClick={handleContinue}
                                    className="flex-1 py-3 rounded-2xl font-semibold bg-primary/15 text-primary border border-primary/20 hover:bg-primary/20 transition text-sm"
                                >
                                    Continue Installation
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default SamsungAutoBlockerDialog;
