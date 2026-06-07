import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { MaintenanceType } from '@/types/hvac';

const TYPE_STYLES: Record<string, string> = {
  preventivo: 'border-emerald-400 bg-emerald-100 text-emerald-900',
  correctivo: 'border-orange-400 bg-orange-100 text-orange-950',
};

export function maintenanceTypeBadgeClass(slug?: string | null, name?: string | null): string {
  const normalized = (slug ?? name ?? '').trim().toLowerCase();

  if (normalized.includes('prevent')) {
    return TYPE_STYLES.preventivo;
  }
  if (normalized.includes('correct')) {
    return TYPE_STYLES.correctivo;
  }

  return 'border-muted-foreground/30 bg-muted text-muted-foreground';
}

type Props = {
  maintenanceType?: MaintenanceType | null;
  className?: string;
};

export function MaintenanceTypeBadge({ maintenanceType, className }: Props) {
  if (!maintenanceType?.name) {
    return null;
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-full border px-2 py-0.5 text-[11px] font-semibold',
        maintenanceTypeBadgeClass(maintenanceType.slug, maintenanceType.name),
        className
      )}
    >
      {maintenanceType.name}
    </Badge>
  );
}
