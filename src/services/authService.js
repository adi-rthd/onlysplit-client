// src/services/authService.js

import axios from 'axios';
import { Capacitor } from '@capacitor/core';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';
import { refreshTokenStorage } from '../utils/storage';
import { handleApiError } from '../utils/apiErrorHandler';
import toast from 'react-hot-toast';


const authService = {
  login: async (credentials) => {
    try {
      useAuthStore.getState().setAuthenticating(true);

      let { data } = await client.post('/auth/login', credentials);

      data = data?.data || data;

      const token =
        data.token ||
        data.accessToken ||
        data.jwt ||
        null;

      const user =
        data.user || {
          email: credentials.email,
          ...data,
        };

      if (!token) {
        throw new Error(
          'No access token received from backend'
        );
      }

      useAuthStore.getState().setAuth({
        user,
        token,
      });

      // On native, store refresh token for Capacitor WebView fallback
      if (Capacitor.isNativePlatform() && data.refreshToken) {
        await refreshTokenStorage.set(data.refreshToken);
      }

      toast.success(
        `Welcome back, ${user?.firstName || 'there'
        }!`
      );

      return data;
    } catch (error) {
      handleApiError(
        error,
        'Login failed. Please check your credentials.'
      );

      return null;
    } finally {
      useAuthStore.getState().setAuthenticating(false);
    }
  },

  /**
   * Signup user
   */
  signup: async (userData) => {
    try {
      useAuthStore.getState().setAuthenticating(true);

      let { data } = await client.post('/auth/signup', userData);

      data = data?.data || data;

      const token =
        data.token ||
        data.accessToken ||
        data.jwt ||
        null;

      const user =
        data.user || {
          ...userData,
        };

      // Some APIs require login after signup
      if (!token) {
        toast.success('Account created! Please log in.');

        return data;
      }

      useAuthStore.getState().setAuth({
        user,
        token,
      });

      toast.success(
        'Account created! Welcome to OnlySplit.'
      );

      return data;
    } catch (error) {
      handleApiError(
        error,
        'Signup failed. Please try again.'
      );

      return null;
    } finally {
      useAuthStore.getState().setAuthenticating(false);
    }
  },

  /**
   * Request password reset email
   */
  forgotPassword: async (email) => {
    try {
      await client.post('/auth/forgot-password', { email });
      return true;
    } catch (error) {
      // Always return true — don't reveal whether email exists
      return true;
    }
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token, newPassword) => {
    try {
      await client.post('/auth/reset-password', { token, newPassword });
      toast.success('Password reset successfully.');
      return { success: true };
    } catch (error) {
      const message =
        error?.message || error?.data?.message || 'Reset failed. The link may have expired.';
      toast.error(message);
      return { success: false, message };
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await client.post('/auth/logout');
    } catch (error) {
      console.error(error);
    } finally {
      // Clear native refresh token storage
      if (Capacitor.isNativePlatform()) {
        await refreshTokenStorage.remove();
      }
      useAuthStore.getState().logout();
      toast.success('Logged out successfully.');
    }
  },

  /**
   * Fetch currently authenticated user
   */
  getCurrentUser: async () => {
    try {
      const { data } = await client.get('/auth/me');

      const user = data?.data || data;

      useAuthStore.getState().setUser(user);

      return user;
    } catch (error) {
      console.error(error);

      return null;
    }
  },

  /**
   * Restore session on app startup
   *
   * Flow:
   * 1. Check if persisted token exists from Zustand hydration
   * 2. If token exists, attempt /auth/me to validate
   * 3. If validation fails, attempt refresh (cookie on web, body on native)
   * 4. Only set isLoading: false after all validation completes
   */
  restoreSession: async () => {
    try {
      // Step 1: Check if persisted token exists from Zustand hydration
      const persistedToken = useAuthStore.getState().token;

      if (persistedToken) {
        // Step 2: Validate persisted token by calling /auth/me
        try {
          const user = await authService.getCurrentUser();
          if (user) {
            // Token is still valid — session restored
            useAuthStore.getState().setAuth({ user, token: persistedToken });
            return true;
          }
        } catch (error) {
          // Token invalid (401) — will try refresh below
          // Any other error means we can't validate — try refresh
        }
      }

      // Step 3: Attempt refresh (cookie on web, body on native)
      const token = await authService.refreshToken();
      if (!token) {
        useAuthStore.getState().setLoaded();
        return false;
      }

      // Step 4: Load current user with new token
      const user = await authService.getCurrentUser();
      if (!user) {
        useAuthStore.getState().logout();
        return false;
      }

      useAuthStore.getState().setAuth({ user, token });
      return true;
    } catch (error) {
      console.error('restoreSession error:', error);
      useAuthStore.getState().logout();
      return false;
    } finally {
      useAuthStore.getState().setLoaded();
    }
  },

  /**
   * Silent refresh — platform-aware
   *
   * Web: refresh token sent via httpOnly cookie (withCredentials)
   * Native: refresh token retrieved from Capacitor Preferences and sent in body
   */
  refreshToken: async () => {
    try {
      const isNative = Capacitor.isNativePlatform();

      let requestBody = {};

      // On native, include refresh token in body (cookie fallback)
      if (isNative) {
        const storedRefreshToken = await refreshTokenStorage.get();
        if (storedRefreshToken) {
          requestBody = { refreshToken: storedRefreshToken };
        }
      }

      // Use raw axios (not intercepted client) to avoid interceptor loops
      const { data } = await axios.post(
        `${client.defaults.baseURL}/auth/refresh`,
        requestBody,
        { withCredentials: true }
      );

      const response = data?.data || data;

      const token =
        response.token ||
        response.accessToken ||
        response.jwt;

      if (!token) {
        throw new Error('No token returned');
      }

      useAuthStore.getState().setToken(token);

      if (response.user) {
        useAuthStore.getState().setUser(response.user);
      }

      // On native, persist the new refresh token if returned
      if (isNative && response.refreshToken) {
        await refreshTokenStorage.set(response.refreshToken);
      }

      return token;
    } catch (error) {
      console.error('refreshToken error:', error);
      // Don't call logout here — let the caller decide
      return null;
    }
  },

};

export default authService;
