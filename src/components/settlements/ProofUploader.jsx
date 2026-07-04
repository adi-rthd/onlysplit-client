import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, Image as ImageIcon, RefreshCw } from 'lucide-react';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Proof uploader with drag & drop, preview, and file replacement.
 *
 * @param {{
 *   value?: File | null,
 *   existingUrl?: string,
 *   onChange: (file: File | null) => void,
 *   readOnly?: boolean,
 *   isUploading?: boolean,
 *   error?: string,
 *   className?: string,
 * }} props
 */
const ProofUploader = React.memo(({
  value = null,
  existingUrl = null,
  onChange,
  readOnly = false,
  isUploading = false,
  error: externalError = '',
  className = '',
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef(null);

  const displayError = externalError || validationError;

  const validateFile = useCallback((file) => {
    if (!file) return false;

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
      setValidationError(`Only ${ALLOWED_EXTENSIONS.join(', ')} files are allowed.`);
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setValidationError('File size must be under 5 MB.');
      return false;
    }

    setValidationError('');
    return true;
  }, []);

  const handleFileSelect = useCallback((file) => {
    if (validateFile(file)) {
      onChange(file);
    }
  }, [validateFile, onChange]);

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!readOnly) setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleRemove = () => {
    setValidationError('');
    onChange(null);
  };

  // Preview URL
  const previewUrl = value ? URL.createObjectURL(value) : existingUrl;
  const isPdf = value
    ? value.name?.toLowerCase().endsWith('.pdf')
    : existingUrl?.toLowerCase().endsWith('.pdf');
  const hasPreview = !!(previewUrl);

  // Read-only mode — just show the existing proof
  if (readOnly && existingUrl) {
    return (
      <div className={`${className}`}>
        <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium mb-1.5">
          Proof
        </p>
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container-high border border-glass-stroke">
          {isPdf ? (
            <div className="w-full h-full flex items-center justify-center">
              <FileText size={20} className="text-on-surface-variant" />
            </div>
          ) : (
            <img src={existingUrl} alt="Payment proof" className="w-full h-full object-cover" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium mb-1.5">
        Proof (optional)
      </p>

      {hasPreview ? (
        /* Preview + Replace/Remove */
        <div className="flex items-start gap-3">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container-high border border-glass-stroke shrink-0 relative">
            {isPdf ? (
              <div className="w-full h-full flex items-center justify-center">
                <FileText size={20} className="text-on-surface-variant" />
              </div>
            ) : (
              <img src={previewUrl} alt="Proof preview" className="w-full h-full object-cover" />
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <RefreshCw size={14} className="text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-[11px] text-on-surface-variant truncate max-w-[160px]">
              {value?.name || 'Existing proof'}
            </p>
            {!readOnly && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="text-[11px] text-primary font-medium hover:underline"
                  disabled={isUploading}
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-[11px] text-error font-medium hover:underline"
                  disabled={isUploading}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Drop zone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !readOnly && inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-glass-stroke/50 hover:border-primary/30 hover:bg-surface-container/30'
          } ${readOnly ? 'cursor-default opacity-50' : ''}`}
          role="button"
          tabIndex={readOnly ? -1 : 0}
          aria-label="Upload payment proof"
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !readOnly) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
        >
          <Upload size={18} className="text-on-surface-variant" />
          <p className="text-[11px] text-on-surface-variant text-center">
            {dragOver ? 'Drop file here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-[10px] text-on-surface-variant/60">
            JPG, PNG, or PDF • Max 5 MB
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_EXTENSIONS.join(',')}
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Validation error */}
      {displayError && (
        <p className="mt-1.5 text-[11px] text-error font-medium" role="alert">
          {displayError}
        </p>
      )}
    </div>
  );
});

ProofUploader.displayName = 'ProofUploader';

export default ProofUploader;
