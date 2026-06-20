import React, { useEffect, useState, useCallback } from 'react';
import { HashRouter } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';

import AppRoutes from './routes/AppRoutes';
import authService from './services/authService';
import CommonToaster from './components/ui/CommonToaster';
import UpdateModal from './components/modals/UpdateModal';
import MandatoryUpdateScreen from './components/modals/MandatoryUpdateScreen';
import OfflineScreen from './components/ui/OfflineScreen';
import { checkForUpdate } from './services/updateService';

function App() {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Restore auth session
  useEffect(() => {
    authService.restoreSession();
  }, []);

  // Native network monitoring
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let statusListener;

    import('@capacitor/network').then(({ Network }) => {
      Network.getStatus().then((status) => {
        setIsOffline(!status.connected);
      });

      statusListener = Network.addListener(
        'networkStatusChange',
        (status) => {
          setIsOffline(!status.connected);
        }
      );
    });

    return () => {
      if (statusListener) {
        statusListener.then((listener) => listener.remove());
      }
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

      if (
        info &&
        info.versionCode !== updateInfo?.versionCode
      ) {
        setUpdateInfo(info);
      }
    } catch (error) {
      console.error('Update check failed:', error);
    }
  }, [isOffline, updateInfo?.versionCode]);

  // Initial update check
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    if (isOffline) return;

    const timer = setTimeout(runUpdateCheck, 1500);

    return () => clearTimeout(timer);
  }, [runUpdateCheck, isOffline]);

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

    const listener = CapApp.addListener(
      'backButton',
      ({ canGoBack }) => {
        // Block back on mandatory update or offline
        if (updateInfo?.mandatory || isOffline) {
          return;
        }

        // Dismiss optional update first
        if (
          updateInfo &&
          !updateInfo.mandatory &&
          !updateDismissed
        ) {
          setUpdateDismissed(true);
          return;
        }

        if (canGoBack) {
          window.history.back();
        } else {
          CapApp.minimizeApp();
        }
      }
    );

    return () => {
      listener.then((l) => l.remove());
    };
  }, [
    updateInfo,
    updateDismissed,
    isOffline,
  ]);

  // Offline screen blocks entire app
  if (
    Capacitor.isNativePlatform() &&
    isOffline
  ) {
    return (
      <HashRouter>
        <CommonToaster />
        <OfflineScreen onRetry={handleRetry} />
      </HashRouter>
    );
  }

  return (
    <HashRouter>
      <CommonToaster />

      {/* Mandatory update blocks the app */}
      {updateInfo?.mandatory ? (
        <MandatoryUpdateScreen
          updateInfo={updateInfo}
        />
      ) : (
        <>
          <AppRoutes />

          {/* Optional update */}
          {updateInfo &&
            !updateDismissed && (
              <UpdateModal
                updateInfo={updateInfo}
                onDismiss={() =>
                  setUpdateDismissed(true)
                }
              />
            )}
        </>
      )}
    </HashRouter>
  );
}

export default App;