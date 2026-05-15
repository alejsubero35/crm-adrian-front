import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Snowflake, Wrench, ShieldCheck, Calendar, QrCode } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/loading-spinner';
import { useDemoAuth } from '@/features/auth/DemoAuthContext';
import { hvacService } from '@/services/hvac.service';
import { HvacEquipmentSummaryCard } from '@/components/hvac/HvacEquipmentSummaryCard';
import { formatMaintenanceShort } from '@/components/hvac/hvacEquipmentCardUtils';

export default function ClientDashboardPage() {
  const navigate = useNavigate();
  const { user } = useDemoAuth();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['client-dashboard'],
    queryFn: () => hvacService.getClientDashboard(),
  });

  const stats = data?.stats;

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Snowflake className="h-6 w-6 text-primary" />
            Mis equipos
          </h1>
          <p className="text-sm text-muted-foreground">
            Hola, {data?.customer?.name ?? user?.name}. Resumen de tus equipos vinculados.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
          {isFetching ? 'Actualizando…' : 'Actualizar'}
        </Button>
      </div>

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
              <p className="text-3xl font-bold">{stats?.equipments_count ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" /> Protección activa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.protection_active_count ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Próx. mantenimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.maintenance_due_count ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inversión mensual</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${(stats?.monthly_investment ?? 0).toFixed(0)}</p>
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
          {!isLoading && (data?.equipments?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">No tienes equipos vinculados aún.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {(data?.equipments ?? []).map((item) => (
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
