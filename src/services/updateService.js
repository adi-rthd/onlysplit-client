/**
 * Self-hosted APK update service — in-app download + install.
 *
 * Flow:
 *   1. Check latest.json for new version
 *   2. Download APK to device storage with progress callback
 *   3. Trigger Android package installer from the downloaded file
 *
 * User never leaves the app during download.
 */
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Browser } from '@capacitor/browser';

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

    // Get installed app version
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

            // Write to external cache (accessible by installer)
            await Filesystem.writeFile({
              path: APK_FILENAME,
              data: base64Data,
              directory: Directory.External,
            });

            // Get the file URI
            const fileInfo = await Filesystem.getUri({
              path: APK_FILENAME,
              directory: Directory.External,
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
 * Open the downloaded APK with the Android package installer.
 *
 * @param {string} fileUri - content:// or file:// URI of the APK
 */
export async function installApk(fileUri) {
  try {
    // Use intent launcher to open the APK with the system installer
    const { IntentLauncher } = await import('@capgo/capacitor-intent-launcher');

    await IntentLauncher.launch({
      action: 'android.intent.action.VIEW',
      url: fileUri,
      type: 'application/vnd.android.package-archive',
      flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
    });
  } catch (error) {
    console.error('[UpdateService] Install intent failed:', error);
    // Fallback: open in browser
    try {
      await Browser.open({ url: fileUri, windowName: '_system' });
    } catch {
      window.open(fileUri, '_system');
    }
  }
}

/**
 * Legacy: open APK URL in browser (fallback)
 */
export async function downloadUpdate(apkUrl) {
  try {
    await Browser.open({ url: apkUrl, windowName: '_system' });
  } catch {
    window.open(apkUrl, '_system');
  }
}

export default { checkForUpdate, downloadApk, installApk, downloadUpdate };
