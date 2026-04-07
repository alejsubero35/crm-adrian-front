import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface User {
  id: string | number;
  name: string;
  email: string;
  avatar?: string;
  roles?: string[] | { name: string; slug: string }[];
}

interface DemoAuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  hasRole: (role: string) => boolean;
  refreshUser: () => Promise<void>;
  isDemoMode: boolean;
  toggleDemoMode: () => void;
}

const DemoAuthContext = createContext<DemoAuthContextType | undefined>(undefined);

interface DemoAuthProviderProps {
  children: ReactNode;
}

export function DemoAuthProvider({ children }: DemoAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(true); // Por defecto en modo demo

  const isAuthenticated = !!user;

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('demo_auth_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));

      // Usuarios demo
      const demoUsers: User[] = [
        {
          id: 1,
          name: 'Administrador Demo',
          email: 'admin@demo.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
          roles: ['admin', 'user']
        },
        {
          id: 2,
          name: 'Usuario Demo',
          email: 'user@demo.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
          roles: ['user']
        },
        {
          id: 3,
          name: 'Manager Demo',
          email: 'manager@demo.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager',
          roles: ['manager', 'user']
        }
      ];

      // Seleccionar usuario basado en el username
      let selectedUser = demoUsers[0]; // Default admin

      if (username.includes('admin')) {
        selectedUser = demoUsers[0];
      } else if (username.includes('user')) {
        selectedUser = demoUsers[1];
      } else if (username.includes('manager')) {
        selectedUser = demoUsers[2];
      }

      // Almacenar usuario
      console.log('Usuario seleccionado:', selectedUser);
      setUser(selectedUser);
      localStorage.setItem('demo_auth_user', JSON.stringify(selectedUser));
      console.log('Usuario almacenado, autenticación actualizada');

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Limpiar datos
      setUser(null);
      localStorage.removeItem('demo_auth_user');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user data even if API call fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => {
    setIsLoading(true);
    try {
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 500));

      if (password !== passwordConfirmation) {
        throw new Error('Las contraseñas no coinciden');
      }

      const newUser: User = {
        id: Date.now(),
        name,
        email,
        roles: ['user']
      };

      setUser(newUser);
      localStorage.setItem('demo_auth_user', JSON.stringify(newUser));

    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (role: string): boolean => {
    if (!user?.roles) return false;

    const roles = Array.isArray(user.roles) 
      ? user.roles 
      : [user.roles];

    return roles.some(r => 
      typeof r === 'string' ? r === role : r.slug === role || r.name === role
    );
  };

  const refreshUser = async (): Promise<void> => {
    // En modo demo, simplemente mantener el usuario actual
    if (user) {
      localStorage.setItem('demo_auth_user', JSON.stringify(user));
    }
  };

  const toggleDemoMode = () => {
    setIsDemoMode(!isDemoMode);
  };

  const value: DemoAuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
    hasRole,
    refreshUser,
    isDemoMode,
    toggleDemoMode,
  };

  return <DemoAuthContext.Provider value={value}>{children}</DemoAuthContext.Provider>;
}

export function useDemoAuth(): DemoAuthContextType {
  const context = useContext(DemoAuthContext);
  if (context === undefined) {
    throw new Error('useDemoAuth must be used within a DemoAuthProvider');
  }
  return context;
}
