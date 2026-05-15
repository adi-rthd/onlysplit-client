import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ── Request Interceptor ──
// Attaches the access token to every outgoing request automatically.
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

// ── Response Interceptor ──
// Handles 401 (unauthorized) globally — clears auth and redirects.
// Provides a hook point for future refresh-token rotation.
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If a 401 comes back and this was NOT already a retry, attempt refresh.
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Future: implement refresh-token rotation here.
      // const newToken = await useAuthStore.getState().refreshToken();
      // if (newToken) {
      //   originalRequest.headers.Authorization = `Bearer ${newToken}`;
      //   return client(originalRequest);
      // }

      // For now, force logout on any 401.
      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  }
);

export default client;
