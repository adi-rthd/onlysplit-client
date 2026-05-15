import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import ProtectedRoute from '../guards/ProtectedRoute';
import PublicRoute from '../guards/PublicRoute';
import MainLayout from '../layouts/MainLayout';
import PageLoader from '../components/ui/PageLoader';

// ── Lazy-loaded pages (route-based code splitting) ──
const LandingPage = lazy(() => import('../pages/LandingPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const SignupPage = lazy(() => import('../pages/auth/SignupPage'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const GroupsPage = lazy(() => import('../pages/GroupsPage'));
const ActivityFeed = lazy(() => import('../pages/ActivityFeed'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const AddExpenseModal = lazy(() => import('../components/modals/AddExpenseModal'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public routes ── */}
        <Route path={ROUTES.LANDING} element={<LandingPage />} />

        {/* ── Auth routes (redirect if already logged in) ── */}
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

        {/* ── Protected routes (require authentication) ── */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.GROUPS} element={<GroupsPage />} />
          <Route path={ROUTES.ACTIVITY} element={<ActivityFeed />} />
          <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route
            path={ROUTES.ADD_EXPENSE}
            element={
              <>
                <Dashboard />
                <AddExpenseModal />
              </>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
