import { useQuery } from '@tanstack/react-query';
import { businessTypeService, BusinessTypeDTO } from '@/services/business-type.service';

export function useBusinessTypes() {
  return useQuery<BusinessTypeDTO[]>({
    queryKey: ['business-types'],
    queryFn: () => businessTypeService.list(),
    staleTime: 60_000
  });
}
