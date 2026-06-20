/**
 * Self-hosted APK update service.
 *
 * Fetches version metadata from the server and compares against the
 * installed app build number to determine if an update is available.
 */
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Browser } from '@capacitor/browser';

const UPDATE_ENDPOINT = 'https://api-split.onlylabs.in/downloads/latest.json';

/**
 * @typedef {Object} UpdateInfo
 * @property {string} version - Semver string (e.g. "1.0.0")
 * @property {number} versionCode - Numeric build code for comparison
 * @property {string} apkUrl - Direct download URL for the APK
 * @property {boolean} mandatory - Whether the update is required
 * @property {string[]} releaseNotes - List of changes in this release
 */

/**
 * Check for available updates.
 * Returns null if no update is needed or if running on web.
 *
 * @returns {Promise<UpdateInfo|null>}
 */
export async function checkForUpdate() {
  // Only check on native Android
  if (!Capacitor.isNativePlatform()) return null;

  try {
    const response = await fetch(UPDATE_ENDPOINT, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      console.warn('[UpdateService] Failed to fetch latest.json:', response.status);
      return null;
    }

    /** @type {UpdateInfo} */
    const latest = await response.json();

    // Get installed build number
    const info = await Device.getInfo();
    // Capacitor returns appBuild as a string
    const installedVersionCode = parseInt(info.appBuild, 10) || 0;

    if (latest.versionCode > installedVersionCode) {
      return latest;
    }

    return null;
  } catch (error) {
    console.warn('[UpdateService] Update check failed:', error);
    return null;
  }
}

/**
 * Opens the APK download URL in the system browser / download manager.
 *
 * @param {string} apkUrl
 */
export async function downloadUpdate(apkUrl) {
  try {
    await Browser.open({ url: apkUrl, windowName: '_system' });
  } catch (error) {
    // Fallback to window.open if Browser plugin fails
    window.open(apkUrl, '_system');
  }
}

export default { checkForUpdate, downloadUpdate };
