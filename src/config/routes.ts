import React from 'react';
import { LayoutDashboard, Users, Settings, FileText, BarChart3, Package } from 'lucide-react';

export interface RouteConfig {
  id: string;
  path: string;
  label: string;
  icon: React.ElementType;
  component: React.ComponentType;
  isPublic?: boolean;
  requiredRoles?: string[];
  children?: RouteConfig[];
  showInSidebar?: boolean;
  badge?: string | number;
}

// Import components dynamically (lazy loading)
const MasterDashboard = React.lazy(() => import('@/pages/MasterDashboard'));
const UserCRUD = React.lazy(() => import('@/pages/UserCRUD'));
const ProductCRUD = React.lazy(() => import('@/pages/ProductCRUD'));
const Reports = React.lazy(() => import('@/pages/Reports'));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage'));
const SalesReport = React.lazy(() => import('@/pages/reports/SalesReport'));
const InventoryReport = React.lazy(() => import('@/pages/reports/InventoryReport'));
const Login = React.lazy(() => import('@/features/auth/LoginPage'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));
const Unauthorized = React.lazy(() => import('@/pages/Unauthorized'));

export const routeConfig: RouteConfig[] = [
  // Public routes
  {
    id: 'login',
    path: '/login',
    label: 'Login',
    icon: Users,
    component: Login,
    isPublic: true,
    showInSidebar: false,
  },
  
  // Protected routes
  {
    id: 'dashboard',
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    component: MasterDashboard,
    showInSidebar: true,
  },
  
  {
    id: 'users',
    path: '/users',
    label: 'Usuarios',
    icon: Users,
    component: UserCRUD,
    requiredRoles: ['admin'],
    showInSidebar: true,
  },
  
  {
    id: 'products',
    path: '/products',
    label: 'Productos',
    icon: Package,
    component: ProductCRUD,
    showInSidebar: true,
  },
  
  {
    id: 'reports',
    path: '/reports',
    label: 'Reportes',
    icon: BarChart3,
    component: Reports,
    showInSidebar: true,
    children: [
      {
        id: 'sales-report',
        path: '/reports/sales',
        label: 'Ventas',
        icon: FileText,
        component: SalesReport,
        showInSidebar: true,
      },
      {
        id: 'inventory-report',
        path: '/reports/inventory',
        label: 'Inventario',
        icon: Package,
        component: InventoryReport,
        showInSidebar: true,
      },
    ],
  },
  
  {
    id: 'settings',
    path: '/settings',
    label: 'Configuración',
    icon: Settings,
    component: SettingsPage,
    requiredRoles: ['admin'],
    showInSidebar: true,
  },
  
  // Error routes
  {
    id: 'not-found',
    path: '*',
    label: 'Not Found',
    icon: FileText,
    component: NotFound,
    isPublic: true,
    showInSidebar: false,
  },
  
  {
    id: 'unauthorized',
    path: '/unauthorized',
    label: 'Unauthorized',
    icon: FileText,
    component: Unauthorized,
    isPublic: true,
    showInSidebar: false,
  },
];

// Helper functions
export const getPublicRoutes = () => {
  return routeConfig.filter(route => route.isPublic);
};

export const getProtectedRoutes = () => {
  return routeConfig.filter(route => !route.isPublic);
};

export const getSidebarRoutes = (userRoles: string[] = []) => {
  return routeConfig.filter(route => {
    if (!route.showInSidebar) return false;
    if (route.requiredRoles && route.requiredRoles.length > 0) {
      return route.requiredRoles.some(role => userRoles.includes(role));
    }
    return true;
  });
};

export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return routeConfig.find(route => route.path === path);
};

export const hasRouteAccess = (route: RouteConfig, userRoles: string[] = []): boolean => {
  if (route.isPublic) return true;
  if (!route.requiredRoles || route.requiredRoles.length === 0) return true;
  return route.requiredRoles.some(role => userRoles.includes(role));
};

export const flattenRoutes = (routes: RouteConfig[]): RouteConfig[] => {
  const flattened: RouteConfig[] = [];
  
  routes.forEach(route => {
    flattened.push(route);
    if (route.children) {
      flattened.push(...flattenRoutes(route.children));
    }
  });
  
  return flattened;
};

// Get all routes in flat format for React Router
export const getAllRoutes = (): RouteConfig[] => {
  return flattenRoutes(routeConfig);
};
