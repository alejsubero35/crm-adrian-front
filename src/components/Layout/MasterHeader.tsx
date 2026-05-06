import React from 'react';
import { Link } from 'react-router-dom';
import { useUI } from '@/contexts/UIContext';
import { useDemoAuth } from '@/features/auth/DemoAuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  List,
  X,
  SignOut,
  User,
} from '@phosphor-icons/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User as AuthUser } from '@/contexts/authContextObj';

interface HeaderProps {
  className?: string;
}

function headerDisplayName(u: AuthUser | null): string {
  if (!u) return '';
  const parts = [u.first_name, u.last_name].filter(Boolean);
  if (parts.length) return parts.join(' ');
  if (u.name) return u.name;
  return u.username || u.email?.split('@')[0] || '';
}

function headerInitial(u: AuthUser | null): string {
  const n = headerDisplayName(u);
  if (n) return n.charAt(0).toUpperCase();
  return (u?.email?.charAt(0) || 'U').toUpperCase();
}

export function MasterHeader({ className = '' }: HeaderProps) {
  const {
    toggleSidebar,
    isMobile,
    isMobileDrawerOpen,
  } = useUI();

  const { user, logout } = useDemoAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const label = headerDisplayName(user as AuthUser | null);

  return (
    <header className={`sticky top-0 z-50 w-full border-b border-border/50 glass-header shadow-soft transition-smooth ${className}`}>
      <div className="flex w-full h-16 items-center justify-between px-4 lg:px-8">
        {/* Left side - Menu Toggle (only on mobile/tablet) */}
        <div className="flex items-center gap-3">
          {/* Menu Toggle Button - Hidden on desktop (lg and above) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-10 w-10 rounded-lg hover:bg-muted/80 transition-smooth lg:hidden focus-modern"
          >
            {isMobile ? (
              isMobileDrawerOpen ? (
                <X className="h-5 w-5" weight="bold" />
              ) : (
                <List className="h-5 w-5" weight="bold" />
              )
            ) : (
              <List className="h-5 w-5" weight="bold" />
            )}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>

        {/* Center - Title with Logo (visible on mobile) */}
        <div className="flex items-center gap-2 lg:hidden absolute left-1/2 -translate-x-1/2">
          <img src="/img/logo_solo.png" alt="Logo" className="h-8 w-8 object-contain rounded-lg" />
          <span className="font-semibold text-foreground text-base">IJF CRM</span>
        </div>

        {/* Right side - User Avatar */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-lg p-0 hover:bg-muted/80 transition-smooth focus-modern">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={(user as { avatar?: string } | null)?.avatar} alt={label} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                    {headerInitial(user as AuthUser | null)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-0 glass-card shadow-soft-lg" align="end" forceMount>
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-border/50">
                    <AvatarImage src={(user as { avatar?: string } | null)?.avatar} alt={label} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-lg">
                      {headerInitial(user as AuthUser | null)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-tight truncate">{label || 'Usuario'}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer transition-smooth focus:bg-muted/80">
                  <Link to="/profile" className="flex w-full cursor-pointer items-center">
                    <User className="mr-3 h-4 w-4" weight="duotone" />
                    <span className="text-sm font-medium">Mi Perfil</span>
                  </Link>
                </DropdownMenuItem>
              </div>
              <div className="p-2 border-t border-border/50">
                <DropdownMenuItem onClick={handleLogout} className="rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 transition-smooth">
                  <SignOut className="mr-3 h-4 w-4" weight="duotone" />
                  <span className="text-sm font-medium">Cerrar sesión</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
