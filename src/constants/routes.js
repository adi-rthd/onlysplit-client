// Route path constants — single source of truth for all navigation
export const ROUTES = {
  // Public
  LANDING: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',

  // Protected
  DASHBOARD: '/dashboard',
  GROUPS: '/groups',
  ACTIVITY: '/activity',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  ADD_EXPENSE: '/add-expense',
};

// Routes that require authentication
export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.GROUPS,
  ROUTES.ACTIVITY,
  ROUTES.ANALYTICS,
  ROUTES.SETTINGS,
  ROUTES.ADD_EXPENSE,
];

// Routes that should redirect authenticated users to dashboard
export const AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
];
