import React from 'react';
import { Navigate } from 'react-router-dom';
import { useDemoAuth } from './DemoAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useDemoAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

interface RoleBasedRouteProps {
  children: React.ReactNode;
  roles: string[];
  redirectTo?: string;
}

export function RoleBasedRoute({ 
  children, 
  roles, 
  redirectTo = '/login' 
}: RoleBasedRouteProps) {
  const { isAuthenticated, hasRole, isLoading } = useDemoAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const hasRequiredRole = roles.some(role => hasRole(role));
  
  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
