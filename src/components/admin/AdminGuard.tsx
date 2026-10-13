import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AdminAuth } from '../../lib/adminAuth';

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * Route guard that strictly restricts access to authenticated administrators.
 * Direct requests to protected /admin routes are rejected and redirected to /admin/login.
 */
export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const location = useLocation();
  const isAuth = AdminAuth.isAuthenticated();

  if (!isAuth) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
