/**
 * Preservation Property Test — Property 2
 *
 * Verifies that standard browsers are NEVER misidentified as in-app browsers.
 * This ensures standard browser downloads continue to work unchanged.
 *
 * Uses fast-check to generate standard browser user-agent strings.
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { isInAppBrowser, isAndroid } from '../browserDetect';

// Real-world standard browser user-agent strings that MUST NOT trigger in-app detection
const STANDARD_BROWSER_UAS = [
  // Chrome Android
  'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.101 Mobile Safari/537.36',
  // Samsung Internet
  'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36',
  // Firefox Android
  'Mozilla/5.0 (Android 13; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0',
  // Edge Android
  'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36 EdgA/120.0.2210.141',
  // Chrome Desktop (Windows)
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  // Chrome Desktop (macOS)
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  // Firefox Desktop
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  // Safari Desktop
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15',
  // Safari iOS
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
  // Opera Android
  'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36 OPR/80.3.4244.77621',
  // Brave Android
  'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36',
];

// Arbitrary that generates standard Chrome Android user-agent strings
const chromeAndroidUAArb = fc.record({
  androidVersion: fc.integer({ min: 10, max: 15 }),
  device: fc.constantFrom('Pixel 8 Pro', 'SM-S918B', 'SM-A536B', 'Redmi Note 12', 'OnePlus 11'),
  chromeVersion: fc.integer({ min: 100, max: 130 }),
  buildVersion: fc.integer({ min: 5000, max: 7000 }),
}).map(({ androidVersion, device, chromeVersion, buildVersion }) =>
  `Mozilla/5.0 (Linux; Android ${androidVersion}; ${device}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion}.0.${buildVersion}.101 Mobile Safari/537.36`
);

// Arbitrary that generates standard desktop browser UAs
const desktopUAArb = fc.constantFrom(
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
);

// Arbitrary that generates Samsung Internet UAs
const samsungInternetUAArb = fc.record({
  androidVersion: fc.integer({ min: 11, max: 14 }),
  device: fc.constantFrom('SM-S918B', 'SM-G991B', 'SM-A536B', 'SM-F946B'),
  samsungVersion: fc.integer({ min: 18, max: 25 }),
}).map(({ androidVersion, device, samsungVersion }) =>
  `Mozilla/5.0 (Linux; Android ${androidVersion}; ${device}) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/${samsungVersion}.0 Chrome/115.0.0.0 Mobile Safari/537.36`
);

describe('Preservation: Standard Browser Detection Never False-Positive', () => {
  it('should NOT detect any standard browser as in-app', () => {
    for (const ua of STANDARD_BROWSER_UAS) {
      expect(isInAppBrowser(ua)).toBe(false);
    }
  });

  it('[PBT] for all generated Chrome Android UAs, isInAppBrowser returns false', () => {
    fc.assert(
      fc.property(chromeAndroidUAArb, (ua) => {
        return isInAppBrowser(ua) === false;
      }),
      { numRuns: 200 }
    );
  });

  it('[PBT] for all generated desktop browser UAs, isInAppBrowser returns false', () => {
    fc.assert(
      fc.property(desktopUAArb, (ua) => {
        return isInAppBrowser(ua) === false;
      }),
      { numRuns: 100 }
    );
  });

  it('[PBT] for all generated Samsung Internet UAs, isInAppBrowser returns false', () => {
    fc.assert(
      fc.property(samsungInternetUAArb, (ua) => {
        return isInAppBrowser(ua) === false;
      }),
      { numRuns: 100 }
    );
  });

  it('should correctly identify Android platform', () => {
    // Android UAs
    expect(isAndroid('Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36')).toBe(true);
    // Desktop UAs
    expect(isAndroid('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')).toBe(false);
    expect(isAndroid('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15')).toBe(false);
    // iOS UAs
    expect(isAndroid('Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15')).toBe(false);
  });

  it('[PBT] isAndroid returns true only for UAs containing "Android"', () => {
    fc.assert(
      fc.property(chromeAndroidUAArb, (ua) => {
        return isAndroid(ua) === true;
      }),
      { numRuns: 100 }
    );

    fc.assert(
      fc.property(desktopUAArb, (ua) => {
        return isAndroid(ua) === false;
      }),
      { numRuns: 50 }
    );
  });
});
