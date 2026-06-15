// src/services/authService.js

import axios from 'axios';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';
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
   * Logout user
   */
  logout: async () => {
    try {
      await client.post('/auth/logout');
    } catch (error) {
      console.error(error);
    } finally {
      useAuthStore.getState().logout();

      toast.success(
        'Logged out successfully.'
      );
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
   * 1. Try refresh endpoint
   * 2. Backend validates cookie session
   * 3. Receive fresh access token
   * 4. Load current user
   */
  restoreSession: async () => {
    try {
      const token = await authService.refreshToken();
      if (!token) {
        useAuthStore.getState().setLoaded();

        return false;
      }

      const user =
        await authService.getCurrentUser();

      if (!user) {
        useAuthStore.getState().logout();

        return false;
      }

      useAuthStore.getState().setAuth({
        user,
        token,
      });

      return true;
    } catch (error) {
      console.error(error);

      useAuthStore.getState().logout();

      return false;
    } finally {
      useAuthStore.getState().setLoaded();
    }
  },

  /**
   * Silent refresh
   *
   * Refresh token automatically sent via httpOnly cookie
   */
  refreshToken: async () => {
    try {
      // Use raw axios (not intercepted client) to avoid interceptor loops
      const { data } = await axios.post(
        `${client.defaults.baseURL}/auth/refresh`,
        {},
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

      return token;
    } catch (error) {
      console.error(error);

      useAuthStore.getState().logout();

      return null;
    }
  },

};

export default authService;