import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { AVAILABLE_ICONS } from '@/contexts/NavigationConfigContext';
import { MOBILE_FOOTER_ITEMS } from '@/config/mobileFooter';
import { useAuth } from '@/contexts/useAuth';

export function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const userRolesRaw = (user?.roles ?? []) as string[] | string;
  const userRoles = (Array.isArray(userRolesRaw) ? userRolesRaw : [userRolesRaw].filter(Boolean))
    .map((role) => String(role).toLowerCase().trim());
  const isAdmin = userRoles.includes('admin');
  const isTecnico = userRoles.includes('tecnico') || userRoles.includes('técnico');
  const isCliente = userRoles.includes('cliente') || userRoles.includes('client');

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const allowedByRole = MOBILE_FOOTER_ITEMS.filter((item) => {
    if (!item.requiredRoles?.length) return true;
    return isAdmin || item.requiredRoles.some((role) => userRoles.includes(role));
  });
  const byId = (id: string) => allowedByRole.find((item) => item.id === id);

  // Secciones explícitas por rol para controlar distribución del footer.
  const navItems = (() => {
    if (isAdmin) {
      return [
        byId('home'),
        byId('clientes'),
        byId('scan'),
        byId('etiquetas'),
        byId('planes'),
      ].filter(Boolean);
    }

    if (isTecnico) {
      return [
        byId('home'),
        byId('scan'),
        byId('clientes'),
      ].filter(Boolean);
    }

    if (isCliente) {
      return [
        byId('home'),
        byId('scan'),
        byId('clientes'),
      ].filter(Boolean);
    }

    return allowedByRole;
  })();

  const centerItem = navItems.find((item) => item.isCenter);
  const sideItems = navItems.filter((item) => !item.isCenter);

  const renderNormalItem = (item: (typeof navItems)[number], className?: string, style?: React.CSSProperties) => {
    const IconComponent = AVAILABLE_ICONS[item.icon];
    if (!IconComponent) return null;

    const active = isActive(item.href);
    return (
      <Link
        key={item.id}
        to={item.href}
        className={cn(
          'flex flex-col items-center justify-center min-w-[56px] py-2 px-2 rounded-lg transition-smooth',
          active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
          className
        )}
        style={style}
      >
        <div className="relative">
          <IconComponent
            className={cn('h-5 w-5 transition-smooth', active && 'scale-110')}
            weight={active ? 'fill' : 'duotone'}
          />
        </div>
        <span className={cn(
          'text-[10px] font-medium mt-1 transition-smooth',
          active && 'font-semibold'
        )}>
          {item.label}
        </span>
      </Link>
    );
  };

  const renderCenterItem = (item: (typeof navItems)[number], style?: React.CSSProperties) => {
    const IconComponent = AVAILABLE_ICONS[item.icon];
    if (!IconComponent) return null;

    return (
      <Link
        key={item.id}
        to={item.href}
        className="relative flex flex-col items-center justify-center -mt-8"
        style={style}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary rounded-full blur-lg opacity-50" />
          <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-glow transition-smooth hover:scale-105 active:scale-95">
            <IconComponent className="h-6 w-6" weight="fill" />
          </div>
        </div>
        <span className="text-[10px] font-medium text-primary mt-1">
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      {/* Glassmorphism background with border */}
      <div className="glass-header border-t border-border/50 shadow-soft-xl">
        {navItems.length === 3 && centerItem ? (
          <div className="grid grid-cols-3 items-end gap-1 px-2 py-2 safe-area-inset-bottom">
            {sideItems[0] ? renderNormalItem(sideItems[0], undefined, { gridColumnStart: 1 }) : null}
            {renderCenterItem(centerItem, { gridColumnStart: 2 })}
            {sideItems[1] ? renderNormalItem(sideItems[1], undefined, { gridColumnStart: 3 }) : null}
          </div>
        ) : (
          <div className="grid grid-cols-5 items-end gap-1 px-2 py-2 safe-area-inset-bottom">
            {sideItems.slice(0, 2).map((item, index) => renderNormalItem(item, undefined, { gridColumnStart: index + 1 }))}
            {centerItem ? renderCenterItem(centerItem, { gridColumnStart: 3 }) : null}
            {sideItems.slice(2, 4).map((item, index) => renderNormalItem(item, undefined, { gridColumnStart: index + 4 }))}
          </div>
        )}
      </div>
    </nav>
  );
}
