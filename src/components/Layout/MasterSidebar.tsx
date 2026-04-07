import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUI } from '@/contexts/UIContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  BarChart3,
  Package,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu
} from 'lucide-react';
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
    icon: LayoutDashboard,
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
    id: 'reports',
    label: 'Reportes',
    icon: BarChart3,
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
    icon: Settings,
    href: '/settings',
    requiredRoles: ['admin'],
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
        <Icon className="h-4 w-4 shrink-0" />
        {!isCollapsed && (
          <>
            <span className="flex-1 text-sm">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
            {hasChildren && (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )
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
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-2 h-10",
                isActive && "bg-accent text-accent-foreground",
                isCollapsed && "justify-center px-2"
              )}
            >
              {itemContent}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {item.children?.map((child) => renderSidebarItem(child, level + 1))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    if (item.href) {
      return (
        <Link key={item.id} to={item.href}>
          <Button
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-2 h-10",
              isActive && "bg-accent text-accent-foreground",
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
          "w-full justify-start gap-2 h-10",
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
          "flex flex-col h-full bg-background border-r transition-all duration-300",
          isSidebarCollapsed ? "w-16" : "w-64",
          isMobile && "fixed inset-y-0 left-0 z-50 w-64",
          className
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold">SK</span>
              </div>
              <span className="font-semibold">Starter Kit</span>
            </div>
          )}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={closeMobileDrawer}
              className="h-8 w-8"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
        <div className="p-4 border-t">
          {!isSidebarCollapsed && (
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start gap-2 h-10">
                <HelpCircle className="h-4 w-4" />
                <span className="flex-1 text-sm">Ayuda</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
