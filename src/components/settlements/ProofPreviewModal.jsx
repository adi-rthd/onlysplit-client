import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Download, FileText } from 'lucide-react';

/**
 * Fullscreen proof preview modal.
 * Displays images inline and PDFs in an iframe.
 * Does not force download — renders content directly.
 *
 * @param {{ url: string, onClose: () => void }} props
 */
const ProofPreviewModal = ({ url, onClose }) => {
  const overlayRef = useRef(null);
  const isPdf = url?.toLowerCase().endsWith('.pdf');

  // Focus trap + escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <motion.div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Payment proof preview"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        aria-label="Close preview"
      >
        <X size={20} className="text-white" />
      </button>

      {/* Download button */}
      <a
        href={url}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-4 right-16 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        aria-label="Download proof"
      >
        <Download size={18} className="text-white" />
      </a>

      {/* Content */}
      {isPdf ? (
        <div className="w-full max-w-3xl h-[80vh] rounded-2xl overflow-hidden bg-white">
          <iframe
            src={url}
            className="w-full h-full"
            title="Payment proof PDF"
          />
        </div>
      ) : (
        <motion.img
          src={url}
          alt="Payment proof"
          className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        />
      )}
    </motion.div>
  );
};

export default ProofPreviewModal;
