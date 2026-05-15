import client from '../api/client';
import { useAuthStore } from '../store/authStore';
import { handleApiError } from '../utils/apiErrorHandler';
import toast from 'react-hot-toast';

/**
 * Auth service — all authentication-related API calls.
 * Each method handles its own error display via the centralized error handler.
 */
const authService = {
  /**
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ user: object, token: string } | null>}
   */
  login: async (credentials) => {
    try {
      useAuthStore.getState().setAuthenticating(true);
      const { data } = await client.post('/auth/login', credentials);
      useAuthStore.getState().setAuth({ user: data.user, token: data.token });
      toast.success(`Welcome back, ${data.user?.firstName || 'there'}!`);
      return data;
    } catch (error) {
      handleApiError(error, 'Login failed. Please check your credentials.');
      return null;
    } finally {
      useAuthStore.getState().setAuthenticating(false);
    }
  },

  /**
   * @param {{ firstName: string, lastName: string, email: string, password: string }} userData
   */
  signup: async (userData) => {
    try {
      useAuthStore.getState().setAuthenticating(true);
      const { data } = await client.post('/auth/signup', userData);
      useAuthStore.getState().setAuth({ user: data.user, token: data.token });
      toast.success('Account created! Welcome to OnlySplit.');
      return data;
    } catch (error) {
      handleApiError(error, 'Signup failed. Please try again.');
      return null;
    } finally {
      useAuthStore.getState().setAuthenticating(false);
    }
  },

  logout: () => {
    useAuthStore.getState().logout();
    toast.success('Logged out successfully.');
  },

  /**
   * Fetch the currently authenticated user profile from the backend.
   */
  getCurrentUser: async () => {
    try {
      const { data } = await client.get('/auth/me');
      useAuthStore.getState().setUser(data);
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to load profile.');
      return null;
    }
  },

  /**
   * Future: rotate access token using a refresh token stored in an httpOnly cookie.
   */
  refreshToken: async () => {
    try {
      const { data } = await client.post('/auth/refresh');
      useAuthStore.getState().setAuth({ user: data.user, token: data.token });
      return data.token;
    } catch {
      useAuthStore.getState().logout();
      return null;
    }
  },
};

export default authService;
