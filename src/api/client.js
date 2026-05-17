import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
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
      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
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

      try {
        const authStore = useAuthStore.getState();
        const { data } = await axios.post(`${client.defaults.baseURL}/auth/refresh`, {}, {
          withCredentials: true // Assuming refresh token is in a cookie
        });
        
        if (data && data.token) {
          authStore.setAuth({ user: data.user || authStore.user, token: data.token });
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return client(originalRequest);
        }
      } catch (refreshError) {
        // Force logout on refresh failure
        useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  }
);

export default client;
