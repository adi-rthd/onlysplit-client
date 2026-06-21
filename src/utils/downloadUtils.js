/**
 * Centralized APK download utilities.
 *
 * Replaces all scattered window.open() and target="_blank" patterns
 * with a single set of functions that handle in-app browser limitations.
 */

const LATEST_JSON_URL = 'https://api-split.onlylabs.in/downloads/latest.json';

/** Session cache for APK info */
let cachedApkInfo = null;

/**
 * Fetch the latest APK info from the server.
 * Caches the result for the browser session.
 *
 * @returns {Promise<{apkUrl: string, version: string, versionCode: number, releaseNotes: string[]} | null>}
 */
export async function getApkInfo() {
  if (cachedApkInfo) return cachedApkInfo;

  try {
    const response = await fetch(LATEST_JSON_URL, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data?.apkUrl) {
      cachedApkInfo = data;
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Build an Android intent URL that opens the download link in Chrome.
 * Falls back to Chrome Play Store page if Chrome isn't installed.
 *
 * @param {string} apkUrl - Direct APK download URL
 * @returns {string} - intent:// scheme URL
 */
export function buildChromeIntentUrl(apkUrl) {
  // Parse the APK URL to extract host and path
  let url;
  try {
    url = new URL(apkUrl);
  } catch {
    // If URL parsing fails, fall back to direct URL
    return apkUrl;
  }

  // Intent URL format for opening in Chrome:
  // intent://host/path#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=<fallback>;end
  const hostAndPath = url.host + url.pathname;
  const fallback = encodeURIComponent(apkUrl);

  return `intent://${hostAndPath}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${fallback};end`;
}

/**
 * Trigger a direct APK download using window.location.href assignment.
 * This approach works with the Android system download manager in standard browsers.
 *
 * @param {string} apkUrl - Direct APK download URL
 */
export function triggerDirectDownload(apkUrl) {
  window.location.href = apkUrl;
}

/**
 * Copy the APK download link to clipboard.
 *
 * @param {string} apkUrl - Direct APK download URL
 * @returns {Promise<boolean>} - Whether the copy succeeded
 */
export async function copyDownloadLink(apkUrl) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(apkUrl);
      return true;
    }

    // Fallback for older browsers / insecure contexts
    const textArea = document.createElement('textarea');
    textArea.value = apkUrl;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch {
    return false;
  }
}

export default { getApkInfo, buildChromeIntentUrl, triggerDirectDownload, copyDownloadLink };
