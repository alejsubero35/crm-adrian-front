import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, useFormState, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CircuitBoard, Thermometer, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ValidatedInput } from '@/components/ui/ValidatedInput';
import { ValidatedSelect } from '@/components/ui/ValidatedSelect';
import { ValidatedTextarea } from '@/components/ui/ValidatedTextarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useDemoAuth } from '@/features/auth/DemoAuthContext';
import { hvacService } from '@/services/hvac.service';
import { hvacMaintenanceRegisterSchema, type HvacMaintenanceRegisterFormData } from '@/validations/hvac.schema';
import type { EquipmentDetails } from '@/types/hvac';
import {
  HVAC_COMPARE_PAIR_CAPACITORS,
  HVAC_COMPARE_PAIR_ELECTRICAL,
  HVAC_COMPARE_PAIR_SENSORS,
  HVAC_COMPARE_PAIRS,
  HVAC_CRITICAL_OVER_KEYS,
  emptyHvacMaintenanceFieldDefaults,
  equipmentHasAnyPlateFieldLockedForTechnician,
  isEquipmentPlateFieldReadOnly,
} from '@/utils/hvacDiagnosticFields';
import { HvacServiceDiagnosticAccordion } from '@/components/hvac/HvacServiceDiagnosticSections';
import {
  buildDiagnosticPayload,
  buildPlatePayload,
  filterPlatePayloadForRole,
  isOverNominalOutOfTolerance,
} from '@/utils/hvacDiagnosticCompare';
import { cn } from '@/lib/utils';
import { getApiErrorMessage, getApiFieldErrors } from '@/lib/apiErrors';
import { waitForDomSettled } from '@/lib/domTiming';
import { exceedsFctAvailable, formatMoneyUsd, parseMoneyAmount } from '@/lib/moneyAmount';
import { PlateMeasuredPairRow } from '@/components/hvac/PlateMeasuredPairRow';

function isEquipmentDetails(scan: unknown): scan is EquipmentDetails {
  return Boolean(scan) && typeof scan === 'object' && 'equipment' in (scan as object);
}

