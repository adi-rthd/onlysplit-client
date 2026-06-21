// src/constants/routes.js

// Route path constants — single source of truth for all navigation

export const ROUTES = {
  // ─────────────────────────────────────────────
  // PUBLIC
  // ─────────────────────────────────────────────

  LANDING: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DOWNLOAD: '/download',

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

  FRIENDS: '/friends',

  ADD_EXPENSE: '/add-expense/:id',

  CREATE_GROUP: '/create-group',

  FRIEND_MODAL : '/friends-group',

  INVITE_MODAL : '/invite-group/:id',

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
  ROUTES.FRIEND_MODAL,
  ROUTES.INVITE_MODAL
];

// Routes that should redirect authenticated users

export const AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
];