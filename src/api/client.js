import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// API base URL resolution order:
//   1. VITE_API_BASE_URL (set per-environment via .env / .env.production)
//   2. Fallback to the production API so existing web behaviour is preserved
//      even if no env var is provided.
const API_BASE_URL = 'https://api-split.onlylabs.in/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// --- Request interceptor: attach access token ---
client.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response interceptor: handle 401 with queued refresh ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

client.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Don't intercept auth routes
    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/signup') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/logout');

    if (error.response?.status !== 401 || originalRequest._retry || isAuthRoute) {
      // Structure the error so mutation hooks receive a consistent { status, message, data } object
      if (error.response) {
        const structured = {
          status: error.response.status,
          message: error.response.data?.message || error.response.data?.error || error.message,
          data: error.response.data,
        };
        return Promise.reject(structured);
      }
      // Network error — no response received
      return Promise.reject({ status: 0, message: 'Network unavailable' });
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return client(originalRequest);
      }).catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Use raw axios (not intercepted client) to avoid loops
      const response = await axios.post(
        `${client.defaults.baseURL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const responseData = response.data?.data || response.data;

      const newAccessToken =
        responseData.token ||
        responseData.accessToken ||
        responseData.jwt;

      if (!newAccessToken) {
        throw new Error('No access token returned from refresh');
      }

      // Update store
      const authStore = useAuthStore.getState();
      authStore.setToken(newAccessToken);

      if (responseData.user) {
        authStore.setUser(responseData.user);
      }

      // Process queued requests with new token
      processQueue(null, newAccessToken);

      // Retry original request
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return client(originalRequest);

    } catch (refreshError) {
      // Refresh failed — reject all queued requests
      processQueue(refreshError, null);

      useAuthStore.getState().logout();

      // Redirect to login (use hash router format)
      if (!window.location.hash?.includes('/login')) {
        window.location.hash = '#/login';
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default client;
