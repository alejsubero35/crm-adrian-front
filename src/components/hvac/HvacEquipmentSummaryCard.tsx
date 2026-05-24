import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { ClientEquipmentSummary } from '@/types/hvac';
import { cn } from '@/lib/utils';
import { formatMaintenanceShort, splitInstallationLocation } from './hvacEquipmentCardUtils';

type Props = {
  item: ClientEquipmentSummary;
  isActive?: boolean;
  isScanned?: boolean;
  onSelect: () => void;
};

export function HvacEquipmentSummaryCard({ item, isActive = false, isScanned = false, onSelect }: Props) {
  const { primary, secondary } = splitInstallationLocation(item.installation_location);
  const fctRemaining = item.fct_remaining ?? 0;
  const protectionActive = item.protection_active ?? false;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full rounded-lg border-2 p-4 text-left transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        isActive && 'border-primary ring-2 ring-primary shadow-md',
        !isActive && 'border-border bg-card hover:border-primary/40',
        isScanned && !isActive && 'border-amber-400'
      )}
    >
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <p className="text-lg font-bold leading-tight truncate">{primary}</p>
        <p className="text-lg font-bold leading-tight text-right truncate">
          FCT: {fctRemaining.toFixed(0)} $
        </p>

        {secondary ? (
          <p className="text-lg font-bold leading-tight truncate">{secondary}</p>
        ) : (
          <span aria-hidden />
        )}
        <p className="text-sm font-semibold text-right self-center">Proteccion</p>

        <p className="text-base font-bold leading-tight truncate">
          {item.brand} {item.capacity}
        </p>
        <div className="flex justify-end items-center">
          <Badge
            variant="outline"
            className={cn(
              'rounded px-3 py-0.5 text-sm font-bold border-0',
              protectionActive ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
            )}
          >
            {protectionActive ? 'Activa' : 'Inactiva'}
          </Badge>
        </div>

        <p className="col-span-2 text-sm font-bold mt-2">
          Proximo Mtto {formatMaintenanceShort(item.next_service_at)}
        </p>
      </div>
      {isScanned ? (
        <p className="mt-2 text-[11px] font-medium text-amber-700">QR escaneado</p>
      ) : null}
    </button>
  );
}
