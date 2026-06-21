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
  FEATURES: '/features',
  HOW_IT_WORKS: '/how-it-works',
  SPLITWISE_ALTERNATIVE: '/splitwise-alternative',
  BLOG: '/blog',
  CONTACT: '/contact',
  PRIVACY_POLICY: '/privacy-policy',
  TERMS: '/terms',

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

// Public routes accessible without authentication (included in sitemap)

export const PUBLIC_ROUTES = [
  ROUTES.LANDING,
  ROUTES.FEATURES,
  ROUTES.HOW_IT_WORKS,
  ROUTES.SPLITWISE_ALTERNATIVE,
  ROUTES.BLOG,
  ROUTES.CONTACT,
  ROUTES.PRIVACY_POLICY,
  ROUTES.TERMS,
  ROUTES.DOWNLOAD,
];

// Routes that should redirect authenticated users

export const AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
];