import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authStorage } from '../utils/storage';

export const useAuthStore = create(
  persist(
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
    }),
    {
      name: 'onlysplit-auth',
      storage: createJSONStorage(() => authStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        // After hydration, if we have a token, set isAuthenticated optimistically.
        // isLoading stays true — restoreSession() will validate and set it to false.
        if (state?.token) {
          useAuthStore.setState({ isAuthenticated: true });
        }
      },
    }
  )
);
