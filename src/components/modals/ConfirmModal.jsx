import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({
    open,
    title = 'Confirm Action',
    message = 'Are you sure?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    danger = false,
    isLoading = false,
    onConfirm,
    onCancel
}) => {
    return (
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
                        className="w-full max-w-md rounded-3xl bg-[#0f0f12] border border-white/10 shadow-2xl overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-5">
                                <div
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                                        danger
                                            ? 'bg-red-500/15'
                                            : 'bg-primary/15'
                                    }`}
                                >
                                    <AlertTriangle
                                        size={28}
                                        className={
                                            danger
                                                ? 'text-red-400'
                                                : 'text-primary'
                                        }
                                    />
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        {title}
                                    </h3>

                                </div>
                            </div>

                            <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4 mb-6">
                                <p className="text-on-surface-variant">
                                    {message}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={onCancel}
                                    disabled={isLoading}
                                    className="flex-1 py-3 rounded-2xl border border-white/10 hover:bg-white/5 transition"
                                >
                                    {cancelText}
                                </button>

                                <button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className={`flex-1 py-3 rounded-2xl font-semibold transition ${
                                        danger
                                            ? 'bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                                            : 'bg-primary/15 text-primary border border-primary/20'
                                    }`}
                                >
                                    {isLoading
                                        ? 'Please wait...'
                                        : confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;