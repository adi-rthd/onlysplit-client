/**
 * In-app browser detection utility.
 *
 * Detects Android in-app browsers (Chrome Custom Tabs / WebViews) used by
 * Telegram, WhatsApp, Facebook, Instagram, and other apps that cannot
 * hand off binary APK downloads to the system download manager.
 */

const IN_APP_PATTERNS = [
  { pattern: /Telegram/i, name: 'Telegram' },
  { pattern: /WhatsApp/i, name: 'WhatsApp' },
  { pattern: /FBAN|FBAV/i, name: 'Facebook' },
  { pattern: /Instagram/i, name: 'Instagram' },
  { pattern: /; wv\)/i, name: 'WebView' },
  { pattern: /\bLine\//i, name: 'LINE' },
  { pattern: /\bSnapchat/i, name: 'Snapchat' },
];

/**
 * Detect if the current browser is an in-app browser / embedded WebView.
 *
 * @param {string} [ua] - Optional user-agent string (defaults to navigator.userAgent)
 * @returns {boolean}
 */
export function isInAppBrowser(ua) {
  const userAgent = ua || (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  if (!userAgent) return false;

  return IN_APP_PATTERNS.some(({ pattern }) => pattern.test(userAgent));
}

/**
 * Get the human-readable name of the detected in-app browser.
 *
 * @param {string} [ua] - Optional user-agent string
 * @returns {string|null} - Browser name or null if not an in-app browser
 */
export function getInAppBrowserName(ua) {
  const userAgent = ua || (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  if (!userAgent) return null;

  const match = IN_APP_PATTERNS.find(({ pattern }) => pattern.test(userAgent));
  return match ? match.name : null;
}

/**
 * Detect if the current platform is Android.
 *
 * @param {string} [ua] - Optional user-agent string
 * @returns {boolean}
 */
export function isAndroid(ua) {
  const userAgent = ua || (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  return /Android/i.test(userAgent);
}

export default { isInAppBrowser, getInAppBrowserName, isAndroid };
