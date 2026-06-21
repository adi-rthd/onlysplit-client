import React from 'react';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Capacitor } from '@capacitor/core';

/**
 * Platform-conditional router wrapper.
 *
 * - Web (non-Capacitor): BrowserRouter + HelmetProvider for SEO support
 * - Capacitor (native): HashRouter only (no SEO code)
 *
 * Also handles backward-compatible hash-to-path redirects on web so that
 * old bookmarked URLs like /#/dashboard still resolve correctly after the
 * migration from HashRouter to BrowserRouter.
 */

// Perform hash-to-path redirect before React renders (web only).
// If the URL contains a hash starting with '#/', strip it and replace
// the history entry with the clean path so BrowserRouter picks it up.
if (
  typeof window !== 'undefined' &&
  !Capacitor.isNativePlatform() &&
  window.location.hash.startsWith('#/')
) {
  const path = window.location.hash.slice(1); // remove '#', keep '/...'
  window.history.replaceState(null, '', path);
}

function PlatformRouter({ children }) {
  if (Capacitor.isNativePlatform()) {
    return <HashRouter>{children}</HashRouter>;
  }

  return (
    <BrowserRouter>
      <HelmetProvider>{children}</HelmetProvider>
    </BrowserRouter>
  );
}

export default PlatformRouter;
