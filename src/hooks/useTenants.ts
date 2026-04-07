import { useQuery } from '@tanstack/react-query';
import { tenantService, TenantDTO, Paginated } from '@/services/tenant.service';

export function useTenants(
  q: string,
  page: number,
  perPage: number = 10,
  plan?: string,
  status?: 'activo' | 'bloqueado' | 'active' | 'blocked'
) {
  return useQuery<Paginated<TenantDTO>>({
    queryKey: ['tenants', q, page, perPage, plan ?? '', status ?? ''],
    queryFn: () => tenantService.list({ q, page, perPage, plan, status }),
    keepPreviousData: true,
    staleTime: 30_000
  });
}
