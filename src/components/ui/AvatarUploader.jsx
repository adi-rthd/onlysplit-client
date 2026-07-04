import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUploadAvatar } from '../../queries/mutations/useUploadAvatar';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

/**
 * Resolves an avatarUrl to an absolute URL.
 */
const resolveUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  try {
    const origin = new URL(import.meta.env.VITE_API_BASE_URL).origin;
    return `${origin}${url}`;
  } catch {
    return url;
  }
};

/**
 * AvatarUploader — displays current avatar with a camera overlay button.
 * Handles file picking, validation, upload, and optimistic preview.
 *
 * @param {{
 *   avatarUrl: string,
 *   size?: string,
 *   onUploaded?: (avatarUrl: string) => void,
 *   className?: string,
 * }} props
 */
const AvatarUploader = ({ avatarUrl, size = 'w-36 h-36', onUploaded, className = '' }) => {
  const fileInputRef = useRef(null);
  const uploadMutation = useUploadAvatar();
  const [previewUrl, setPreviewUrl] = useState(null);

  const isUploading = uploadMutation.isPending;
  const displayUrl = previewUrl || resolveUrl(avatarUrl);

  const openFilePicker = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast('Only .jpg, .jpeg, .png, and .webp files are supported.', { icon: 'ℹ️' });
      return false;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast(`File size is too large. Please choose an image under ${MAX_SIZE_MB} MB.`, { icon: 'ℹ️' });
      return false;
    }
    return true;
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    // Reset input so same file can be re-selected
    event.target.value = '';

    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast('Only .jpg, .jpeg, .png, and .webp files are supported.', { icon: 'ℹ️' });
      return;
    }

    // Validate file size (must be under 5MB)
    if (file.size > MAX_SIZE_BYTES) {
      toast(`Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed is ${MAX_SIZE_MB} MB.`, { icon: 'ℹ️' });
      return;
    }

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    uploadMutation.mutate(file, {
      onSuccess: (data) => {
        // Revoke local preview and use the real URL
        URL.revokeObjectURL(localPreview);
        setPreviewUrl(null);
        onUploaded?.(data.avatarUrl);
      },
      onError: () => {
        // Revert preview on failure
        URL.revokeObjectURL(localPreview);
        setPreviewUrl(null);
      },
    });
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Avatar image — clickable on mobile */}
      <div
        className={`${size} rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary transition-colors cursor-pointer`}
        onClick={openFilePicker}
        role="button"
        tabIndex={0}
        aria-label="Upload avatar"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openFilePicker();
          }
        }}
      >
        <img
          src={displayUrl}
          alt="Profile avatar"
          className="w-full h-full object-cover"
        />

        {/* Loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
            <Loader2 size={28} className="text-white animate-spin" />
          </div>
        )}

        {/* Hover overlay (hidden while uploading) */}
        {!isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
            <Camera size={28} className="text-white" />
          </div>
        )}
      </div>

      {/* Camera icon button — positioned bottom-right */}
      <button
        onClick={openFilePicker}
        disabled={isUploading}
        className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-lg border-2 border-surface hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Change avatar photo"
        title="Change avatar"
      >
        {isUploading ? (
          <Loader2 size={14} className="text-white animate-spin" />
        ) : (
          <Camera size={14} className="text-white" />
        )}
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        hidden
        onChange={handleFileChange}
      />
    </div>
  );
};

export default AvatarUploader;
