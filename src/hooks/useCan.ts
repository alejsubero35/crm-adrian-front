import { useAuth } from '@/contexts/useAuth';

export function useCan(permission: string): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}

export default useCan;