export default function HvacMaintenanceRegisterPage() {
  const { uuid = '' } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasRole, hasPermission } = useDemoAuth();

  const canCreateMaintenance =
    hasRole('admin') || hasRole('tecnico') || hasRole('técnico') || hasPermission('maintenance.create');
  const isAdmin = hasRole('admin');
  const defaults = useMemo(() => emptyHvacMaintenanceFieldDefaults(), []);

  const form = useForm<HvacMaintenanceRegisterFormData>({
    resolver: zodResolver(hvacMaintenanceRegisterSchema),
    defaultValues: defaults as unknown as HvacMaintenanceRegisterFormData,
  });

  const { isDirty } = useFormState({ control: form.control });
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveTo, setLeaveTo] = useState<string | null>(null);

  const requestLeave = useCallback(
    (to: string) => {
      if (isDirty) {
        setLeaveTo(to);
        setLeaveOpen(true);
      } else {
        navigate(to);
      }
    },
    [isDirty, navigate]
  );

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const { data: scan, isLoading, isError } = useQuery({
    queryKey: ['hvac-scan', uuid],
    queryFn: () => hvacService.scanQr(uuid),
    enabled: Boolean(uuid),
  });

  const { data: maintenanceTypes = [] } = useQuery({
    queryKey: ['maintenance-types'],
    queryFn: () => hvacService.getMaintenanceTypes(),
    enabled: canCreateMaintenance,
  });

  const maintenanceTypeOptions = useMemo(
    () => maintenanceTypes.map((type) => ({ value: String(type.id), label: type.name })),
    [maintenanceTypes]
  );

  const equipmentKey = useMemo(() => {
    if (!isEquipmentDetails(scan)) return null;
    return `${scan.qr_uuid}:${scan.equipment?.id ?? ''}`;
  }, [scan]);

  useEffect(() => {
    if (!equipmentKey || !isEquipmentDetails(scan)) return;
    const eq = scan.equipment as Record<string, unknown>;
    const next: Record<string, string> = { ...emptyHvacMaintenanceFieldDefaults() };
    next.maintenance_type_id = '';
    next.service_type = '';
    next.description = '';
    for (const k of Object.keys(next)) {
      if (k.startsWith('plate_')) {
        const v = eq[k];
        next[k] = v != null && v !== '' ? String(v) : '';
      }
    }
    form.reset(next as unknown as HvacMaintenanceRegisterFormData);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al cargar equipo / QR
  }, [equipmentKey]);

  const equipmentRecord = useMemo(() => {
    if (!isEquipmentDetails(scan)) return null;
    return scan.equipment as Record<string, unknown>;
  }, [scan]);

  const showPlatePartialLockHint = useMemo(
    () => equipmentHasAnyPlateFieldLockedForTechnician(equipmentRecord, isAdmin),
    [equipmentRecord, isAdmin]
  );

  const fctAvailable = isEquipmentDetails(scan) ? (scan.fct_remaining ?? 0) : null;

  const maintenanceTypeId = useWatch({ control: form.control, name: 'maintenance_type_id' }) ?? '';
  const serviceType = useWatch({ control: form.control, name: 'service_type' }) ?? '';
  const allFieldValues = useWatch({ control: form.control }) as Record<string, unknown> | undefined;

  const canSubmit =
    typeof maintenanceTypeId === 'string' &&
    maintenanceTypeId.trim().length > 0 &&
    typeof serviceType === 'string' &&
    serviceType.trim().length > 0 &&
    !form.formState.isSubmitting;

  const tabProgress = useMemo(() => {
    const v = allFieldValues ?? {};
    const sectionTouched = (pairs: typeof HVAC_COMPARE_PAIR_ELECTRICAL) =>
      pairs.some(
        (p) =>
          String(v[p.measured] ?? '').trim() !== '' ||
          String(v[p.plate] ?? '').trim() !== ''
      );
    return {
      electrical: sectionTouched(HVAC_COMPARE_PAIR_ELECTRICAL),
      capacitors: sectionTouched(HVAC_COMPARE_PAIR_CAPACITORS),
      sensors: sectionTouched(HVAC_COMPARE_PAIR_SENSORS),
    };
  }, [allFieldValues]);

  const [activeTab, setActiveTab] = useState('electrical');

  const onSubmit = async (values: HvacMaintenanceRegisterFormData) => {
    const warnings: string[] = [];
    for (const pair of HVAC_COMPARE_PAIRS) {
      if (!HVAC_CRITICAL_OVER_KEYS.has(pair.measured)) continue;
      const p = values[pair.plate];
      const m = values[pair.measured];
      if (isOverNominalOutOfTolerance(p, m)) {
        warnings.push(`${pair.label}: valor medido por encima de placa y fuera de ±10%.`);
      }
    }
    if (warnings.length > 0) {
      toast({
        variant: 'warning',
        title: 'Revisar mediciones críticas',
        description: warnings.join(' '),
      });
    }

    const platePayload = buildPlatePayload(values as unknown as Record<string, unknown>);
    const plateToSend = filterPlatePayloadForRole(platePayload, equipmentRecord, isAdmin);
    const diagnosticPayload = buildDiagnosticPayload(values as unknown as Record<string, unknown>);

    try {
      const sparePartsCost = parseMoneyAmount(values.spare_parts_cost);

      if (
        sparePartsCost != null &&
        fctAvailable != null &&
        exceedsFctAvailable(sparePartsCost, fctAvailable)
      ) {
        const message = `El monto (${formatMoneyUsd(sparePartsCost)} USD) supera el FCT disponible (${formatMoneyUsd(fctAvailable)} USD).`;
        form.setError('spare_parts_cost', { message });
        toast({
          variant: 'destructive',
          title: 'FCT insuficiente',
          description: message,
        });
        return;
      }

      await hvacService.createMaintenanceLog({
        equipment_qr_uuid: uuid,
        maintenance_type_id: Number(values.maintenance_type_id),
        service_type: values.service_type,
        description: values.description || undefined,
        spare_parts_cost: sparePartsCost,
        plate: Object.keys(plateToSend).length > 0 ? plateToSend : undefined,
        diagnostic: diagnosticPayload,
      });
      toast({ variant: 'success', title: 'Servicio registrado', description: 'Historial y diagnóstico guardados.' });
      await queryClient.invalidateQueries({ queryKey: ['hvac-scan', uuid] });
      await queryClient.invalidateQueries({ queryKey: ['client-dashboard'] });
      form.reset(emptyHvacMaintenanceFieldDefaults() as unknown as HvacMaintenanceRegisterFormData);
      setLeaveOpen(false);
      setLeaveTo(null);
      await waitForDomSettled();
      navigate(`/scan/${uuid}`, { replace: true });
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error);
      if (fieldErrors?.spare_parts_cost) {
        form.setError('spare_parts_cost', { message: fieldErrors.spare_parts_cost });
      }
      toast({
        variant: 'destructive',
        title: 'No se pudo registrar',
        description: getApiErrorMessage(error, 'Intenta nuevamente.'),
      });
    }
  };

  if (!uuid) {
    return <Navigate to="/scan" replace />;
  }

  if (!canCreateMaintenance) {
    return <Navigate to={`/scan/${uuid}`} replace />;
  }

  if (isError) {
    return (
      <div className="space-y-4 p-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/scan/${uuid}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <p className="text-sm text-destructive">No se pudo cargar el equipo.</p>
      </div>
    );
  }

  if (!isLoading && scan && typeof scan === 'object' && 'status' in scan && scan.status === 'available') {
    return <Navigate to={`/scan/${uuid}`} replace />;
  }

  return (
    <div className="space-y-4 pb-36 md:pb-6">
      <AlertDialog
        open={leaveOpen}
        onOpenChange={(open) => {
          setLeaveOpen(open);
          if (!open) setLeaveTo(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Salir sin guardar?</AlertDialogTitle>
            <AlertDialogDescription>
              Hay mediciones o datos sin guardar. Si sales ahora, se perderán los cambios no enviados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setLeaveTo(null);
              }}
            >
              Seguir editando
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const to = leaveTo ?? `/scan/${uuid}`;
                setLeaveOpen(false);
                setLeaveTo(null);
                navigate(to);
              }}
            >
              Salir sin guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2 h-auto w-fit justify-start px-2 py-1"
            onClick={() => requestLeave(`/scan/${uuid}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al equipo
          </Button>
          <h1 className="text-2xl font-bold">Registrar servicio</h1>
          <p className="text-sm text-muted-foreground">UUID: {uuid}</p>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ) : (
        <form id="hvac-maint-register-form" className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Datos del servicio</CardTitle>
              <CardDescription>Tipo de intervención y descripción administrativa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEquipmentDetails(scan) && (scan.fct_remaining != null || scan.fondo_de_cobertura != null) ? (
                <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">Fondo de cobertura disponible (FCT)</p>
                  <p className="text-lg font-bold text-primary tabular-nums">
                    ${(scan.fct_remaining ?? 0).toFixed(2)}
                  </p>
                </div>
              ) : null}
              <ValidatedSelect
                label="Tipo de mantenimiento"
                name="maintenance_type_id"
                control={form.control}
                required
                placeholder="Selecciona correctivo o preventivo"
                options={maintenanceTypeOptions}
              />
              <p className="text-xs text-muted-foreground -mt-2">
                Preventivo reprograma la próxima visita según la frecuencia del plan. Correctivo no modifica las fechas
                del equipo.
              </p>
              <ValidatedInput label="Tipo de servicio" name="service_type" control={form.control} required />
              <ValidatedTextarea label="Descripcion" name="description" control={form.control} rows={3} />
              <ValidatedInput
                label="Repuestos descontados del FCT (USD)"
                name="spare_parts_cost"
                control={form.control}
                type="number"
                step="0.01"
                min="0"
                max={fctAvailable != null && fctAvailable > 0 ? fctAvailable : undefined}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground -mt-2">
                Monto a descontar del Fondo de Cobertura Total del cliente cuando se usan piezas en la reparación.
                {fctAvailable != null && fctAvailable > 0
                  ? ` Máximo disponible: ${formatMoneyUsd(fctAvailable)} USD.`
                  : fctAvailable === 0
                    ? ' No hay saldo FCT disponible para descontar.'
                    : null}
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border bg-card shadow-sm">
            <CardHeader className="space-y-1 pb-2">
              <CardTitle className="text-base md:text-lg">Diagnóstico del servicio</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Refrigeración, flujo, mecánica y datos de referencia del equipo. Cada bloque se expande al tocarlo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <HvacServiceDiagnosticAccordion
                control={form.control}
                equipment={equipmentRecord}
                isAdmin={isAdmin}
              />
            </CardContent>
          </Card>

          <Card className="overflow-hidden border bg-card shadow-sm">
            <CardHeader className="space-y-1 pb-2 md:pb-4">
              <CardTitle className="text-base md:text-lg">Diagnóstico eléctrico</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Una sola acción al final envía las tres pestañas. El punto verde en cada pestaña indica que ya hay datos
                en ese bloque (puedes dejar bloques vacíos si no aplican).
                {showPlatePartialLockHint ? (
                  <span className="mt-1 block font-medium text-foreground">
                    Los campos de placa que ya están en el equipo no se pueden cambiar; los vacíos sí puedes
                    completarlos. Las mediciones siempre se registran en cada servicio.
                  </span>
                ) : null}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-xl bg-muted/80 p-1.5 md:gap-2 md:p-2">
                  <TabsTrigger
                    value="electrical"
                    className="relative flex min-h-[4.25rem] flex-1 flex-col items-center justify-center gap-1 whitespace-normal rounded-lg px-1 py-2 text-[11px] font-semibold leading-tight text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:text-xs md:min-h-11 md:flex-row md:gap-2 md:px-4 md:py-3 md:text-sm"
                  >
                    {tabProgress.electrical ? (
                      <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background md:right-2 md:top-2" title="Hay datos en este bloque" />
                    ) : null}
                    <Zap className="h-5 w-5 shrink-0 md:h-4 md:w-4" aria-hidden />
                    <span>Eléctrico</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="capacitors"
                    className="relative flex min-h-[4.25rem] flex-1 flex-col items-center justify-center gap-1 whitespace-normal rounded-lg px-1 py-2 text-[11px] font-semibold leading-tight text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:text-xs md:min-h-11 md:flex-row md:gap-2 md:px-4 md:py-3 md:text-sm"
                  >
                    {tabProgress.capacitors ? (
                      <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background md:right-2 md:top-2" title="Hay datos en este bloque" />
                    ) : null}
                    <CircuitBoard className="h-5 w-5 shrink-0 md:h-4 md:w-4" aria-hidden />
                    <span>Capacit.</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="sensors"
                    className="relative flex min-h-[4.25rem] flex-1 flex-col items-center justify-center gap-1 whitespace-normal rounded-lg px-1 py-2 text-[11px] font-semibold leading-tight text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:text-xs md:min-h-11 md:flex-row md:gap-2 md:px-4 md:py-3 md:text-sm"
                  >
                    {tabProgress.sensors ? (
                      <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background md:right-2 md:top-2" title="Hay datos en este bloque" />
                    ) : null}
                    <Thermometer className="h-5 w-5 shrink-0 md:h-4 md:w-4" aria-hidden />
                    <span>Sensores</span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="electrical" className="mt-4 space-y-4 outline-none md:mt-6">
                  {HVAC_COMPARE_PAIR_ELECTRICAL.map((pair) => (
                    <PlateMeasuredPairRow
                      key={pair.measured}
                      control={form.control}
                      plateKey={pair.plate}
                      measuredKey={pair.measured}
                      label={pair.label}
                      plateFieldReadOnly={isEquipmentPlateFieldReadOnly(equipmentRecord, pair.plate, isAdmin)}
                    />
                  ))}
                </TabsContent>
                <TabsContent value="capacitors" className="mt-4 space-y-4 outline-none md:mt-6">
                  {HVAC_COMPARE_PAIR_CAPACITORS.map((pair) => (
                    <PlateMeasuredPairRow
                      key={pair.measured}
                      control={form.control}
                      plateKey={pair.plate}
                      measuredKey={pair.measured}
                      label={pair.label}
                      plateFieldReadOnly={isEquipmentPlateFieldReadOnly(equipmentRecord, pair.plate, isAdmin)}
                    />
                  ))}
                </TabsContent>
                <TabsContent value="sensors" className="mt-4 space-y-4 outline-none md:mt-6">
                  {HVAC_COMPARE_PAIR_SENSORS.map((pair) => (
                    <PlateMeasuredPairRow
                      key={pair.measured}
                      control={form.control}
                      plateKey={pair.plate}
                      measuredKey={pair.measured}
                      label={pair.label}
                      plateFieldReadOnly={isEquipmentPlateFieldReadOnly(equipmentRecord, pair.plate, isAdmin)}
                    />
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="hidden flex-col items-stretch gap-2 md:flex md:max-w-2xl md:ml-auto">
            <p
              className={cn(
                'text-right text-xs leading-relaxed text-muted-foreground',
                !canSubmit && 'text-amber-800 dark:text-amber-200'
              )}
            >
              {canSubmit ? (
                <>
                  <span className="font-medium text-foreground">Un envío, todo el informe.</span> Se guardan a la vez el
                  servicio, diagnóstico del servicio, placa de referencia y las tres pestañas eléctricas (si aplican).
                </>
              ) : (
                <>
                  <span className="font-medium">El botón de envío está bloqueado</span> hasta que indiques el{' '}
                  <span className="font-medium text-foreground">tipo de mantenimiento</span> y el{' '}
                  <span className="font-medium text-foreground">tipo de servicio</span> en la tarjeta superior (datos
                  obligatorios). Luego podrás enviar todo junto.
                </>
              )}
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => requestLeave(`/scan/${uuid}`)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit}
                title={!canSubmit ? 'Indica tipo de mantenimiento y tipo de servicio arriba para habilitar el envío' : undefined}
                className="min-w-[12rem] font-semibold"
              >
                {form.formState.isSubmitting ? 'Enviando…' : 'Enviar informe completo'}
              </Button>
            </div>
          </div>

          <div
            className={cn(
              'fixed left-0 right-0 z-30 border-t bg-background/95 px-4 pt-3 shadow-[0_-8px_30px_rgba(0,0,0,.08)] backdrop-blur supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden',
              'bottom-24'
            )}
          >
            <p
              className={cn(
                'mb-2 text-center text-[11px] leading-snug text-muted-foreground',
                !canSubmit && 'text-amber-900 dark:text-amber-100'
              )}
            >
              {canSubmit ? (
                <>
                  Un solo toque envía <span className="font-semibold text-foreground">servicio + diagnóstico completo</span>.
                </>
              ) : (
                <>
                  Completa <span className="font-semibold text-foreground">tipo de mantenimiento</span> y{' '}
                  <span className="font-semibold text-foreground">tipo de servicio</span> arriba para habilitar el envío.
                </>
              )}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => requestLeave(`/scan/${uuid}`)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="hvac-maint-register-form"
                className="flex-[1.35] font-semibold"
                disabled={!canSubmit}
                title={!canSubmit ? 'Indica tipo de mantenimiento y tipo de servicio arriba' : undefined}
              >
                {form.formState.isSubmitting ? 'Enviando…' : 'Enviar todo'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
