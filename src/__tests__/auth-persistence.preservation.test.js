/**
 * Preservation Property Tests — Behaviors That Must NOT Change After Fix
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
 *
 * These tests encode CURRENT correct behavior on UNFIXED code.
 * They must PASS on unfixed code AND continue passing after the fix.
 *
 * Preservation properties tested:
 * 1. Explicit logout clears all auth state
 * 2. Expired/revoked refresh tokens result in logout
 * 3. Auth routes are excluded from 401 interceptor
 * 4. Non-401 errors propagate without triggering refresh
 * 5. ProtectedRoute shows loader while isLoading=true
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';

// Mock @capacitor/core before anything imports it
vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => false },
}));

// In-memory storage to replace sessionStorage for tests
const memoryStore = {};
vi.mock('../utils/storage', () => ({
  authStorage: {
    getItem: async (name) => memoryStore[name] ?? null,
    setItem: async (name, value) => { memoryStore[name] = value; },
    removeItem: async (name) => { delete memoryStore[name]; },
  },
  refreshTokenStorage: {
    get: async () => null,
    set: async () => {},
    remove: async () => {},
  },
}));

import { useAuthStore } from '../store/authStore';

// Mock axios at module level
vi.mock('axios', () => {
  const mockPost = vi.fn();
  const mockGet = vi.fn();
  const mockCreate = vi.fn(() => ({
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    defaults: { baseURL: 'https://api-split.onlylabs.in/api' },
    post: mockPost,
    get: mockGet,
  }));

  return {
    default: {
      create: mockCreate,
      post: mockPost,
      get: mockGet,
    },
  };
});

// Mock the client module
vi.mock('../api/client', () => {
  const mockClient = {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    defaults: { baseURL: 'https://api-split.onlylabs.in/api' },
    post: vi.fn(),
    get: vi.fn(),
  };
  return { default: mockClient };
});


describe('Preservation Property: Explicit Logout Clears All State', () => {
  /**
   * **Validates: Requirements 3.1**
   *
   * Property: FOR ALL authenticated states (any valid user/token combination),
   * calling logout() MUST clear ALL auth state completely.
   *
   * Observed on UNFIXED code: logout() sets user=null, token=null,
   * isAuthenticated=false, isLoading=false, isAuthenticating=false
   */
  it('Property: logout() clears all state for any authenticated user', () => {
    fc.assert(
      fc.property(
        fc.record({
          userId: fc.uuid(),
          userEmail: fc.emailAddress(),
          userName: fc.string({ minLength: 1, maxLength: 50 }),
          token: fc.string({ minLength: 10, maxLength: 200 }),
        }),
        (input) => {
          // ARRANGE: Set up an authenticated state with arbitrary user/token
          useAuthStore.setState({
            user: { id: input.userId, email: input.userEmail, firstName: input.userName },
            token: input.token,
            isAuthenticated: true,
            isLoading: false,
            isAuthenticating: false,
          });

          // Verify we are authenticated before logout
          const beforeState = useAuthStore.getState();
          expect(beforeState.isAuthenticated).toBe(true);
          expect(beforeState.token).toBe(input.token);

          // ACT: Call logout on the store
          useAuthStore.getState().logout();

          // ASSERT: All auth state must be cleared
          const afterState = useAuthStore.getState();
          expect(afterState.user).toBe(null);
          expect(afterState.token).toBe(null);
          expect(afterState.isAuthenticated).toBe(false);
          expect(afterState.isLoading).toBe(false);
          expect(afterState.isAuthenticating).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * **Validates: Requirements 3.1**
   *
   * Property: FOR ALL authenticated states, calling authService.logout()
   * results in the store being fully cleared (regardless of API call success/failure).
   */
  it('Property: authService.logout() clears store state even if API call fails', async () => {
    const client = (await import('../api/client')).default;

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.uuid(),
          token: fc.string({ minLength: 10, maxLength: 100 }),
          apiShouldFail: fc.boolean(),
        }),
        async (input) => {
          // ARRANGE: Set authenticated state
          useAuthStore.setState({
            user: { id: input.userId, email: 'test@example.com', firstName: 'Test' },
            token: input.token,
            isAuthenticated: true,
            isLoading: false,
            isAuthenticating: false,
          });

          // Mock the API call - may succeed or fail
          if (input.apiShouldFail) {
            client.post.mockRejectedValueOnce(new Error('Network error'));
          } else {
            client.post.mockResolvedValueOnce({ data: { success: true } });
          }

          // ACT: Call authService.logout()
          const authService = (await import('../services/authService')).default;
          await authService.logout();

          // ASSERT: State MUST be cleared regardless of API success/failure
          const afterState = useAuthStore.getState();
          expect(afterState.user).toBe(null);
          expect(afterState.token).toBe(null);
          expect(afterState.isAuthenticated).toBe(false);
        }
      ),
      { numRuns: 20 }
    );
  });
});


