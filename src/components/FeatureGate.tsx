import { ReactNode } from 'react';
import { useFeatures } from '@/hooks/useFeatures';

type Props = {
  required?: string | string[];
  fallback?: ReactNode;
  children: ReactNode;
};

export function FeatureGate({ required, fallback = null, children }: Props) {
  const { hasFeature } = useFeatures();

  const req = Array.isArray(required)
    ? required
    : required
    ? [required]
    : [];

  const allowed = req.length === 0 || req.every((k) => hasFeature(k));

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
import { ReactNode } from 'react';
import { useFeature } from '@/hooks/useFeature';

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  const hasFeature = useFeature(feature);

  if (hasFeature) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
