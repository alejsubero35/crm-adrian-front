import { useQuery } from '@tanstack/react-query';
import { planService, PlanDTO } from '@/services/plan.service';

export function usePlans() {
  return useQuery<PlanDTO[]>({
    queryKey: ['plans'],
    queryFn: () => planService.list(),
    staleTime: 60_000
  });
}