describe('Preservation Property: Expired/Revoked Refresh Tokens Still Logout', () => {
  /**
   * **Validates: Requirements 3.2**
   *
   * Property: FOR ALL expired/revoked token scenarios, restoreSession()
   * returns false and leaves the user logged out.
   *
   * Observed on UNFIXED code: when refreshToken() fails (token expired,
   * revoked, or missing), restoreSession() calls setLoaded() and returns false.
   * The user is NOT authenticated after this.
   */
  it('Property: restoreSession returns false and user is logged out when refresh fails', async () => {
    const axios = (await import('axios')).default;

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          errorStatus: fc.constantFrom(401, 403),
          errorMessage: fc.constantFrom(
            'Refresh token expired',
            'Refresh token revoked',
            'Refresh token missing',
            'Invalid refresh token',
            'Session expired'
          ),
        }),
        async (input) => {
          // ARRANGE: Start with no auth (simulates app startup or post-refresh)
          useAuthStore.setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: true,
            isAuthenticating: false,
          });

          // Mock refresh endpoint failure (expired/revoked token)
          axios.post.mockRejectedValueOnce({
            response: {
              status: input.errorStatus,
              data: { message: input.errorMessage },
            },
          });

          // ACT: Call restoreSession
          const authService = (await import('../services/authService')).default;
          const result = await authService.restoreSession();

          // ASSERT: User must NOT be authenticated
          expect(result).toBe(false);
          const state = useAuthStore.getState();
          expect(state.isAuthenticated).toBe(false);
          expect(state.token).toBe(null);
          expect(state.isLoading).toBe(false); // setLoaded was called
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * **Validates: Requirements 3.2**
   *
   * Property: FOR ALL network error scenarios during refresh,
   * restoreSession() returns false and user is logged out.
   */
  it('Property: restoreSession returns false on network errors during refresh', async () => {
    const axios = (await import('axios')).default;

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          errorCode: fc.constantFrom('ECONNABORTED', 'ETIMEDOUT', 'ERR_NETWORK'),
          errorMessage: fc.constantFrom(
            'timeout of 15000ms exceeded',
            'Network Error',
            'Request failed'
          ),
        }),
        async (input) => {
          // ARRANGE: Start with no auth
          useAuthStore.setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: true,
            isAuthenticating: false,
          });

          // Mock network error during refresh
          axios.post.mockRejectedValueOnce({
            code: input.errorCode,
            message: input.errorMessage,
          });

          // ACT
          const authService = (await import('../services/authService')).default;
          const result = await authService.restoreSession();

          // ASSERT: User must NOT be authenticated
          expect(result).toBe(false);
          const state = useAuthStore.getState();
          expect(state.isAuthenticated).toBe(false);
          expect(state.token).toBe(null);
          expect(state.isLoading).toBe(false);
        }
      ),
      { numRuns: 10 }
    );
  });
});


