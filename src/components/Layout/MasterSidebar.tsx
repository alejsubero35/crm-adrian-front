import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUI } from '@/contexts/UIContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  SquaresFour,
  Users,
  Gear,
  FileText,
  ChartBar,
  Package,
  Question,
  CaretDown,
  CaretRight,
  SignOut,
  List
} from '@phosphor-icons/react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  badge?: string | number;
  children?: SidebarItem[];
  requiredRoles?: string[];
}

interface SidebarProps {
  className?: string;
  items?: SidebarItem[];
}

const defaultSidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: SquaresFour,
    href: '/dashboard',
  },
  {
    id: 'users',
    label: 'Usuarios',
    icon: Users,
    href: '/users',
    requiredRoles: ['admin'],
  },
  {
    id: 'products',
    label: 'Productos',
    icon: Package,
    href: '/products',
  },
  {
    id: 'proveedores',
    label: 'Lista Proveedores',
    icon: Package,
    href: '/proveedores',
  },
  {
    id: 'clientes',
    label: 'Lista de Clientes',
    icon: Package,
    href: '/clientes',
  },
  {
    id: 'reports',
    label: 'Reportes',
    icon: ChartBar,
    href: '/reports',
    children: [
      {
        id: 'sales',
        label: 'Ventas',
        icon: FileText,
        href: '/reports/sales',
      },
      {
        id: 'inventory',
        label: 'Inventario',
        icon: Package,
        href: '/reports/inventory',
      },
    ],
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: Gear,
    href: '/settings',
    requiredRoles: ['admin'],
    children: [
      {
        id: 'navigation-settings',
        label: 'Navegación Mobile',
        icon: Gear,
        href: '/settings/navigation',
      },
    ],
  },
];

export function MasterSidebar({ className = '', items = defaultSidebarItems }: SidebarProps) {
  const { 
    isSidebarOpen, 
    isSidebarCollapsed, 
    isMobile, 
    isMobileDrawerOpen,
    closeMobileDrawer,
    isDesktop
  } = useUI();
  
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  // Don't render on mobile when drawer is closed
  if (isMobile && !isMobileDrawerOpen) {
    return null;
  }

  // Don't render on desktop when sidebar is closed
  if (isDesktop && !isSidebarOpen) {
    return null;
  }

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const isItemActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const Icon = item.icon;
    const isActive = item.href ? isItemActive(item.href) : false;
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isCollapsed = isSidebarCollapsed && level === 0;

    const itemContent = (
      <>
        <Icon className="h-4 w-4 shrink-0" weight="duotone" />
        {!isCollapsed && (
          <>
            <span className="flex-1 text-sm font-medium">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto h-5 px-2 text-xs">
                {item.badge}
              </Badge>
            )}
            {hasChildren && (
              <CaretDown className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-200",
                isExpanded && "rotate-180"
              )} weight="bold" />
            )}
          </>
        )}
      </>
    );

    if (hasChildren) {
      return (
        <Collapsible
          key={item.id}
          open={isExpanded}
          onOpenChange={() => toggleExpanded(item.id)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-10 rounded-lg transition-smooth",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft" 
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground/90 hover:text-sidebar-foreground",
                isCollapsed && "justify-center px-2"
              )}
            >
              {itemContent}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-1 ml-3 pl-3 border-l border-border/30">
            {item.children?.map((child) => renderSidebarItem(child, level + 1))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    if (item.href) {
      return (
        <Link key={item.id} to={item.href}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-10 rounded-lg transition-smooth",
              level > 0 && "h-9 text-sm",
              isActive 
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft" 
                : "hover:bg-sidebar-accent/50 text-sidebar-foreground/90 hover:text-sidebar-foreground",
              isCollapsed && "justify-center px-2"
            )}
            onClick={() => {
              if (isMobile) {
                closeMobileDrawer();
              }
            }}
          >
            {itemContent}
          </Button>
        </Link>
      );
    }

    return (
      <Button
        key={item.id}
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 h-10 rounded-lg transition-smooth hover:bg-sidebar-accent/50 text-sidebar-foreground/90 hover:text-sidebar-foreground",
          isCollapsed && "justify-center px-2"
        )}
      >
        {itemContent}
      </Button>
    );
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex flex-col h-full glass-sidebar border-r border-border/50 transition-all duration-300",
          isSidebarCollapsed ? "w-16" : "w-64",
          isMobile && "fixed inset-y-0 left-0 z-50 w-64 shadow-soft-xl",
          className
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden shadow-glow">
                <img src="/img/ms-icon-310x310.png" alt="Logo" className="h-full w-full object-cover" />
              </div>
              <span className="font-semibold text-sidebar-foreground">Starter Kit</span>
            </div>
          )}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={closeMobileDrawer}
              className="h-9 w-9 rounded-lg hover:bg-sidebar-accent/50 transition-smooth"
            >
              <List className="h-4 w-4" weight="bold" />
            </Button>
          )}
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-minimal">
          {items.map((item) => {
            const itemElement = renderSidebarItem(item);
            
            // Add tooltip for collapsed items
            if (isSidebarCollapsed && !item.children) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    {itemElement}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }
            
            return itemElement;
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-border/50">
          {!isSidebarCollapsed ? (
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 h-10 rounded-lg transition-smooth hover:bg-sidebar-accent/50 text-sidebar-foreground/90 hover:text-sidebar-foreground"
              >
                <Question className="h-4 w-4" weight="duotone" />
                <span className="flex-1 text-sm font-medium">Ayuda</span>
              </Button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="w-full h-10 rounded-lg transition-smooth hover:bg-sidebar-accent/50"
                >
                  <Question className="h-4 w-4" weight="duotone" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Ayuda</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
