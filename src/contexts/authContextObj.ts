import { createContext } from 'react';

export function normalizeUserRoles(roles: User['roles'] | unknown): string[] {
  if (!roles) return [];
  if (typeof roles === 'string') return [roles];
  if (Array.isArray(roles)) {
    return roles
      .map((role) => {
        if (typeof role === 'string') return role;
        if (role && typeof role === 'object') {
          const entry = role as { slug?: string; name?: string };
          return entry.slug || entry.name || '';
        }
        return '';
      })
      .filter(Boolean);
  }
  return [];
}

export interface User {
  id: string | number;
  username?: string;
  email: string;
  name?: string;
  customer_name?: string;
  customer_id?: number | null;
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  roles?: string[];
  permissions?: string[];
  plan?: string;
  features?: Record<string, boolean> | string[]; // Features can be a list of strings or key-value pairs
  branch_id?: number | null; // Assigned branch for POS restriction
}

export interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;
