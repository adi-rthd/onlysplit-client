import React, { useEffect, useState, useCallback } from 'react';
import PlatformRouter from './components/PlatformRouter';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';

import QueryProvider from './providers/QueryProvider';
import AppRoutes from './routes/AppRoutes';
import authService from './services/authService';
import CommonToaster from './components/ui/CommonToaster';
import UpdateModal from './components/modals/UpdateModal';
import MandatoryUpdateScreen from './components/modals/MandatoryUpdateScreen';
import OfflineScreen from './components/ui/OfflineScreen';
import GlobalErrorBoundary from './components/ui/GlobalErrorBoundary';
import OfflineIndicator from './components/ui/OfflineIndicator';
import { checkForUpdate } from './services/updateService';
import { useSignalR } from './hooks/useSignalR';
import { useAuthStore } from './store/authStore';
import NotificationListener from './components/listeners/NotificationListener';
import PaymentListener from './components/listeners/PaymentListener';

function App() {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // ✅ FIX 1: Pull isLoading from the store
  const isLoading = useAuthStore((s) => s.isLoading); 

  // Start/stop SignalR connections based on auth state
  useSignalR();

  // Restore auth session — wait for Zustand persist hydration first
  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      authService.restoreSession();
      return;
    }

    const unsub = useAuthStore.persist.onFinishHydration(() => {
      authService.restoreSession();
    });

    return () => unsub();
  }, []);

  // Native network monitoring
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // ✅ FIX 2: Safely track the promise to prevent race conditions during unmount
    const setupNetwork = async () => {
      const { Network } = await import('@capacitor/network');
      
      const status = await Network.getStatus();
      setIsOffline(!status.connected);

      return Network.addListener('networkStatusChange', (status) => {
        setIsOffline(!status.connected);
      });
    };

    const listenerPromise = setupNetwork();

    return () => {
      listenerPromise.then(listener => listener.remove());
    };
  }, []);

  // Retry button for offline screen
  const handleRetry = useCallback(() => {
    if (!Capacitor.isNativePlatform()) return;

    import('@capacitor/network').then(({ Network }) => {
      Network.getStatus().then((status) => {
        setIsOffline(!status.connected);
      });
    });
  }, []);

  // Reset dismissed state when new update arrives
  useEffect(() => {
    setUpdateDismissed(false);
  }, [updateInfo?.versionCode]);

  // Shared update checker
  const runUpdateCheck = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    if (isOffline) return;

    try {
      const info = await checkForUpdate();

      if (info && info.versionCode !== updateInfo?.versionCode) {
        setUpdateInfo(info);
      }
    } catch (error) {
      console.error('Update check failed:', error);
    }
  }, [isOffline, updateInfo?.versionCode]);

  // Initial update check — only when logged in
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    if (isOffline) return;
    if (!isAuthenticated) return;

    const timer = setTimeout(runUpdateCheck, 1500);

    return () => clearTimeout(timer);
  }, [runUpdateCheck, isOffline, isAuthenticated]);

  // Re-check updates when app resumes
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = CapApp.addListener('resume', () => {
      runUpdateCheck();
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, [runUpdateCheck]);

  // Android hardware back button
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = CapApp.addListener('backButton', ({ canGoBack }) => {
      // Block back on mandatory update or offline
      if (updateInfo?.mandatory || isOffline) {
        return;
      }

      // Dismiss optional update first
      if (updateInfo && !updateInfo.mandatory && !updateDismissed) {
        setUpdateDismissed(true);
        return;
      }

      if (canGoBack) {
        window.history.back();
      } else {
        CapApp.minimizeApp();
      }
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, [updateInfo, updateDismissed, isOffline]);

  // ✅ FIX 1 (Continued): Block the entire UI while restoring the session
  if (isLoading) {
    // You can return a generic splash screen component here, 
    // or return `null` if Capacitor's native Splash Screen is configured to autoHide: false
    return null; 
  }

  // Offline screen blocks entire app
  if (Capacitor.isNativePlatform() && isOffline) {
    return (
      <QueryProvider>
        <PlatformRouter>
          <CommonToaster />
          <OfflineScreen onRetry={handleRetry} />
        </PlatformRouter>
      </QueryProvider>
    );
  }

  return (
    <QueryProvider>
      <PlatformRouter>
        <CommonToaster />

        {/* Mandatory update blocks the app — only when logged in */}
        {updateInfo?.mandatory && isAuthenticated ? (
          <MandatoryUpdateScreen updateInfo={updateInfo} />
        ) : (
          <>
            <GlobalErrorBoundary>
              <AppRoutes />
            </GlobalErrorBoundary>

            <OfflineIndicator />

            {/* Global real-time listeners — only when logged in */}
            {isAuthenticated && (
              <>
                <NotificationListener />
                <PaymentListener />
              </>
            )}

            {/* Optional update — only when logged in */}
            {updateInfo && !updateDismissed && isAuthenticated && (
              <UpdateModal
                updateInfo={updateInfo}
                onDismiss={() => setUpdateDismissed(true)}
              />
            )}
          </>
        )}
      </PlatformRouter>
    </QueryProvider>
  );
}

export default App;