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
      let { data } = await client.post('/auth/login', credentials);
      
      data = data?.data || data;
      const token = data.token || data.accessToken || data.jwt || (typeof data === 'string' ? data : null);
      const user = data.user || { email: credentials.email, ...data };
      
      if (!token) {
        throw new Error('No token received from backend');
      }

      useAuthStore.getState().setAuth({ user, token });
      toast.success(`Welcome back, ${user?.firstName || 'there'}!`);
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

      const token = data.token || data.accessToken || data.jwt || null;
      const user = data.user || { ...userData };

      if (token) {
        useAuthStore.getState().setAuth({ user, token });
      } else {
        // Some APIs require login after signup
        toast.success('Account created! Please log in.');
        return data;
      }

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
