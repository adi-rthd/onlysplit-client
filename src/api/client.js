import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // baseURL: "https://onlysplit-api.onlylabs.in/api",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

client.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set(
          'Authorization',
          `Bearer ${token}`
        );
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },

  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute = 
      originalRequest?.url?.includes(
        '/auth/login'
      ) ||
      originalRequest?.url?.includes(
        '/auth/signup'
      ) ||
      originalRequest?.url?.includes(
        '/auth/refresh'
      ) ||
      originalRequest?.url?.includes(
        '/auth/logout'
      );

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(
          `${client.defaults.baseURL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

        const responseData =
          response.data?.data ||
          response.data;

        const newAccessToken =
          responseData.token ||
          responseData.accessToken ||
          responseData.jwt;

        if (!newAccessToken) {
          throw new Error(
            'No access token returned'
          );
        }

        // Update Zustand store only
        const authStore = useAuthStore.getState();

        authStore.setToken(
          newAccessToken
        );

        if (responseData.user) {
          authStore.setUser(
            responseData.user
          );
        }

        if (
          originalRequest.headers &&
          typeof originalRequest.headers.set ===
            'function'
        ) {
          originalRequest.headers.set(
            'Authorization',
            `Bearer ${newAccessToken}`
          );
        } else {
          originalRequest.headers.Authorization =
            `Bearer ${newAccessToken}`;
        }

        return client(originalRequest);
      } catch (refreshError) {
        console.error(
          'Token refresh failed:',
          refreshError
        );

        useAuthStore
          .getState()
          .logout();

        // Avoid redirect loops
        if (
          window.location.pathname !==
          '/login'
        ) {
          window.location.href =
            '/login';
        }

        return Promise.reject(
          refreshError
        );
      }
    }

    return Promise.reject(error);
  }
);

export default client;
