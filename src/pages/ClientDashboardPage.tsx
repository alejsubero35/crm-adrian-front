import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Snowflake, Wrench, ShieldCheck, Calendar, QrCode } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/loading-spinner';
import { useDemoAuth } from '@/features/auth/DemoAuthContext';
import { hvacService } from '@/services/hvac.service';
import { HvacEquipmentSummaryCard } from '@/components/hvac/HvacEquipmentSummaryCard';
import { formatMaintenanceShort, resolveClientDisplayName } from '@/components/hvac/hvacEquipmentCardUtils';
import type { ClientEquipmentSummary } from '@/types/hvac';

function deriveDashboardStats(equipments: ClientEquipmentSummary[]) {
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  const maintenanceDueCount = equipments.filter((eq) => {
    if (eq.current_status === 'maintenance_due') return true;
    if (!eq.next_service_at) return false;
    const next = new Date(eq.next_service_at).getTime();
    return !Number.isNaN(next) && next - now <= thirtyDaysMs;
  }).length;

  const monthlyFromPlans = equipments.reduce(
    (sum, eq) => sum + (eq.monthly_amount ?? 0),
    0
  );

  return {
    equipments_count: equipments.length,
    protection_active_count: equipments.filter((eq) => eq.protection_active).length,
    maintenance_due_count: maintenanceDueCount,
    monthly_investment: monthlyFromPlans,
  };
}

export default function ClientDashboardPage() {
  const navigate = useNavigate();
  const { user } = useDemoAuth();

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['client-dashboard'],
    queryFn: () => hvacService.getClientDashboard(),
    retry: 1,
  });

  const equipments = data?.equipments ?? [];
  const derived = useMemo(() => deriveDashboardStats(equipments), [equipments]);

  const displayName = resolveClientDisplayName(data?.customer, user);
  const stats = data?.stats ?? (equipments.length > 0 ? derived : null);

  const equipmentsCount = stats?.equipments_count ?? equipments.length;
  const protectionCount = stats?.protection_active_count ?? derived.protection_active_count;
  const maintenanceDueCount = stats?.maintenance_due_count ?? derived.maintenance_due_count;
  const monthlyInvestment = stats?.monthly_investment ?? derived.monthly_investment;

  const errorMessage =
    error instanceof Error ? error.message : 'No se pudo cargar tu información.';

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Snowflake className="h-6 w-6 text-primary shrink-0" />
            Mis equipos
          </h1>
          <p className="text-sm text-muted-foreground">
            {displayName ? (
              <>
                Hola, <span className="font-semibold text-foreground">{displayName}</span>. Resumen de tus
                equipos vinculados.
              </>
            ) : (
              'Resumen de tus equipos vinculados.'
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
          {isFetching ? 'Actualizando…' : 'Actualizar'}
        </Button>
      </div>

      {isError ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-4 space-y-3">
            <p className="text-sm text-destructive">{errorMessage}</p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Equipos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{equipmentsCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" /> Protección activa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{protectionCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Próx. mantenimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{maintenanceDueCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inversión mensual</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${monthlyInvestment.toFixed(0)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle>Tus equipos</CardTitle>
            <CardDescription>Toca un equipo para ver detalle e historial (escanea su QR).</CardDescription>
          </div>
          <Button size="sm" onClick={() => navigate('/scan')}>
            <QrCode className="h-4 w-4 mr-1" />
            Escanear QR
          </Button>
        </CardHeader>
        <CardContent>
          {!isLoading && equipments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tienes equipos vinculados aún.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {equipments.map((item) => (
                <HvacEquipmentSummaryCard
                  key={item.id}
                  item={item}
                  onSelect={() => {
                    if (item.qr_uuid) navigate(`/scan/${item.qr_uuid}`);
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Últimos servicios
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (data?.recent_maintenance?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Sin servicios registrados.</p>
          ) : (
            <div className="space-y-3">
              {data?.recent_maintenance?.map((log, index) => (
                <div key={`${log.created_at}-${index}`} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">{log.service_type}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.equipment_label} · {formatMaintenanceShort(log.created_at)}
                  </p>
                  {log.technician_name ? (
                    <p className="text-xs text-muted-foreground">Técnico: {log.technician_name}</p>
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
