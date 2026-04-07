import { useQuery } from '@tanstack/react-query';
import { userService, UserContextResponse } from '@/services/user.service';
import { useAuth } from '@/contexts/useAuth';

export function useUserContext() {
  const { user } = useAuth();
  const userId = (() => {
    const direct = (user as unknown as { id?: string | number } | null)?.id;
    if (direct !== undefined && direct !== null && direct !== "") return direct;
    const nested = (user as unknown as { data?: { id?: string | number } } | null)?.data?.id;
    if (nested !== undefined && nested !== null && nested !== "") return nested;
    return null;
  })();

  return useQuery<UserContextResponse>({
    queryKey: ['user', 'context', userId ?? 'anonymous'],
    queryFn: () => userService.getContext(),
    enabled: !!userId,
    staleTime: 5 * 60_000, // 5 min
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}
