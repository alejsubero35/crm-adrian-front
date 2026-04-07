import { useAuth } from '@/contexts/useAuth';

export function useFeature(featureName: string): boolean {
  const { user } = useAuth();

  if (!user || !user.features) {
    return false;
  }

  if (Array.isArray(user.features)) {
    return user.features.includes(featureName);
  }

  if (typeof user.features === 'object') {
    return !!(user.features as Record<string, boolean>)[featureName];
  }

  return false;
}
