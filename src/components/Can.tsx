import React from 'react';
import useCan from '@/hooks/useCan';

type CanProps = {
  check: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function Can({ check, children, fallback = null }: CanProps) {
  const allowed = useCan(check);
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}

export default Can;
