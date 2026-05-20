// src/services/authService.js

import client from '../api/client';
import { useAuthStore } from '../store/authStore';
import { handleApiError } from '../utils/apiErrorHandler';
import toast from 'react-hot-toast';

/**
 * Auth service — all authentication-related API calls.
 * Handles:
 * - login/signup/logout
 * - token persistence
 * - silent refresh
 * - current user fetching
 */
const authService = {
  /**
   * Login user
   * @param {{ email: string, password: string }} credentials
   */
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

      const refreshToken =
        data.refreshToken || null;

      const user =
        data.user || {
          email: credentials.email,
          ...data,
        };

      if (!token) {
        throw new Error('No token received from backend');
      }

      // Persist tokens
      localStorage.setItem('token', token);

      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Update store
      useAuthStore.getState().setAuth({
        user,
        token,
      });

      toast.success(
        `Welcome back, ${user?.firstName || 'there'}!`
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
   * @param {{
   * firstName: string,
   * lastName: string,
   * email: string,
   * password: string
   * }} userData
   */
  signup: async (userData) => {
    try {
      useAuthStore.getState().setAuthenticating(true);

      let { data } = await client.post(
        '/auth/signup',
        userData
      );

      data = data?.data || data;

      const token =
        data.token ||
        data.accessToken ||
        data.jwt ||
        null;

      const refreshToken =
        data.refreshToken || null;

      const user =
        data.user || {
          ...userData,
        };

      // Some APIs require login after signup
      if (!token) {
        toast.success(
          'Account created! Please log in.'
        );

        return data;
      }

      // Persist tokens
      localStorage.setItem('token', token);

      if (refreshToken) {
        localStorage.setItem(
          'refreshToken',
          refreshToken
        );
      }

      // Update store
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
   * Logout user
   */
  logout: () => {
    // Clear persisted auth
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');

    // Clear store
    useAuthStore.getState().logout();

    toast.success('Logged out successfully.');
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
      handleApiError(
        error,
        'Failed to load profile.'
      );

      return null;
    }
  },

  /**
   * Restore session from localStorage
   */
  restoreSession: async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        return false;
      }

      // Fetch latest user data
      const user = await authService.getCurrentUser();

      if (!user) {
        return false;
      }

      useAuthStore.getState().setAuth({
        user,
        token,
      });

      return true;
    } catch {
      return false;
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async () => {
    try {
      const refreshToken =
        localStorage.getItem('refreshToken');

      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      let { data } = await client.post(
        '/auth/refresh',
        {
          refreshToken,
        }
      );

      data = data?.data || data;

      const token =
        data.token ||
        data.accessToken ||
        data.jwt;

      const newRefreshToken =
        data.refreshToken || refreshToken;

      const user =
        data.user || null;

      if (!token) {
        throw new Error(
          'No access token returned'
        );
      }

      // Persist new tokens
      localStorage.setItem('token', token);
      localStorage.setItem(
        'refreshToken',
        newRefreshToken
      );

      // Update auth store
      useAuthStore.getState().setAuth({
        user,
        token,
      });

      return token;
    } catch (error) {
      console.error('Refresh token failed:', error);

      authService.logout();

      return null;
    }
  },
};

export default authService;