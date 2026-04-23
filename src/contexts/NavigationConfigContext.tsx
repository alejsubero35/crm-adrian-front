import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';
import {
  House,
  Users,
  ShoppingBag,
  ChartBar,
  Gear,
  Package,
  FileText,
  TrendUp,
  Calendar,
  ChatCircle
} from '@phosphor-icons/react';

export interface NavItem {
  id: string;
  label: string;
  icon: string; // Nombre del icono como string
  href: string;
  enabled: boolean;
  order: number;
  isCenter?: boolean; // Item destacado en el centro
}

// Mapa de iconos disponibles
export const AVAILABLE_ICONS: Record<string, PhosphorIcon> = {
  Home: House,
  Users,
  ShoppingBag,
  BarChart3: ChartBar,
  Settings: Gear,
  Package,
  FileText,
  TrendingUp: TrendUp,
  Calendar,
  MessageSquare: ChatCircle,
};

// Configuración por defecto
const DEFAULT_NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Inicio',
    icon: 'Home',
    href: '/dashboard',
    enabled: true,
    order: 0,
  },
  {
    id: 'clients',
    label: 'Clientes',
    icon: 'Users',
    href: '/users',
    enabled: true,
    order: 1,
  },
  {
    id: 'products',
    label: 'Productos',
    icon: 'ShoppingBag',
    href: '/products',
    enabled: true,
    order: 2,
    isCenter: true, // Este es el botón central destacado
  },
  {
    id: 'settings',
    label: 'Ajustes',
    icon: 'Settings',
    href: '/settings',
    enabled: true,
    order: 3,
  },
  {
    id: 'reports',
    label: 'Reportes',
    icon: 'BarChart3',
    href: '/reports',
    enabled: true,
    order: 4,
  },
];

interface NavigationConfigContextType {
  navItems: NavItem[];
  updateNavItem: (id: string, updates: Partial<NavItem>) => void;
  resetToDefaults: () => void;
  reorderNavItems: (items: NavItem[]) => void;
  getEnabledItems: () => NavItem[];
  getCenterItem: () => NavItem | undefined;
}

const NavigationConfigContext = createContext<NavigationConfigContextType | undefined>(undefined);

const STORAGE_KEY = 'navigation_config';

export function NavigationConfigProvider({ children }: { children: React.ReactNode }) {
  const [navItems, setNavItems] = useState<NavItem[]>(() => {
    // Cargar desde localStorage si existe
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error loading navigation config:', e);
      }
    }
    return DEFAULT_NAV_ITEMS;
  });

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(navItems));
  }, [navItems]);

  const updateNavItem = (id: string, updates: Partial<NavItem>) => {
    setNavItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const resetToDefaults = () => {
    setNavItems(DEFAULT_NAV_ITEMS);
  };

  const reorderNavItems = (items: NavItem[]) => {
    // Actualizar el orden basado en la nueva posición
    const reordered = items.map((item, index) => ({
      ...item,
      order: index,
    }));
    setNavItems(reordered);
  };

  const getEnabledItems = () => {
    return navItems
      .filter(item => item.enabled)
      .sort((a, b) => a.order - b.order);
  };

  const getCenterItem = () => {
    return navItems.find(item => item.isCenter && item.enabled);
  };

  return (
    <NavigationConfigContext.Provider
      value={{
        navItems,
        updateNavItem,
        resetToDefaults,
        reorderNavItems,
        getEnabledItems,
        getCenterItem,
      }}
    >
      {children}
    </NavigationConfigContext.Provider>
  );
}

export function useNavigationConfig() {
  const context = useContext(NavigationConfigContext);
  if (!context) {
    throw new Error('useNavigationConfig must be used within NavigationConfigProvider');
  }
  return context;
}