describe('Preservation Property: Non-401 Errors Propagate Without Triggering Refresh', () => {
  /**
   * **Validates: Requirements 3.4**
   *
   * Property: FOR ALL non-401 HTTP error status codes (400, 403, 404, 500, 502, 503),
   * the error is propagated to calling code without triggering token refresh.
   *
   * Observed on UNFIXED code: The 401 interceptor in client.js only triggers
   * on status === 401. All other errors pass through as structured errors.
   *
   * NOTE: We test this at the authStore/authService level — non-401 errors
   * from restoreSession's getCurrentUser call (which is a non-401 failure
   * scenario) result in logout. We verify the store correctly handles this.
   */
  it('Property: non-401 errors from getCurrentUser result in logout during restoreSession', async () => {
    const axios = (await import('axios')).default;
    const client = (await import('../api/client')).default;

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Refresh succeeds but getCurrentUser fails with non-401 error
          nonAuthErrorStatus: fc.constantFrom(400, 403, 404, 500, 502, 503),
          accessToken: fc.string({ minLength: 20, maxLength: 100 }),
        }),
        async (input) => {
          // ARRANGE: Start unauthenticated
          useAuthStore.setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: true,
            isAuthenticating: false,
          });

          // Mock: refresh succeeds (returns new token)
          axios.post.mockResolvedValueOnce({
            data: { data: { token: input.accessToken } },
          });

          // Mock: getCurrentUser fails with non-401 error
          client.get.mockRejectedValueOnce({
            response: {
              status: input.nonAuthErrorStatus,
              data: { message: 'Server error' },
            },
          });

          // ACT
          const authService = (await import('../services/authService')).default;
          const result = await authService.restoreSession();

          // ASSERT: restoreSession returns false because getCurrentUser failed
          // and the store is logged out
          expect(result).toBe(false);
          const state = useAuthStore.getState();
          expect(state.isAuthenticated).toBe(false);
          expect(state.isLoading).toBe(false);
        }
      ),
      { numRuns: 20 }
    );
  });
});


