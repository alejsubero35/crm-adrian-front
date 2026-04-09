/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import useAuth from '@/contexts/useAuth';
import type { User as BaseUser } from '@/contexts/authContextObj';

export interface User extends Omit<BaseUser, 'roles'> {
  avatar?: string;
  roles?: string | string[] | { name?: string; slug?: string }[];
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

function DemoAuthAdapterProvider({ children }: { children: ReactNode }) {
  const { user, isLoading, login: realLogin, logout: realLogout } = useAuth();

  const login = async (username: string, password: string): Promise<void> => {
    const ok = await realLogin(username, password);
    if (!ok) {
      throw new Error('Credenciales inválidas');
    }
  };

  const logout = async (): Promise<void> => {
    await realLogout();
  };

  const register = async (): Promise<void> => {
    throw new Error('Registro no habilitado en este entorno');
  };

  const hasRole = (role: string): boolean => {
    const roles = (user as User | null)?.roles;
    if (!roles) return false;

    if (typeof roles === 'string') {
      return roles === role;
    }

    if (Array.isArray(roles)) {
      return roles.some((r) => {
        if (typeof r === 'string') return r === role;
        return r?.slug === role || r?.name === role;
      });
    }

    return false;
  };

  const refreshUser = async (): Promise<void> => {
    return Promise.resolve();
  };

  const toggleDemoMode = (): void => {
    // Intentionally disabled: demo mode removed.
  };

  const value: DemoAuthContextType = {
    user: (user as User | null) ?? null,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    hasRole,
    refreshUser,
    isDemoMode: false,
    toggleDemoMode,
  };

  return <DemoAuthContext.Provider value={value}>{children}</DemoAuthContext.Provider>;
}

interface DemoAuthProviderProps {
  children: ReactNode;
}

export function DemoAuthProvider({ children }: DemoAuthProviderProps) {
  return (
    <AuthProvider>
      <DemoAuthAdapterProvider>{children}</DemoAuthAdapterProvider>
    </AuthProvider>
  );
}

export function useDemoAuth(): DemoAuthContextType {
  const context = useContext(DemoAuthContext);
  if (context === undefined) {
    throw new Error('useDemoAuth must be used within a DemoAuthProvider');
  }
  return context;
}
