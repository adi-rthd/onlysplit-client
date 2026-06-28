import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock @capacitor/core
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => false),
  },
}));

// Mock @capacitor/preferences
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('authStorage - Web platform', () => {
  let authStorage;

  beforeEach(async () => {
    vi.resetModules();
    const { Capacitor } = await import('@capacitor/core');
    Capacitor.isNativePlatform.mockReturnValue(false);

    const storageModule = await import('../storage.js');
    authStorage = storageModule.authStorage;

    // Mock localStorage
    const store = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => store[key] ?? null),
      setItem: vi.fn((key, value) => { store[key] = value; }),
      removeItem: vi.fn((key) => { delete store[key]; }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getItem returns value from localStorage', async () => {
    localStorage.getItem.mockReturnValue('{"token":"abc"}');
    const result = await authStorage.getItem('auth-store');
    expect(result).toBe('{"token":"abc"}');
    expect(localStorage.getItem).toHaveBeenCalledWith('auth-store');
  });

  it('getItem returns null when key does not exist', async () => {
    localStorage.getItem.mockReturnValue(null);
    const result = await authStorage.getItem('nonexistent');
    expect(result).toBeNull();
  });

  it('setItem stores value in localStorage', async () => {
    await authStorage.setItem('auth-store', '{"token":"xyz"}');
    expect(localStorage.setItem).toHaveBeenCalledWith('auth-store', '{"token":"xyz"}');
  });

  it('removeItem removes key from localStorage', async () => {
    await authStorage.removeItem('auth-store');
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth-store');
  });
});

describe('authStorage - Native platform', () => {
  let authStorage;
  let Preferences;

  beforeEach(async () => {
    vi.resetModules();
    const { Capacitor } = await import('@capacitor/core');
    Capacitor.isNativePlatform.mockReturnValue(true);

    const prefsModule = await import('@capacitor/preferences');
    Preferences = prefsModule.Preferences;

    const storageModule = await import('../storage.js');
    authStorage = storageModule.authStorage;
  });

  it('getItem returns value from Capacitor Preferences', async () => {
    Preferences.get.mockResolvedValue({ value: '{"token":"native-token"}' });
    const result = await authStorage.getItem('auth-store');
    expect(result).toBe('{"token":"native-token"}');
    expect(Preferences.get).toHaveBeenCalledWith({ key: 'auth-store' });
  });

  it('getItem returns null when Preferences has no value', async () => {
    Preferences.get.mockResolvedValue({ value: null });
    const result = await authStorage.getItem('auth-store');
    expect(result).toBeNull();
  });

  it('setItem stores value in Capacitor Preferences', async () => {
    Preferences.set.mockResolvedValue(undefined);
    await authStorage.setItem('auth-store', '{"token":"new"}');
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'auth-store', value: '{"token":"new"}' });
  });

  it('removeItem removes key from Capacitor Preferences', async () => {
    Preferences.remove.mockResolvedValue(undefined);
    await authStorage.removeItem('auth-store');
    expect(Preferences.remove).toHaveBeenCalledWith({ key: 'auth-store' });
  });
});

describe('refreshTokenStorage - Web platform', () => {
  let refreshTokenStorage;

  beforeEach(async () => {
    vi.resetModules();
    const { Capacitor } = await import('@capacitor/core');
    Capacitor.isNativePlatform.mockReturnValue(false);

    const storageModule = await import('../storage.js');
    refreshTokenStorage = storageModule.refreshTokenStorage;

    // Mock localStorage
    const store = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => store[key] ?? null),
      setItem: vi.fn((key, value) => { store[key] = value; }),
      removeItem: vi.fn((key) => { delete store[key]; }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('get retrieves token from localStorage', async () => {
    localStorage.getItem.mockReturnValue('rt-abc123');
    const result = await refreshTokenStorage.get();
    expect(result).toBe('rt-abc123');
    expect(localStorage.getItem).toHaveBeenCalledWith('onlysplit_refresh_token');
  });

  it('set stores token in localStorage', async () => {
    await refreshTokenStorage.set('rt-xyz');
    expect(localStorage.setItem).toHaveBeenCalledWith('onlysplit_refresh_token', 'rt-xyz');
  });

  it('remove deletes token from localStorage', async () => {
    await refreshTokenStorage.remove();
    expect(localStorage.removeItem).toHaveBeenCalledWith('onlysplit_refresh_token');
  });
});

describe('refreshTokenStorage - Native platform', () => {
  let refreshTokenStorage;
  let Preferences;

  beforeEach(async () => {
    vi.resetModules();
    const { Capacitor } = await import('@capacitor/core');
    Capacitor.isNativePlatform.mockReturnValue(true);

    const prefsModule = await import('@capacitor/preferences');
    Preferences = prefsModule.Preferences;

    const storageModule = await import('../storage.js');
    refreshTokenStorage = storageModule.refreshTokenStorage;
  });

  it('get retrieves refresh token from Preferences', async () => {
    Preferences.get.mockResolvedValue({ value: 'rt-abc123' });
    const result = await refreshTokenStorage.get();
    expect(result).toBe('rt-abc123');
    expect(Preferences.get).toHaveBeenCalledWith({ key: 'onlysplit_refresh_token' });
  });

  it('get returns null when no refresh token stored', async () => {
    Preferences.get.mockResolvedValue({ value: null });
    const result = await refreshTokenStorage.get();
    expect(result).toBeNull();
  });

  it('set stores refresh token in Preferences', async () => {
    Preferences.set.mockResolvedValue(undefined);
    await refreshTokenStorage.set('rt-xyz789');
    expect(Preferences.set).toHaveBeenCalledWith({
      key: 'onlysplit_refresh_token',
      value: 'rt-xyz789',
    });
  });

  it('remove deletes refresh token from Preferences', async () => {
    Preferences.remove.mockResolvedValue(undefined);
    await refreshTokenStorage.remove();
    expect(Preferences.remove).toHaveBeenCalledWith({ key: 'onlysplit_refresh_token' });
  });
});
