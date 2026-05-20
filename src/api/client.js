// src/api/client.js

import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,

  headers: {
    'Content-Type': 'application/json',
  },

  timeout: 15000,
});

// ─────────────────────────────────────
// REQUEST INTERCEPTOR
// Automatically attaches access token
// ─────────────────────────────────────
client.interceptors.request.use(
  (config) => {
    // Prefer Zustand state
    let token = useAuthStore.getState().token;

    // Fallback to localStorage after refresh/reopen
    if (!token) {
      token = localStorage.getItem('token');
    }

    if (token) {
      if (
        config.headers &&
        typeof config.headers.set === 'function'
      ) {
        config.headers.set(
          'Authorization',
          `Bearer ${token}`
        );
      } else {
        config.headers.Authorization =
          `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────
// RESPONSE INTERCEPTOR
// Handles token refresh automatically
// ─────────────────────────────────────
client.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Skip refresh if:
    // - not 401
    // - already retried
    // - auth endpoints themselves failed
    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/signup') ||
      originalRequest?.url?.includes('/auth/refresh');

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
        const authStore = useAuthStore.getState();

        const storedRefreshToken =
          localStorage.getItem('refreshToken');

        if (!storedRefreshToken) {
          throw new Error(
            'No refresh token available'
          );
        }

        // Refresh token request
        const response = await axios.post(
          `${client.defaults.baseURL}/auth/refresh`,
          {
            RefreshToken: storedRefreshToken,
          }
        );

        const responseData =
          response.data?.data || response.data;

        const newAccessToken =
          responseData.token ||
          responseData.accessToken ||
          responseData.jwt;

        const newRefreshToken =
          responseData.refreshToken ||
          storedRefreshToken;

        if (!newAccessToken) {
          throw new Error(
            'No access token returned'
          );
        }

        // Persist tokens
        localStorage.setItem(
          'token',
          newAccessToken
        );

        localStorage.setItem(
          'refreshToken',
          newRefreshToken
        );

        // Update Zustand store
        authStore.setAuth({
          user:
            responseData.user ||
            authStore.user,
          token: newAccessToken,
        });

        // Retry original request
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return client(originalRequest);
      } catch (refreshError) {
        console.error(
          'Token refresh failed:',
          refreshError
        );

        // Clear everything
        localStorage.removeItem('token');
        localStorage.removeItem(
          'refreshToken'
        );

        useAuthStore.getState().logout();

        // Redirect to login
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default client;