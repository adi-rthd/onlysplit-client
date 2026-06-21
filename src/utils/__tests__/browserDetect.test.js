/**
 * Bug Condition Exploration Test — Property 1
 *
 * Confirms that in-app browser user agents are correctly detected.
 * Uses fast-check to generate UA strings containing known in-app browser tokens.
 *
 * EXPECTED: This test FAILS on unfixed code (no isInAppBrowser function exists),
 * and PASSES after browserDetect.js is implemented.
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { isInAppBrowser, getInAppBrowserName, isAndroid } from '../browserDetect';

// Real-world in-app browser user-agent strings
const REAL_INAPP_UAS = [
  // Telegram Android
  'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36 Telegram/10.5.0',
  // WhatsApp Android
  'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.193 Mobile Safari/537.36 WhatsApp/2.24.1.6',
  // Facebook Android (FBAN)
  'Mozilla/5.0 (Linux; Android 14; SM-S918B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.6099.230 Mobile Safari/537.36 [FBAN/FB4A;FBAV/447.0.0.34.118;]',
  // Instagram Android
  'Mozilla/5.0 (Linux; Android 13; SM-G991B Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.6099.230 Mobile Safari/537.36 Instagram 312.0.0.34.111',
  // Generic WebView (wv)
  'Mozilla/5.0 (Linux; Android 12; Redmi Note 11 Build/SKQ1.211006.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/119.0.6045.66 Mobile Safari/537.36',
  // LINE
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36 Line/13.21.1',
  // Snapchat
  'Mozilla/5.0 (Linux; Android 14; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36 Snapchat/12.74.0.39',
];

// In-app browser token generators for property-based testing
const inAppTokens = ['Telegram', 'WhatsApp', 'FBAN', 'FBAV', 'Instagram', 'Line/', 'Snapchat'];
const webViewSuffix = '; wv)';

// Arbitrary that generates user-agent strings containing an in-app browser token
const inAppBrowserUAArb = fc.oneof(
  // Token-based UAs
  fc.record({
    prefix: fc.constantFrom(
      'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.101 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 12; Redmi Note 11) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.66 Mobile Safari/537.36',
    ),
    token: fc.constantFrom(...inAppTokens),
    suffix: fc.constantFrom('/10.5.0', '/2.24.1', ' 312.0.0', '/447.0.0', '/13.21.1', '/12.74.0'),
  }).map(({ prefix, token, suffix }) => `${prefix} ${token}${suffix}`),
  // WebView-based UAs (contains "; wv)")
  fc.constantFrom(
    'Mozilla/5.0 (Linux; Android 12; Redmi Note 11 Build/SKQ1.211006.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/119.0.6045.66 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 14; SM-S918B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.6099.230 Mobile Safari/537.36',
  ),
);

describe('Bug Condition: In-App Browser Detection', () => {
  it('should detect all real-world in-app browser user agents', () => {
    for (const ua of REAL_INAPP_UAS) {
      expect(isInAppBrowser(ua)).toBe(true);
    }
  });

  it('should return a non-null browser name for all real in-app UAs', () => {
    for (const ua of REAL_INAPP_UAS) {
      const name = getInAppBrowserName(ua);
      expect(name).not.toBeNull();
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    }
  });

  it('[PBT] for all generated in-app browser UAs, isInAppBrowser returns true', () => {
    fc.assert(
      fc.property(inAppBrowserUAArb, (ua) => {
        return isInAppBrowser(ua) === true;
      }),
      { numRuns: 200 }
    );
  });

  it('should detect Android platform from in-app browser UAs', () => {
    for (const ua of REAL_INAPP_UAS) {
      expect(isAndroid(ua)).toBe(true);
    }
  });

  it('should return false for empty/undefined user agents', () => {
    expect(isInAppBrowser('')).toBe(false);
    expect(isInAppBrowser(undefined)).toBe(false);
  });
});
