import { createContext } from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  roles?: string; // Role slug (e.g. 'super-admin', 'admin', 'cashier')
  plan?: string;
  features?: Record<string, boolean> | string[]; // Features can be a list of strings or key-value pairs
  branch_id?: number | null; // Assigned branch for POS restriction
}

export interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;
