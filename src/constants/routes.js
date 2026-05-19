// src/constants/routes.js

// Route path constants — single source of truth for all navigation

export const ROUTES = {
  // ─────────────────────────────────────────────
  // PUBLIC
  // ─────────────────────────────────────────────

  LANDING: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',

  // ─────────────────────────────────────────────
  // PROTECTED
  // ─────────────────────────────────────────────

  DASHBOARD: '/dashboard',

  GROUPS: '/groups',
  GROUP_DETAILS: '/groups/:id',

  ACTIVITY: '/activity',

  ANALYTICS: '/analytics',

  SETTINGS: '/settings',

  PROFILE: '/profile',

  PAYMENTS: '/payments',

  SETTLEMENTS: '/settlements',

  ADD_EXPENSE: '/add-expense',

  CREATE_GROUP: '/create-group',

  FRIEND_MODAL : '/friends-group'
};

// Routes that require authentication

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.GROUPS,
  ROUTES.GROUP_DETAILS,
  ROUTES.ACTIVITY,
  ROUTES.ANALYTICS,
  ROUTES.SETTINGS,
  ROUTES.PROFILE,
  ROUTES.PAYMENTS,
  ROUTES.SETTLEMENTS,
  ROUTES.ADD_EXPENSE,
  ROUTES.CREATE_GROUP,
];

// Routes that should redirect authenticated users

export const AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
];