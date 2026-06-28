import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

/**
 * Platform-aware storage adapter for Zustand persist middleware.
 * - Web: localStorage (synchronous, persists across restarts, ideal for PWAs)
 * - Capacitor native: @capacitor/preferences (async, persists across app kills)
 */
export const authStorage = {
  getItem: async (name) => {
    if (isNative) {
      const { Preferences } = await import('@capacitor/preferences');
      const { value } = await Preferences.get({ key: name });
      return value;
    }
    return localStorage.getItem(name);
  },
  setItem: async (name, value) => {
    if (isNative) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key: name, value });
      return;
    }
    localStorage.setItem(name, value);
  },
  removeItem: async (name) => {
    if (isNative) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.remove({ key: name });
      return;
    }
    localStorage.removeItem(name);
  },
};

/**
 * Refresh token storage.
 * - Web: localStorage (for session persistence in mobile PWA)
 * - Capacitor native: @capacitor/preferences
 */
export const refreshTokenStorage = {
  get: async () => {
    if (isNative) {
      const { Preferences } = await import('@capacitor/preferences');
      const { value } = await Preferences.get({ key: 'onlysplit_refresh_token' });
      return value;
    }
    return localStorage.getItem('onlysplit_refresh_token');
  },
  set: async (token) => {
    if (isNative) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key: 'onlysplit_refresh_token', value: token });
      return;
    }
    localStorage.setItem('onlysplit_refresh_token', token);
  },
  remove: async () => {
    if (isNative) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.remove({ key: 'onlysplit_refresh_token' });
      return;
    }
    localStorage.removeItem('onlysplit_refresh_token');
  },
};
