import React from 'react';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-surface-container-high/60 ${className}`} />
);

export const SkeletonText = ({ className = '', lines = 1 }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={`animate-pulse rounded bg-surface-container-high/60 h-3 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`} />
    ))}
  </div>
);

export default Skeleton;
