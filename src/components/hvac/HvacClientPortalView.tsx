import React, { useCallback, useEffect, useState } from 'react';
import { Snowflake, MapPin, Calendar, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { hvacService } from '@/services/hvac.service';
import type { ClientEquipmentSummary, ClientPortalResponse, EquipmentDetails } from '@/types/hvac';
import { cn } from '@/lib/utils';
import { listHvacDiagnosticMeasurements } from '@/utils/hvacDiagnosticFields';

const statusLabels: Record<string, string> = {
  operational: 'Operativo',
  maintenance_due: 'Mantenimiento pendiente',
  in_repair: 'En reparación',
  out_of_service: 'Fuera de servicio',
};

const statusStyle: Record<string, string> = {
  operational: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  maintenance_due: 'bg-amber-100 text-amber-800 border-amber-200',
  in_repair: 'bg-red-100 text-red-800 border-red-200',
  out_of_service: 'bg-slate-100 text-slate-800 border-slate-200',
};

type Props = {
  scannedQrUuid: string;
};

function formatDate(value?: string | null) {
  if (!value) return 'No definido';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No definido';
  return date.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatMaintenanceShort(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

function splitInstallationLocation(location?: string | null) {
  const trimmed = location?.trim();
  if (!trimmed) {
    return { primary: 'Sin ubicación', secondary: '' };
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { primary: parts[0], secondary: '' };
  }
  return { primary: parts[0], secondary: parts.slice(1).join(' ') };
}

function formatDateTime(value?: string | null) {
  if (!value) return 'No definido';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No definido';
  return date.toLocaleString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function EquipmentCard({
  item,
  isActive,
  isScanned,
  onSelect,
}: {
  item: ClientEquipmentSummary;
  isActive: boolean;
  isScanned: boolean;
  onSelect: () => void;
}) {
  const { primary, secondary } = splitInstallationLocation(item.installation_location);
  const monthlyAmount = item.monthly_amount ?? 0;
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
          FCT: {monthlyAmount.toFixed(0)} $
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

function EquipmentDetailPanel({ detail }: { detail: EquipmentDetails }) {
  const eq = detail.equipment;
  const logs = detail.maintenance_logs ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-lg">Datos de vinculación</CardTitle>
            <Badge className={statusStyle[eq.current_status] ?? ''}>
              {statusLabels[eq.current_status] ?? eq.current_status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <p>
            <span className="font-medium text-muted-foreground">Marca / modelo</span>
            <br />
            {eq.brand} {eq.model}
          </p>
          <p>
            <span className="font-medium text-muted-foreground">Serial</span>
            <br />
            {eq.serial_number}
          </p>
          <p>
            <span className="font-medium text-muted-foreground">Tipo</span>
            <br />
            {eq.type}
          </p>
          <p>
            <span className="font-medium text-muted-foreground">Capacidad</span>
            <br />
            {eq.capacity}
          </p>
          <p>
            <span className="font-medium text-muted-foreground">Refrigerante</span>
            <br />
            {eq.refrigerant_type}
          </p>
          <p>
            <span className="font-medium text-muted-foreground">Plan</span>
            <br />
            {detail.plan?.name ?? '—'}
          </p>
          <p>
            <span className="font-medium text-muted-foreground">Ubicación</span>
            <br />
            {eq.installation_location || '—'}
          </p>
          <p className="flex items-start gap-1.5 sm:col-span-2">
            <Calendar className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
            <span>
              <span className="font-medium text-muted-foreground">Próximo servicio: </span>
              {formatDate(eq.next_service_at)}
            </span>
          </p>
          {detail.customer?.address ? (
            <p className="flex items-start gap-1.5 sm:col-span-2">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
              <span>{detail.customer.address}</span>
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Historial de servicios
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay servicios registrados.</p>
          ) : (
            <div className="space-y-3 max-h-[50vh] overflow-auto pr-1">
              {logs.map((log, index) => (
                <div
                  key={`${log.created_at ?? index}-${log.service_type}`}
                  className="rounded-lg border p-3 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{log.service_type}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(log.created_at)}</p>
                  </div>
                  {log.technician?.name ? (
                    <p className="text-xs text-muted-foreground">Técnico: {log.technician.name}</p>
                  ) : null}
                  {log.description ? <p className="text-sm">{log.description}</p> : null}
                  {log.diagnostic ? (
                    <ul className="text-xs text-muted-foreground space-y-0.5 border-t pt-2 mt-1">
                      {listHvacDiagnosticMeasurements(log.diagnostic)
                        .filter((e) => e.value !== '—')
                        .slice(0, 6)
                        .map((e) => (
                          <li key={e.key}>
                            <span className="font-medium text-foreground">{e.label}:</span> {e.value}
                          </li>
                        ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function HvacClientPortalView({ scannedQrUuid }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [portal, setPortal] = useState<ClientPortalResponse | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const loadPortal = useCallback(
    async (equipmentId?: number | null) => {
      try {
        setLoading(true);
        const data = await hvacService.getClientPortal({
          scanned_qr_uuid: scannedQrUuid,
          equipment_id: equipmentId ?? undefined,
        });
        setPortal(data);
        setSelectedId(data.active_equipment_id ?? null);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'No se pudo cargar sus equipos',
          description: error instanceof Error ? error.message : 'Intenta nuevamente.',
        });
      } finally {
        setLoading(false);
      }
    },
    [scannedQrUuid, toast]
  );

  useEffect(() => {
    void loadPortal();
  }, [loadPortal]);

  const handleSelectEquipment = (id: number) => {
    setSelectedId(id);
    void loadPortal(id);
  };

  if (loading && !portal) {
    return (
      <Card>
        <CardContent className="p-6 space-y-3">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!portal) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">No se pudo cargar la información.</p>
          <Button className="mt-3" variant="outline" onClick={() => void loadPortal()}>
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const scannedEquipment = portal.equipments.find((e) => e.qr_uuid === scannedQrUuid);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Snowflake className="h-5 w-5 text-primary" />
          Mis equipos
        </h2>
        <p className="text-sm text-muted-foreground">
          Hola, {portal.customer.name}. {scannedEquipment ? 'Equipo detectado por QR resaltado.' : 'Selecciona un equipo.'}
        </p>
      </div>

      {portal.equipments.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No tiene equipos vinculados a su cuenta.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {portal.equipments.map((item) => (
              <EquipmentCard
                key={item.id}
                item={item}
                isActive={selectedId === item.id}
                isScanned={item.qr_uuid === scannedQrUuid}
                onSelect={() => handleSelectEquipment(item.id)}
              />
            ))}
          </div>

          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : portal.selected ? (
            <EquipmentDetailPanel detail={portal.selected} />
          ) : null}
        </>
      )}
    </div>
  );
}
