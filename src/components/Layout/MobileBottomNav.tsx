import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useNavigationConfig, AVAILABLE_ICONS } from '@/contexts/NavigationConfigContext';

export function MobileBottomNav() {
  const location = useLocation();
  const { getEnabledItems } = useNavigationConfig();

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const navItems = getEnabledItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      {/* Glassmorphism background with border */}
      <div className="glass-header border-t border-border/50 shadow-soft-xl">
        <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
          {navItems.map((item) => {
            const IconComponent = AVAILABLE_ICONS[item.icon];
            if (!IconComponent) return null;
            
            const active = isActive(item.href);
            const isCenter = item.isCenter; // Item destacado configurado

            if (isCenter) {
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className="relative flex flex-col items-center justify-center -mt-8"
                >
                  {/* Botón central flotante con gradiente */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary rounded-full blur-lg opacity-50" />
                    <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-glow transition-smooth hover:scale-105 active:scale-95">
                      <IconComponent className="h-6 w-6" />
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-primary mt-1">
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.href}
                className={cn(
                  'flex flex-col items-center justify-center min-w-[60px] py-2 px-3 rounded-lg transition-smooth',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="relative">
                  <IconComponent className={cn(
                    'h-5 w-5 transition-smooth',
                    active && 'scale-110'
                  )} />
                </div>
                <span className={cn(
                  'text-[10px] font-medium mt-1 transition-smooth',
                  active && 'font-semibold'
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
