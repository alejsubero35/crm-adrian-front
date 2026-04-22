import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDemoAuth } from '@/features/auth/DemoAuthContext';
import { getAllRoutes, hasRouteAccess } from '@/config/routes';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Loading fallback component
const RouteLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <LoadingSpinner size="lg" />
  </div>
);

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Route error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
          <h2 className="text-2xl font-semibold text-destructive mb-2">
            Something went wrong
          </h2>
          <p className="text-muted-foreground text-center">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export function AppRoutes() {
  const { isAuthenticated, user } = useDemoAuth();
  const userRoles = user?.roles || [];
  const allRoutes = getAllRoutes();

  const renderRoute = (routeConfig: any) => {
    const { component: Component, path, isPublic, requiredRoles } = routeConfig;
    
    // Check if user has access to this route
    const hasAccess = hasRouteAccess(routeConfig, userRoles);
    
    // If route requires authentication and user is not authenticated
    if (!isPublic && !isAuthenticated) {
      return (
        <Route
          key={path}
          path={path}
          element={<Navigate to="/login" replace />}
        />
      );
    }
    
    // If route requires specific roles and user doesn't have them
    if (!isPublic && requiredRoles && requiredRoles.length > 0 && !hasAccess) {
      return (
        <Route
          key={path}
          path={path}
          element={<Navigate to="/unauthorized" replace />}
        />
      );
    }
    
    // Public routes (like login) should be rendered without layout
    if (isPublic) {
      return (
        <Route
          key={path}
          path={path}
          element={
            <ErrorBoundary>
              <Suspense fallback={<RouteLoadingFallback />}>
                <Component />
              </Suspense>
            </ErrorBoundary>
          }
        />
      );
    }
    
    // Protected routes with layout
    return (
      <Route
        key={path}
        path={path}
        element={
          <ProtectedRoute>
            <MainLayout>
              <ErrorBoundary>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <Component />
                </Suspense>
              </ErrorBoundary>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    );
  };

  return (
    <Routes>
      {allRoutes.map(renderRoute)}
      
      {/* Default redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

// Higher-order component for route protection
export function withRouteProtection<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: string[]
) {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, user } = useDemoAuth();
    const userRoles = user?.roles || [];
    
    // Check authentication
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    // Check roles
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => 
        userRoles.includes(role)
      );
      
      if (!hasRequiredRole) {
        return <Navigate to="/unauthorized" replace />;
      }
    }
    
    return <Component {...props} />;
  };
}

// Hook for checking route access
export function useRouteAccess() {
  const { user } = useDemoAuth();
  const userRoles = user?.roles || [];
  
  const checkAccess = (requiredRoles?: string[]) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.some(role => userRoles.includes(role));
  };
  
  return {
    checkAccess,
    userRoles,
    isAdmin: checkAccess(['admin']),
    isManager: checkAccess(['manager']),
    isUser: checkAccess(['user']),
  };
}
