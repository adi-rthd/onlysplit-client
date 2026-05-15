import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const TOKEN_KEY = 'os_auth_token';

/**
 * Auth store — manages user state, access token, and auth lifecycle.
 * Uses Zustand `persist` middleware so the session survives page reloads.
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State ──
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,       // true until hydration finishes
      isAuthenticating: false, // true during login/signup API calls

      // ── Actions ──

      /**
       * Called after a successful login or signup API response.
       */
      setAuth: ({ user, token }) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          isAuthenticating: false,
        });
      },

      /**
       * Update the user profile without touching the token.
       */
      setUser: (user) => set({ user }),

      /**
       * Clear all auth state and redirect to landing page.
       */
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isAuthenticating: false,
        });
        // The ProtectedRoute guard will handle the redirect automatically.
      },

      /**
       * Mark hydration as complete (called by the persist rehydration listener).
       */
      setLoaded: () => set({ isLoading: false }),

      /**
       * Toggle the authenticating spinner.
       */
      setAuthenticating: (v) => set({ isAuthenticating: v }),

      // ── Future: refresh-token rotation ──
      // refreshToken: async () => {
      //   try {
      //     const { data } = await client.post('/auth/refresh');
      //     set({ token: data.token });
      //     return data.token;
      //   } catch {
      //     get().logout();
      //     return null;
      //   }
      // },
    }),
    {
      name: TOKEN_KEY,                   // localStorage key
      partialize: (state) => ({          // only persist these fields
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Once Zustand has pulled from localStorage, stop the global loader.
        state?.setLoaded();
      },
    }
  )
);
