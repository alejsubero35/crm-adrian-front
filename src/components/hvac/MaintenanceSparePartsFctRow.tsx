import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { roundMoney } from '@/lib/moneyAmount';

type Props = {
  cost?: number | null;
  className?: string;
};

/** Muestra el monto descontado del Fondo de Cobertura Total (FCT) por repuestos. */
export function MaintenanceSparePartsFctRow({ cost, className }: Props) {
  const amount = roundMoney(Number(cost ?? 0));
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-2 rounded-md border border-primary/25 bg-primary/5 px-3 py-2',
        className
      )}
    >
      <span className="text-sm font-medium text-foreground">Costo repuesto (FCT):</span>
      <Badge
        variant="outline"
        className="rounded-md border-2 border-primary/40 bg-background px-3 py-1 text-sm font-bold text-primary tabular-nums"
      >
        {amount.toFixed(2)}$
      </Badge>
    </div>
  );
}
