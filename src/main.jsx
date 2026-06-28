import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import App from './App.jsx';
import './index.css';

// ─── Native Android system bar styling & Capgo Updater ──────────────────
// Only runs on native platforms (no-op on web).
if (Capacitor.isNativePlatform()) {
  import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
    // Dark background with light (white) icons
    StatusBar.setBackgroundColor({ color: '#18181B' });
    StatusBar.setStyle({ style: Style.Dark });
  });

  // Notify Capgo that the app successfully loaded (prevents rollback)
  import('@capgo/capacitor-updater').then(({ CapacitorUpdater }) => {
    CapacitorUpdater.notifyAppReady().catch((err) => {
      console.warn('[Capgo] notifyAppReady failed:', err);
    });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
