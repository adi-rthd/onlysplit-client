/**
 * Self-hosted APK update service — in-app download + install.
 *
 * Flow:
 *   1. Check latest.json for new version comparison
 *   2. Download APK to device storage with progress callback
 *   3. Trigger custom ApkInstaller package installer plugin
 */
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Browser } from '@capacitor/browser';
import { Preferences } from '@capacitor/preferences';
import { DeviceUtils } from '../plugins/deviceUtils';

const UPDATE_ENDPOINT = 'https://api-split.onlylabs.in/downloads/latest.json';
const APK_FILENAME = 'onlysplit-update.apk';

/**
 * @typedef {Object} UpdateInfo
 * @property {string} version
 * @property {number} versionCode
 * @property {string} apkUrl
 * @property {boolean} mandatory
 * @property {string[]} releaseNotes
 */

/**
 * Check for available updates.
 * @returns {Promise<UpdateInfo|null>}
 */
export async function checkForUpdate() {
  if (!Capacitor.isNativePlatform()) return null;

  try {
    const response = await fetch(UPDATE_ENDPOINT, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) return null;

    const latest = await response.json();

    // Get installed native app version code
    const { App } = await import('@capacitor/app');
    const appInfo = await App.getInfo();
    const installedVersionCode = parseInt(appInfo.build, 10) || 0;
    const installedVersion = appInfo.version || '';

    console.log('[UpdateService] Installed:', installedVersion, 'build:', installedVersionCode);
    console.log('[UpdateService] Server:', latest.version, 'build:', latest.versionCode);

    if (latest.versionCode > installedVersionCode || latest.version.trim() !== installedVersion.trim()) {
      return latest;
    }

    return null;
  } catch (error) {
    console.warn('[UpdateService] Check failed:', error);
    return null;
  }
}

/**
 * Download APK to device storage with progress tracking.
 *
 * @param {string} apkUrl - Direct download URL
 * @param {(progress: number) => void} onProgress - Called with 0-100 percentage
 * @returns {Promise<string>} - Local file URI of the downloaded APK
 */
export async function downloadApk(apkUrl, onProgress) {
  // Use XMLHttpRequest for progress tracking (fetch doesn't support it)
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', apkUrl, true);
    xhr.responseType = 'blob';

    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress?.(percent);
      }
    };

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const blob = xhr.response;
          // Convert blob to base64 for Filesystem.writeFile
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Data = reader.result.split(',')[1];

            // Write to app cache
            await Filesystem.writeFile({
              path: APK_FILENAME,
              data: base64Data,
              directory: Directory.Cache,
            });

            // Get the file URI
            const fileInfo = await Filesystem.getUri({
              path: APK_FILENAME,
              directory: Directory.Cache,
            });

            onProgress?.(100);
            resolve(fileInfo.uri);
          };
          reader.onerror = () => reject(new Error('Failed to read downloaded file'));
          reader.readAsDataURL(blob);
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error(`Download failed: HTTP ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during download'));
    xhr.ontimeout = () => reject(new Error('Download timed out'));
    xhr.timeout = 300000; // 5 min timeout

    xhr.send();
  });
}

/**
 * Activate the downloaded APK via custom ApkInstaller plugin.
 *
 * @param {string} fileUri - Local file URI of the APK
 */
export async function installApk(fileUri) {
  try {
    const { registerPlugin } = await import('@capacitor/core');
    const ApkInstaller = registerPlugin('ApkInstaller');
    console.log('[UpdateService] Triggering native installer with URI:', fileUri);
    await ApkInstaller.install({ apkPath: fileUri });
  } catch (error) {
    console.error('[UpdateService] Install failed:', error);
    throw error;
  }
}

/**
 * Legacy: open remote URL in browser (fallback)
 * Note: Local file URI is blocked here to prevent FileUriExposedException.
 */
export async function downloadUpdate(url) {
  if (url.startsWith('file://')) {
    console.error('[UpdateService] Blocked attempt to open local file URI in Browser plugin');
    return;
  }
  try {
    await Browser.open({ url, windowName: '_system' });
  } catch {
    window.open(url, '_system');
  }
}

const SAMSUNG_NOTICE_DISMISSED_KEY = 'samsung_blocker_notice_dismissed';

/**
 * Check if the Samsung Auto Blocker dialog should be shown.
 * Returns true only when: native platform, device is Samsung, and
 * user hasn't dismissed the notice permanently.
 */
export async function shouldShowSamsungDialog() {
  if (!Capacitor.isNativePlatform()) return false;

  try {
    const { isSamsung } = await DeviceUtils.getDeviceInfo();
    if (!isSamsung) return false;

    const { value } = await Preferences.get({ key: SAMSUNG_NOTICE_DISMISSED_KEY });
    return value !== 'true';
  } catch (error) {
    console.warn('[SamsungNotice] Failed to check device info:', error);
    return false;
  }
}

/**
 * Persist the user's choice to not show the Samsung dialog again.
 */
export async function dismissSamsungDialog() {
  try {
    await Preferences.set({
      key: SAMSUNG_NOTICE_DISMISSED_KEY,
      value: 'true',
    });
  } catch (error) {
    console.warn('[SamsungNotice] Failed to persist preference:', error);
  }
}

export default { checkForUpdate, downloadApk, installApk, downloadUpdate, shouldShowSamsungDialog, dismissSamsungDialog };
