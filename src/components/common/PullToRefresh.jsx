import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { ArrowDown, Loader2 } from 'lucide-react';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';

/**
 * Universal Pull-to-Refresh Wrapper Component.
 * Supports Web, PWA, and Capacitor (Android & iOS).
 * 
 * Features:
 * - Touch + mouse drag physics (rubber-banding/tension)
 * - GPU-accelerated Framer Motion animations
 * - Screen-reader accessible keyboard refresh trigger
 * - Reduced motion support
 * - Haptic vibration feedback
 */
const PullToRefresh = ({ children, onRefresh, threshold = 80 }) => {
  const containerRef = useRef(null);
  const { isRefreshing: defaultIsRefreshing, triggerRefresh } = usePullToRefresh();
  
  const isRefreshing = onRefresh ? false : defaultIsRefreshing;
  const handleRefresh = onRefresh || triggerRefresh;

  const [status, setStatus] = useState('idle'); // idle, pulling, refreshing, resetting
  const statusRef = useRef(status);
  
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const hasVibratedRef = useRef(false);
  const y = useMotionValue(0);

  // Check if system prefers reduced motion
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // Visual interpolations for dragging indicator
  const opacity = useTransform(y, [0, threshold * 0.6, threshold], [0, 0.8, 1]);
  const scale = useTransform(y, [0, threshold * 0.6, threshold], [0.6, 0.9, 1.1]);
  const arrowRotation = useTransform(y, [0, threshold], [0, 180]);

  // Safe window-level scroll position check to support nested scrolling container layouts
  const isScrollAtTop = useCallback(() => {
    if (containerRef.current) {
      let parent = containerRef.current.parentElement;
      while (parent && parent !== document.body) {
        if (parent.scrollTop > 0) return false;
        parent = parent.parentElement;
      }
    }
    const windowScroll = window.scrollY || document.documentElement.scrollTop;
    return windowScroll === 0;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startY = 0;
    let startX = 0;
    let isTracking = false;
    let isPullingActive = false;

    const handleStart = (e) => {
      // Only trigger if scroll position is at the very top
      if (!isScrollAtTop()) return;

      // Do not allow pulling while already refreshing
      if (statusRef.current === 'refreshing') return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      startY = clientY;
      startX = clientX;
      isTracking = true;
      isPullingActive = false;
    };

    const handleMove = (e) => {
      if (!isTracking) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const diffY = clientY - startY;
      const diffX = clientX - startX;

      // Dragging upward means normal scrolling
      if (diffY <= 0) {
        isTracking = false;
        return;
      }

      if (!isPullingActive) {
        // If horizontal delta is greater than vertical, the user is scrolling sideways (ignore)
        if (Math.abs(diffX) > Math.abs(diffY)) {
          isTracking = false;
          return;
        }
        // Vertical downward drag started
        if (diffY > 10) {
          isPullingActive = true;
          setStatus('pulling');
        }
      }

      if (isPullingActive) {
        // Cancel default web overscroll behaviors
        if (e.cancelable) {
          e.preventDefault();
        }

        // Tension formula to make dragging asymptotic and premium
        const tension = threshold * 1.5;
        const distance = (diffY * tension) / (diffY + tension);
        y.set(distance);

        // Haptic feedback bump once when threshold is crossed
        if (distance >= threshold && !hasVibratedRef.current) {
          hasVibratedRef.current = true;
          try {
            if (navigator.vibrate) {
              navigator.vibrate(15);
            }
          } catch (_) {
            // Safe fallback for browsers/platforms restricting vibrate
          }
        } else if (distance < threshold) {
          hasVibratedRef.current = false;
        }
      }
    };

    const handleEnd = () => {
      if (!isTracking) return;
      isTracking = false;

      if (isPullingActive) {
        isPullingActive = false;
        const currentDist = y.get();

        if (currentDist >= threshold) {
          setStatus('refreshing');
          const animOptions = prefersReducedMotion 
            ? { duration: 0 } 
            : { type: 'spring', stiffness: 350, damping: 28 };
          
          animate(y, 50, animOptions);
          
          // Trigger refresh logic
          Promise.resolve(handleRefresh()).catch((err) => {
            console.error('[PullToRefresh] Refresh execution error:', err);
            // Auto reset if promise fails
            setStatus('resetting');
            animate(y, 0, animOptions).then(() => setStatus('idle'));
          });
        } else {
          setStatus('resetting');
          const animOptions = prefersReducedMotion 
            ? { duration: 0 } 
            : { type: 'spring', stiffness: 350, damping: 28 };
          
          animate(y, 0, animOptions).then(() => {
            setStatus('idle');
          });
        }
      }
    };

    // Attach local starting listeners
    container.addEventListener('touchstart', handleStart, { passive: true });
    container.addEventListener('mousedown', handleStart);

    // Attach global move/end listeners so pulling is smooth even if dragging goes off container/screen
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', handleEnd);
    window.addEventListener('mouseup', handleEnd);

    return () => {
      container.removeEventListener('touchstart', handleStart);
      container.removeEventListener('mousedown', handleStart);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
      window.removeEventListener('mouseup', handleEnd);
    };
  }, [isScrollAtTop, y, handleRefresh, threshold, prefersReducedMotion]);

  // Handle programmatically driven reset when isRefreshing finishes
  useEffect(() => {
    if (!isRefreshing && status === 'refreshing') {
      setStatus('resetting');
      const animOptions = prefersReducedMotion 
        ? { duration: 0 } 
        : { type: 'spring', stiffness: 350, damping: 28 };

      animate(y, 0, animOptions).then(() => {
        setStatus('idle');
      });
    }
  }, [isRefreshing, status, y, prefersReducedMotion]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full min-h-0 select-none"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Accessible keyboard trigger for screen readers */}
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-1/2 focus:-translate-x-1/2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-primary-container"
      >
        {isRefreshing ? 'Refreshing data...' : 'Press Enter to refresh page data'}
      </button>

      {/* Pull Indicator Bubble */}
      {status !== 'idle' && (
        <motion.div
          style={{
            y,
            opacity,
            scale,
            left: '50%',
            x: '-50%',
          }}
          className="absolute top-4 z-50 flex items-center justify-center w-11 h-11 rounded-full bg-surface-container border border-glass-stroke shadow-lg select-none pointer-events-none"
          aria-hidden="true"
        >
          {status === 'refreshing' ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <motion.div
              style={{ rotate: arrowRotation }}
              className="flex items-center justify-center"
            >
              <ArrowDown className="w-5 h-5 text-primary" />
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Wrapped Content */}
      {children}
    </div>
  );
};

export default PullToRefresh;
