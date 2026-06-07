import React from 'react';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatMaintenanceShort } from '@/components/hvac/hvacEquipmentCardUtils';

type Props = {
  nextServiceAt?: string | null;
  /** Etiqueta corta para tarjetas compactas. */
  compactLabel?: boolean;
  className?: string;
};

function formatFullDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function badgeTone(nextServiceAt?: string | null): string {
  if (!nextServiceAt) {
    return 'border-muted-foreground/30 bg-muted text-muted-foreground';
  }

  const next = new Date(nextServiceAt).getTime();
  if (Number.isNaN(next)) {
    return 'border-muted-foreground/30 bg-muted text-muted-foreground';
  }

  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  if (next <= now) {
    return 'border-amber-400 bg-amber-100 text-amber-950';
  }
  if (next <= now + thirtyDaysMs) {
    return 'border-amber-300 bg-amber-50 text-amber-900';
  }

  return 'border-primary/50 bg-primary/10 text-primary';
}

export function NextServiceDateBadge({ nextServiceAt, compactLabel = false, className }: Props) {
  const dateLabel = nextServiceAt
    ? formatFullDate(nextServiceAt) ?? formatMaintenanceShort(nextServiceAt)
    : 'No definido';

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border-2 px-2.5 py-1 text-xs font-bold tabular-nums whitespace-nowrap',
        badgeTone(nextServiceAt),
        className
      )}
    >
      <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>{compactLabel ? 'Próx. Mtto' : 'Próximo servicio'}</span>
      <span className="font-extrabold">{dateLabel}</span>
    </Badge>
  );
}
