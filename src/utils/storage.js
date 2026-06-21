import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

/**
 * Platform-aware storage adapter for Zustand persist middleware.
 * - Web: sessionStorage (synchronous, clears on tab close)
 * - Capacitor native: @capacitor/preferences (async, persists across app kills)
 */
export const authStorage = {
  getItem: async (name) => {
    if (isNative) {
      const { Preferences } = await import('@capacitor/preferences');
      const { value } = await Preferences.get({ key: name });
      return value;
    }
    return sessionStorage.getItem(name);
  },
  setItem: async (name, value) => {
    if (isNative) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key: name, value });
      return;
    }
    sessionStorage.setItem(name, value);
  },
  removeItem: async (name) => {
    if (isNative) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.remove({ key: name });
      return;
    }
    sessionStorage.removeItem(name);
  },
};

/**
 * Refresh token storage (Capacitor native only).
 * Used as fallback when HttpOnly cookies are unavailable in WebView.
 */
export const refreshTokenStorage = {
  get: async () => {
    if (!isNative) return null;
    const { Preferences } = await import('@capacitor/preferences');
    const { value } = await Preferences.get({ key: 'onlysplit_refresh_token' });
    return value;
  },
  set: async (token) => {
    if (!isNative) return;
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.set({ key: 'onlysplit_refresh_token', value: token });
  },
  remove: async () => {
    if (!isNative) return;
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.remove({ key: 'onlysplit_refresh_token' });
  },
};
