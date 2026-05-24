import React from 'react';
import { LayoutDashboard, Users, Settings, FileText, BarChart3, Package, QrCode, ClipboardList, UserCircle, BadgeDollarSign } from 'lucide-react';

export interface RouteConfig {
  id: string;
  path: string;
  label: string;
  icon: React.ElementType;
  component: React.ComponentType;
  isPublic?: boolean;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  /** Roles que no deben ver esta ruta en menú ni acceder por URL */
  hiddenRoles?: string[];
  children?: RouteConfig[];
  showInSidebar?: boolean;
  badge?: string | number;
}

// Import components dynamically (lazy loading)
const MasterDashboard = React.lazy(() => import('@/pages/MasterDashboard'));
const ProfilePage = React.lazy(() => import('@/pages/ProfilePage'));
const UserCRUD = React.lazy(() => import('@/pages/UserCRUD'));
const ProductCRUD = React.lazy(() => import('@/pages/ProductCRUD'));
const Reports = React.lazy(() => import('@/pages/Reports'));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage'));
const NavigationSettings = React.lazy(() => import('@/pages/NavigationSettings'));
const PermissionMatrixPage = React.lazy(() => import('@/pages/PermissionMatrixPage'));
const SalesReport = React.lazy(() => import('@/pages/reports/SalesReport'));
const InventoryReport = React.lazy(() => import('@/pages/reports/InventoryReport'));
const Login = React.lazy(() => import('@/features/auth/LoginPage'));
const ClientesCRUD = React.lazy(() => import('@/pages/ClientesCRUD'));
const PlanesCRUD = React.lazy(() => import('@/pages/PlanesCRUD'));
const SubscriptionsPage = React.lazy(() => import('@/pages/SubscriptionsPage'));
const HvacScanPage = React.lazy(() => import('@/pages/HvacScanPage'));
const HvacMaintenanceRegisterPage = React.lazy(() => import('@/pages/HvacMaintenanceRegisterPage'));
const QrGeneratorPage = React.lazy(() => import('@/pages/QrGeneratorPage'));
const ProveedoresCRUD = React.lazy(() => import('@/pages/ProveedoresCRUD'));
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
    id: 'profile',
    path: '/profile',
    label: 'Mi perfil',
    icon: UserCircle,
    component: ProfilePage,
    showInSidebar: false,
  },
  
  {
    id: 'users',
    path: '/users',
    label: 'Usuarios',
    icon: Users,
    component: UserCRUD,
    requiredRoles: ['admin'],
    requiredPermissions: ['users.view'],
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
    id: 'proveedores',
    path: '/proveedores',
    label: 'Lista Proveedores',
    icon: Package,
    component: ProveedoresCRUD,
    showInSidebar: true,
  },
  {
    id: 'clientes',
    path: '/clientes',
    label: 'Lista de Clientes',
    icon: Package,
    component: ClientesCRUD,
    requiredPermissions: ['customers.view'],
    hiddenRoles: ['cliente', 'client'],
    showInSidebar: true,
  },
  {
    id: 'qrs',
    path: '/qrs',
    label: 'Etiquetas QR',
    icon: QrCode,
    component: QrGeneratorPage,
    requiredRoles: ['admin'],
    showInSidebar: true,
  },
  {
    id: 'planes',
    path: '/planes',
    label: 'Planes HVAC',
    icon: ClipboardList,
    component: PlanesCRUD,
    requiredRoles: ['admin'],
    showInSidebar: true,
  },
  {
    id: 'subscriptions',
    path: '/subscriptions',
    label: 'Suscriptores',
    icon: BadgeDollarSign,
    component: SubscriptionsPage,
    requiredRoles: ['admin'],
    showInSidebar: true,
  },
  {
    id: 'scan-qr-registrar-servicio',
    path: '/scan/:uuid/registrar-servicio',
    label: 'Registrar servicio',
    icon: QrCode,
    component: HvacMaintenanceRegisterPage,
    requiredPermissions: ['equipments.view'],
    showInSidebar: false,
  },
  {
    id: 'scan-qr',
    path: '/scan/:uuid',
    label: 'Escaneo QR',
    icon: QrCode,
    component: HvacScanPage,
    requiredPermissions: ['equipments.view'],
    showInSidebar: true,
  },
  {
    id: 'scan-qr-home',
    path: '/scan',
    label: 'Escaneo QR',
    icon: QrCode,
    component: HvacScanPage,
    showInSidebar: false,
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
    children: [
      {
        id: 'navigation-settings',
        path: '/settings/navigation',
        label: 'Navegación Mobile',
        icon: Settings,
        component: NavigationSettings,
        requiredPermissions: ['users.view'],
        showInSidebar: true,
      },
      {
        id: 'rbac-settings',
        path: '/settings/permissions',
        label: 'Permisos y Roles',
        icon: Settings,
        component: PermissionMatrixPage,
        requiredPermissions: ['roles.view'],
        showInSidebar: true,
      },
    ],
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

export const getHomePathForRoles = (_userRoles: string[] = []): string => '/dashboard';

export const getSidebarRoutes = (userRoles: string[] = []) => {
  return routeConfig.filter(route => {
    if (!route.showInSidebar) return false;
    if (route.hiddenRoles?.some((role) => userRoles.includes(role))) return false;
    if (route.requiredRoles && route.requiredRoles.length > 0) {
      return route.requiredRoles.some(role => userRoles.includes(role));
    }
    return true;
  });
};

export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return routeConfig.find(route => route.path === path);
};

export const hasRouteAccess = (route: RouteConfig, userRoles: string[] = [], userPermissions: string[] = []): boolean => {
  if (route.isPublic) return true;
  if (route.hiddenRoles?.some((role) => userRoles.includes(role))) return false;
  if (userRoles.includes('admin')) return true;
  if (route.requiredPermissions && route.requiredPermissions.length > 0) {
    return route.requiredPermissions.every(permission => userPermissions.includes(permission));
  }
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
