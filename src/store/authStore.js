import { create } from 'zustand';

export const useAuthStore = create(
  (set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    isAuthenticating: false,

    setAuth: ({ user, token }) => {
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        isAuthenticating: false,
      });
    },

    setUser: (user) => {
      set({ user });
    },

    setToken: (token) => {
      set({
        token,
        isAuthenticated: !!token,
      });
    },

    logout: () => {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isAuthenticating: false,
      });
    },

    setLoaded: () => {
      set({
        isLoading: false,
      });
    },

    setAuthenticating: (v) => {
      set({
        isAuthenticating: v,
      });
    },
  })
);