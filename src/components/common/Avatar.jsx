import React, { useState, memo } from 'react';

/**
 * Resolves an avatarUrl to an absolute URL.
 * - If already absolute (starts with http), use as-is.
 * - If relative, prepend the API origin (without /api).
 */
const resolveAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('http')) return avatarUrl;
  try {
    const origin = new URL(import.meta.env.VITE_API_BASE_URL).origin;
    return `${origin}${avatarUrl}`;
  } catch {
    return avatarUrl;
  }
};

/**
 * Get initials from first/last name.
 */
const getInitials = (firstName, lastName) => {
  const first = firstName?.[0] || '';
  const last = lastName?.[0] || '';
  return (first + last).toUpperCase() || 'U';
};

/**
 * Size map — maps size key to pixel dimensions.
 */
const SIZE_MAP = {
  xs: 'w-6 h-6 text-[9px]',
  sm: 'w-8 h-8 text-[10px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-14 h-14 text-sm',
  xl: 'w-20 h-20 text-lg',
};

/**
 * Reusable Avatar component.
 *
 * Shows the user's uploaded avatar image when available.
 * Falls back to initials when avatarUrl is null, empty, or fails to load.
 *
 * @param {{
 *   firstName?: string,
 *   lastName?: string,
 *   avatarUrl?: string | null,
 *   size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
 *   className?: string,
 * }} props
 */
const Avatar = memo(({ firstName, lastName, avatarUrl, size = 'md', className = '' }) => {
  const [imgError, setImgError] = useState(false);
  const resolvedUrl = resolveAvatarUrl(avatarUrl);
  const initials = getInitials(firstName, lastName);
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;

  const showImage = resolvedUrl && !imgError;

  if (showImage) {
    return (
      <div className={`${sizeClasses} rounded-full overflow-hidden shrink-0 ${className}`}>
        <img
          src={resolvedUrl}
          alt={`${firstName || ''} ${lastName || ''}`.trim() || 'User'}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Fallback: initials avatar
  return (
    <div
      className={`${sizeClasses} rounded-full bg-surface-container-high text-on-surface-variant font-bold flex items-center justify-center shrink-0 ${className}`}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
});

Avatar.displayName = 'Avatar';

export default Avatar;
