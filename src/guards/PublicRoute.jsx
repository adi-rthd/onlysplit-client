import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ROUTES } from '../constants/routes';
import PageLoader from '../components/ui/PageLoader';

/**
 * Wraps auth routes (login, signup).
 * Redirects already-authenticated users to the dashboard.
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

export default PublicRoute;
