import { useUserContext } from '@/hooks/useUserContext';
import { useBusinessTierContext } from '@/components/features/BusinessTierProvider';

export function useFeatures() {
  const { data } = useUserContext();
  const { enabledFeatures: tierFeatures = [] } = useBusinessTierContext() || {};
  const planFeatures: string[] = Array.isArray(data?.plan?.features) ? (data!.plan!.features as string[]) : [];
  const typeFeatures: string[] = Array.isArray(data?.business_type?.features) ? (data!.business_type!.features as string[]) : [];
  const all = Array.from(new Set([...(planFeatures || []), ...(typeFeatures || []), ...(tierFeatures || [])]));

  const hasFeature = (key: string) => all.includes(key);

  return { features: all, hasFeature };
}
