import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ROUTES } from '../constants/routes';
import PageLoader from '../components/ui/PageLoader';

/**
 * Wraps routes that require authentication.
 * - While hydrating from localStorage, shows a full-page loader.
 * - If unauthenticated, redirects to /login and preserves the intended URL.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
