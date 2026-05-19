// src/routes/AppRoutes.jsx

import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import { ROUTES } from '../constants/routes';

import ProtectedRoute from '../guards/ProtectedRoute';
import PublicRoute from '../guards/PublicRoute';

import MainLayout from '../layouts/MainLayout';

import PageLoader from '../components/ui/PageLoader';
import FriendshipModal from '../components/modals/FriendshipModal';

// ─────────────────────────────────────────────────────────────
// Lazy Loaded Pages
// ─────────────────────────────────────────────────────────────

const LandingPage = lazy(() => import('../pages/LandingPage'));

const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const SignupPage = lazy(() => import('../pages/auth/SignupPage'));

const Dashboard = lazy(() => import('../pages/Dashboard'));

const GroupsPage = lazy(() => import('../pages/GroupsPage'));
const GroupDetailsPage = lazy(() => import('../pages/GroupDetailsPage'));

const ActivityFeed = lazy(() => import('../pages/ActivityFeed'));

const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));

const SettingsPage = lazy(() => import('../pages/SettingsPage'));

const SettlementsPage = lazy(() => import('../pages/SettlementsPage'));

// ─────────────────────────────────────────────────────────────
// Lazy Loaded Modals
// ─────────────────────────────────────────────────────────────

const AddExpenseModal = lazy(() =>
  import('../components/modals/AddExpenseModal')
);

const CreateGroupModal = lazy(() => 
  import('../components/modals/CreateGroupModal')
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ───────────────────────────────────────────── */}
        {/* PUBLIC ROUTES */}
        {/* ───────────────────────────────────────────── */}

        <Route path={ROUTES.LANDING} element={<LandingPage />} />

        {/* ───────────────────────────────────────────── */}
        {/* AUTH ROUTES */}
        {/* ───────────────────────────────────────────── */}

        <Route
          path={ROUTES.LOGIN}
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route
          path={ROUTES.SIGNUP}
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />

        {/* ───────────────────────────────────────────── */}
        {/* PROTECTED ROUTES */}
        {/* ───────────────────────────────────────────── */}

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route
            path={ROUTES.DASHBOARD}
            element={<Dashboard />}
          />

          {/* Groups */}
          <Route
            path={ROUTES.GROUPS}
            element={<GroupsPage />}
          />

          {/* Group Details */}
          <Route
            path={ROUTES.GROUP_DETAILS}
            element={<GroupDetailsPage />}
          />

          {/* Activity */}
          <Route
            path={ROUTES.ACTIVITY}
            element={<ActivityFeed />}
          />

          {/* Settlements */}
          <Route
            path={ROUTES.SETTLEMENTS}
            element={<SettlementsPage />}
          />

          {/* Analytics */}
          <Route
            path={ROUTES.ANALYTICS}
            element={<AnalyticsPage />}
          />

          {/* Settings */}
          <Route
            path={ROUTES.SETTINGS}
            element={<SettingsPage />}
          />

          {/* Profile */}
          <Route
            path={ROUTES.PROFILE}
            element={<SettingsPage />}
          />

          {/* Payments */}
          <Route
            path={ROUTES.PAYMENTS}
            element={<Dashboard />}
          />

          {/* Add Expense Modal Route */}
          <Route
            path={ROUTES.ADD_EXPENSE}
            element={
              <>
                <Dashboard />
                <AddExpenseModal />
              </>
            }
          />

          {/* Create Group Modal Route */}
          <Route
            path={ROUTES.CREATE_GROUP}
            element={
              <>
                <GroupsPage />
                <CreateGroupModal />
              </>
            }
          />
          {/* Create Frienship Modal Route */}
          <Route
            path={ROUTES.FRIEND_MODAL}
            element={
              <>
                <GroupsPage />
                <FriendshipModal />
              </>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;