import { useQuery } from '@tanstack/react-query';
import { navigationService, NavigationResponse } from '@/services/navigation.service';

export function useNavigation() {
  return useQuery<NavigationResponse>({
    queryKey: ['navigation'],
    queryFn: () => navigationService.getNavigation(),
    staleTime: 60_000, // 1 min caching for navigation
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
