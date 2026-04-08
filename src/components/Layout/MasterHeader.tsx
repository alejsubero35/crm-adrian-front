import React from 'react';
import { useUI } from '@/contexts/UIContext';
import { useDemoAuth } from '@/features/auth/DemoAuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  X, 
  Bell, 
  Search, 
  Settings, 
  LogOut, 
  User,
  ChevronDown,
  Moon,
  Sun
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  className?: string;
}

export function MasterHeader({ className = '' }: HeaderProps) {
  const { 
    toggleSidebar, 
    isMobile, 
    isMobileDrawerOpen, 
    isDarkMode,
    toggleTheme
  } = useUI();
  
  const { user, logout } = useDemoAuth();

  // Mock notifications data
  const notifications = [
    { id: 1, title: 'Nuevo usuario registrado', description: 'Hace 5 minutos', read: false },
    { id: 2, title: 'Actualización del sistema', description: 'Hace 1 hora', read: false },
    { id: 3, title: 'Tarea completada', description: 'Hace 3 horas', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className={`sticky top-0 z-50 w-full border-b border-border/50 glass-header shadow-soft transition-smooth ${className}`}>
      <div className="container flex h-16 items-center justify-between px-4 lg:px-8">
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
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>

        {/* Center - Search Bar (hidden on mobile) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              placeholder="Buscar en la aplicación..."
              className="input-modern pl-10 h-10 bg-muted/30 border-border/50 hover:border-border transition-smooth"
              type="search"
            />
          </div>
        </div>

        {/* Right side - Notifications, Theme Toggle, and User Avatar */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-10 w-10 rounded-lg hover:bg-muted/80 transition-smooth focus-modern"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-10 w-10 rounded-lg hover:bg-muted/80 transition-smooth focus-modern"
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-semibold bg-primary text-primary-foreground shadow-glow">
                    {notifications.length}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0 glass-card shadow-soft-lg" align="end">
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Notificaciones</h4>
                  <Badge className="badge-primary">{notifications.length}</Badge>
                </div>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start gap-3 p-4 border-b border-border/30 hover:bg-muted/50 cursor-pointer transition-smooth last:border-0"
                  >
                    <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${notification.read ? 'bg-muted-foreground/30' : 'bg-primary shadow-glow'}`} />
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{notification.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{notification.description}</p>
                      <p className="text-xs text-muted-foreground/70">{notification.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border/50">
                <Button variant="ghost" className="w-full h-9 text-sm font-medium hover:bg-muted/80 transition-smooth" size="sm">
                  Ver todas las notificaciones
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* User Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-lg p-0 hover:bg-muted/80 transition-smooth focus-modern">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-0 glass-card shadow-soft-lg" align="end" forceMount>
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-border/50">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-lg">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-tight truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <DropdownMenuItem className="rounded-lg cursor-pointer transition-smooth focus:bg-muted/80">
                  <User className="mr-3 h-4 w-4" />
                  <span className="text-sm font-medium">Mi Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg cursor-pointer transition-smooth focus:bg-muted/80">
                  <Settings className="mr-3 h-4 w-4" />
                  <span className="text-sm font-medium">Configuración</span>
                </DropdownMenuItem>
              </div>
              <div className="p-2 border-t border-border/50">
                <DropdownMenuItem onClick={handleLogout} className="rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 transition-smooth">
                  <LogOut className="mr-3 h-4 w-4" />
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
