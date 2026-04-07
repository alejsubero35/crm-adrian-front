import { useQuery } from '@tanstack/react-query';
import { featureCatalogService, FeatureCatalogItem } from '@/services/feature-catalog.service';

export function useFeatureCatalog() {
  return useQuery<FeatureCatalogItem[]>({
    queryKey: ['feature-catalog'],
    queryFn: () => featureCatalogService.list(),
    staleTime: 60_000,
  });
}