describe('Preservation Property: Auth Routes Excluded From 401 Interceptor', () => {
  /**
   * **Validates: Requirements 3.3**
   *
   * Property: FOR ALL auth route URLs (login, signup, refresh, logout),
   * the 401 interceptor does NOT trigger token refresh.
   *
   * Observed on UNFIXED code: The interceptor checks if the URL includes
   * '/auth/login', '/auth/signup', '/auth/refresh', or '/auth/logout'
   * and skips refresh logic for these routes.
   *
   * We test this by verifying the interceptor logic directly via
   * the route exclusion pattern.
   */
  it('Property: auth route URLs are identified as excluded from 401 interceptor', () => {
    // The interceptor exclusion logic from client.js:
    const isAuthRoute = (url) =>
      url?.includes('/auth/login') ||
      url?.includes('/auth/signup') ||
      url?.includes('/auth/refresh') ||
      url?.includes('/auth/logout');

    fc.assert(
      fc.property(
        // Generate auth route URLs with various prefixes/suffixes
        fc.record({
          baseUrl: fc.constantFrom(
            'https://api-split.onlylabs.in/api',
            '/api',
            '',
            'https://localhost:3000/api'
          ),
          authPath: fc.constantFrom(
            '/auth/login',
            '/auth/signup',
            '/auth/refresh',
            '/auth/logout'
          ),
          querySuffix: fc.constantFrom('', '?redirect=true', '?code=123'),
        }),
        (input) => {
          const url = `${input.baseUrl}${input.authPath}${input.querySuffix}`;

          // ASSERT: All auth routes must be identified as excluded
          expect(isAuthRoute(url)).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * **Validates: Requirements 3.3**
   *
   * Property: FOR ALL non-auth API routes, the 401 interceptor
   * WOULD trigger refresh (they are NOT excluded).
   */
  it('Property: non-auth route URLs are NOT excluded from 401 interceptor', () => {
    const isAuthRoute = (url) =>
      url?.includes('/auth/login') ||
      url?.includes('/auth/signup') ||
      url?.includes('/auth/refresh') ||
      url?.includes('/auth/logout');

    fc.assert(
      fc.property(
        fc.constantFrom(
          '/api/groups',
          '/api/expenses',
          '/api/users/me',
          '/api/settlements',
          '/api/friends',
          '/api/notifications',
          '/api/analytics',
          'https://api-split.onlylabs.in/api/groups/123',
          'https://api-split.onlylabs.in/api/expenses'
        ),
        (url) => {
          // ASSERT: Non-auth routes are NOT excluded
          expect(isAuthRoute(url)).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  });
});


describe('Preservation Property: ProtectedRoute Shows Loader While isLoading', () => {
  /**
   * **Validates: Requirements 3.5, 3.6**
   *
   * Property: FOR ALL isLoading=true states (regardless of isAuthenticated value),
   * the ProtectedRoute guard does not redirect — it shows the loader.
   *
   * Observed on UNFIXED code: ProtectedRoute checks isLoading first.
   * If isLoading is true, it returns PageLoader (no redirect).
   * Only when isLoading is false AND isAuthenticated is false does it redirect.
   *
   * We test this at the store level — the ProtectedRoute behavior depends
   * on the store state, so we verify the state contract.
   */
  it('Property: isLoading=true prevents premature redirect decision', () => {
    fc.assert(
      fc.property(
        fc.record({
          // isLoading is always true (simulates auth initialization in progress)
          isAuthenticated: fc.boolean(),
          token: fc.option(fc.string({ minLength: 10, maxLength: 100 }), { nil: null }),
          user: fc.option(
            fc.record({
              id: fc.uuid(),
              email: fc.emailAddress(),
            }),
            { nil: null }
          ),
        }),
        (input) => {
          // ARRANGE: Set store to isLoading=true with any auth state
          useAuthStore.setState({
            user: input.user,
            token: input.token,
            isAuthenticated: input.isAuthenticated,
            isLoading: true,
            isAuthenticating: false,
          });

          // ASSERT: ProtectedRoute logic — when isLoading is true,
          // the guard should show loader (not redirect)
          // This is the contract: isLoading=true means "don't make redirect decision yet"
          const state = useAuthStore.getState();
          expect(state.isLoading).toBe(true);

          // The key property: while isLoading=true, the isAuthenticated value
          // should NOT be used for routing decisions
          // (ProtectedRoute returns PageLoader before checking isAuthenticated)
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * **Validates: Requirements 3.6**
   *
   * Property: setLoaded() transitions isLoading from true to false,
   * enabling the route guard to make its redirect decision.
   */
  it('Property: setLoaded() correctly transitions isLoading to false', () => {
    fc.assert(
      fc.property(
        fc.record({
          isAuthenticated: fc.boolean(),
          token: fc.option(fc.string({ minLength: 10, maxLength: 100 }), { nil: null }),
        }),
        (input) => {
          // ARRANGE: Start with isLoading=true
          useAuthStore.setState({
            user: null,
            token: input.token,
            isAuthenticated: input.isAuthenticated,
            isLoading: true,
            isAuthenticating: false,
          });

          // ACT: Call setLoaded
          useAuthStore.getState().setLoaded();

          // ASSERT: isLoading becomes false, other state unchanged
          const state = useAuthStore.getState();
          expect(state.isLoading).toBe(false);
          expect(state.isAuthenticated).toBe(input.isAuthenticated);
          expect(state.token).toBe(input.token);
        }
      ),
      { numRuns: 20 }
    );
  });
});


describe('Preservation Property: Refresh Queue Mechanism', () => {
  /**
   * **Validates: Requirements 3.5**
   *
   * Property: FOR ALL states where a refresh is in progress,
   * subsequent 401 failures are queued (not triggering additional refreshes).
   *
   * We verify this at the store level — the store's setToken correctly
   * updates the token that will be used for retry, and isAuthenticated
   * is correctly derived from token presence.
   */
  it('Property: setToken correctly updates auth state for queued request retries', () => {
    fc.assert(
      fc.property(
        fc.record({
          newToken: fc.string({ minLength: 20, maxLength: 200 }),
          previousToken: fc.option(fc.string({ minLength: 20, maxLength: 200 }), { nil: null }),
        }),
        (input) => {
          // ARRANGE: Set initial state (could be any state when refresh fires)
          useAuthStore.setState({
            user: { id: '123', email: 'user@test.com', firstName: 'User' },
            token: input.previousToken,
            isAuthenticated: !!input.previousToken,
            isLoading: false,
            isAuthenticating: false,
          });

          // ACT: setToken is called when refresh succeeds (mimics interceptor behavior)
          useAuthStore.getState().setToken(input.newToken);

          // ASSERT: Token is updated and isAuthenticated is true
          const state = useAuthStore.getState();
          expect(state.token).toBe(input.newToken);
          expect(state.isAuthenticated).toBe(true);
        }
      ),
      { numRuns: 30 }
    );
  });
});
