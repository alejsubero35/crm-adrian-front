import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EditModal } from '@/components/ui/EditModal';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/loading-spinner';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { ValidatedInput } from '@/components/ui/ValidatedInput';
import { useDemoAuth } from '@/features/auth/DemoAuthContext';
import { hvacService } from '@/services/hvac.service';
import type { Customer, Plan, EquipmentDetails } from '@/types/hvac';
import {
  registerEquipmentSchema,
  type RegisterEquipmentFormData,
} from '@/validations/hvac.schema';
import { getApiErrorMessage, getApiFieldErrors } from '@/lib/apiErrors';
import { listHvacDiagnosticMeasurements } from '@/utils/hvacDiagnosticFields';
import { MaintenanceSparePartsFctRow } from '@/components/hvac/MaintenanceSparePartsFctRow';
import { MaintenanceTypeBadge } from '@/components/hvac/MaintenanceTypeBadge';
import { NextServiceDateBadge } from '@/components/hvac/NextServiceDateBadge';
import { HvacClientPortalView } from '@/components/hvac/HvacClientPortalView';
import { createSafeQrScanner, safeDestroyQrScanner } from '@/lib/qrScannerCleanup';
import { waitForDomSettled } from '@/lib/domTiming';
import type QrScanner from 'qr-scanner';

const statusStyle: Record<string, string> = {
  operational: 'bg-emerald-100 text-emerald-800',
  maintenance_due: 'bg-amber-100 text-amber-800',
  in_repair: 'bg-red-100 text-red-800',
  out_of_service: 'bg-red-100 text-red-800',
};

export default function HvacScanPage() {
  const { uuid = '' } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { hasRole, hasPermission } = useDemoAuth();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [scanData, setScanData] = useState<EquipmentDetails | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isLogDetailModalOpen, setIsLogDetailModalOpen] = useState(false);
  const [selectedLogIndex, setSelectedLogIndex] = useState<number | null>(null);
  const [manualUuid, setManualUuid] = useState('');
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isScannerLoading, setIsScannerLoading] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const scanHandledRef = useRef(false);
  const canManageEquipment = hasRole('admin') || hasRole('tecnico') || hasRole('técnico') || hasPermission('equipments.create');
  const canCreateMaintenance =
    hasRole('admin') || hasRole('tecnico') || hasRole('técnico') || hasPermission('maintenance.create');
  const isClientRole = hasRole('cliente') || hasRole('client');
  const showMobileScanner = !uuid && isMobileViewport;
  const canShowManualInput = !uuid && !isMobileViewport;

  const registerForm = useForm<RegisterEquipmentFormData>({
    resolver: zodResolver(registerEquipmentSchema),
    defaultValues: {
      customer_id: '',
      plan_id: '',
      brand: '',
      model: '',
      serial_number: '',
      type: '',
      capacity: '',
      refrigerant_type: '',
      installation_location: '',
    },
  });

  const fetchScan = async () => {
    try {
      setLoading(true);
      const response = await hvacService.scanQr(uuid);
      const available = (response as { status?: string }).status === 'available';
      setIsAvailable(available);
      setScanData(available ? null : (response as EquipmentDetails));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error de escaneo',
        description: error instanceof Error ? error.message : 'No se pudo validar el QR.',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFormData = async () => {
    try {
      const [customersData, plansData] = await Promise.all([
        hvacService.getCustomers(),
        hvacService.getPlans(),
      ]);
      setCustomers(customersData);
      setPlans(plansData);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudieron cargar listas',
        description: error instanceof Error ? error.message : 'Reintenta nuevamente.',
      });
    }
  };

  useEffect(() => {
    if (!uuid) return;
    void fetchScan();
    if (!isClientRole) {
      void loadFormData();
    }
  }, [uuid, isClientRole]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const syncMobileState = () => setIsMobileViewport(mediaQuery.matches);
    syncMobileState();

    const listener = (event: MediaQueryListEvent) => setIsMobileViewport(event.matches);
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }

    mediaQuery.addListener(listener);
    return () => mediaQuery.removeListener(listener);
  }, []);

  useEffect(() => {
    if (!showMobileScanner) return;

    scanHandledRef.current = false;
    let cancelled = false;

    const tryExtractUuid = (value: string): string | null => {
      const trimmed = value.trim();
      if (!trimmed) return null;

      const routeMatch = trimmed.match(/\/scan\/([^/?#]+)/i);
      if (routeMatch?.[1]) return routeMatch[1];

      const uuidLike = trimmed.match(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i);
      if (uuidLike?.[0]) return uuidLike[0];

      return trimmed;
    };

    const startScanner = async () => {
      const videoEl = videoRef.current;
      if (!videoEl || cancelled) {
        if (!cancelled) setScannerError('No se pudo inicializar la vista de cámara.');
        return;
      }

      try {
        setScannerError(null);
        setIsScannerLoading(true);

        const scanner = createSafeQrScanner(videoEl, (rawValue) => {
          if (cancelled || scanHandledRef.current) return;
          const nextUuid = tryExtractUuid(rawValue);
          if (!nextUuid) return;

          scanHandledRef.current = true;
          navigate(`/scan/${nextUuid}`);
        });

        scannerRef.current = scanner;
        await scanner.start();
      } catch (error) {
        if (!cancelled) {
          setScannerError(error instanceof Error ? error.message : 'No se pudo abrir la cámara.');
        }
      } finally {
        if (!cancelled) setIsScannerLoading(false);
      }
    };

    void startScanner();

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      scannerRef.current = null;
      void safeDestroyQrScanner(scanner);
    };
  }, [showMobileScanner, navigate]);

  const handleManualScan = () => {
    const nextUuid = manualUuid.trim();
    if (!nextUuid) {
      toast({
        variant: 'destructive',
        title: 'UUID requerido',
        description: 'Ingresa el UUID del QR para continuar.',
      });
      return;
    }
    navigate(`/scan/${nextUuid}`);
  };

  const planById = useMemo(
    () => Object.fromEntries(plans.map((plan) => [String(plan.id), plan])),
    [plans]
  );

  const handleRegister = async (values: RegisterEquipmentFormData) => {
    const plan = planById[values.plan_id];
    const customerId = Number(values.customer_id);
    if (!values.customer_id || !Number.isFinite(customerId) || !plan) {
      toast({ variant: 'destructive', title: 'Datos incompletos', description: 'Selecciona cliente y plan validos.' });
      return;
    }

    try {
      setRegistering(true);
      await hvacService.registerEquipment({
        qr_uuid: uuid,
        plan_id: plan.id,
        customer_id: customerId,
        brand: values.brand.trim(),
        model: values.model.trim(),
        serial_number: values.serial_number.trim(),
        type: values.type.trim(),
        capacity: values.capacity.trim(),
        refrigerant_type: values.refrigerant_type.trim(),
        installation_location: values.installation_location.trim(),
      });
      toast({ variant: 'success', title: 'Equipo vinculado', description: 'Redirigiendo al dashboard del equipo...' });
      await fetchScan();
      await waitForDomSettled();
      navigate(`/scan/${uuid}`, { replace: true });
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error);
      if (fieldErrors) {
        for (const [field, message] of Object.entries(fieldErrors)) {
          registerForm.setError(field as keyof RegisterEquipmentFormData, { message });
        }
      }
      toast({
        variant: 'destructive',
        title: 'No se pudo vincular',
        description: getApiErrorMessage(error, 'Revisa los campos e intenta de nuevo.'),
      });
    } finally {
      setRegistering(false);
    }
  };

  const openLogDetail = (index: number) => {
    setSelectedLogIndex(index);
    setIsLogDetailModalOpen(true);
  };

  const selectedLog =
    selectedLogIndex !== null && scanData?.maintenance_logs
      ? scanData.maintenance_logs[selectedLogIndex]
      : null;

  const formatDateTime = (value?: string | null) => {
    if (!value) return 'No definido';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'No definido';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());

    const hours24 = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const period = hours24 >= 12 ? 'pm' : 'am';
    const hours12 = hours24 % 12 || 12;

    return `${day}-${month}-${year} ${hours12}:${minutes} ${period}`;
  };

  const showClientPortal = isClientRole && uuid && !isAvailable;
  const showStaffHeader = !showClientPortal;

  return (
    <div className="space-y-4 pb-24 md:pb-6">
      {showStaffHeader ? (
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{uuid ? 'Escaneo QR HVAC' : 'Escanear QR HVAC'}</h1>
            {uuid ? <p className="text-sm text-muted-foreground">UUID: {uuid}</p> : null}
          </div>
          <div className="hidden md:flex md:flex-col md:items-end md:gap-2">
            {isAvailable && canManageEquipment ? (
              <Button onClick={registerForm.handleSubmit(handleRegister)} disabled={registering}>
                {registering ? 'Vinculando equipo...' : 'Vincular equipo'}
              </Button>
            ) : !isAvailable && canCreateMaintenance ? (
              <Button
                onClick={async () => {
                  setIsLogDetailModalOpen(false);
                  await waitForDomSettled();
                  navigate(`/scan/${uuid}/registrar-servicio`);
                }}
              >
                <Wrench className="h-4 w-4 mr-2" />
                Registrar nuevo servicio
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {showMobileScanner ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Escanear QR
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="overflow-hidden rounded-xl border bg-black">
              <video
                ref={videoRef}
                className="h-[320px] w-full object-cover"
                playsInline
                muted
                autoPlay
              />
            </div>
            {isScannerLoading ? <p className="text-sm text-muted-foreground">Iniciando cámara…</p> : null}
            {scannerError ? <p className="text-sm text-destructive">{scannerError}</p> : null}
            {!isScannerLoading && !scannerError ? (
              <p className="text-sm text-muted-foreground">Apunta la cámara al código QR para consultar automáticamente.</p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {canShowManualInput ? (
        <Card>
          <CardHeader>
            <CardTitle>Ingresar QR manualmente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={manualUuid}
              onChange={(event) => setManualUuid(event.target.value)}
              placeholder="Pega o escribe el UUID del QR"
              inputMode="text"
            />
            <Button className="w-full" onClick={handleManualScan}>
              Consultar QR
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {loading ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-28 w-full" />
          </CardContent>
        </Card>
      ) : null}

      {!loading && isClientRole && uuid && isAvailable ? (
        <Card>
          <CardHeader>
            <CardTitle>QR sin vincular</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Este código aún no está asociado a un equipo. Contacta a tu técnico para la vinculación.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {!loading && isClientRole && uuid && !isAvailable ? (
        <HvacClientPortalView scannedQrUuid={uuid} />
      ) : null}

      {!loading && !isClientRole && isAvailable && canManageEquipment ? (
        <Card>
          <CardHeader>
            <CardTitle>Vincular equipo en primer escaneo</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={registerForm.handleSubmit(handleRegister)}>
              <Controller
                control={registerForm.control}
                name="customer_id"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Cliente *</p>
                    <SearchableSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={customers.map((customer) => ({
                        value: String(customer.id),
                        label: customer.name,
                        description: customer.phone || customer.email || '',
                      }))}
                      placeholder="Buscar cliente..."
                      searchPlaceholder="Escribe nombre o contacto..."
                    />
                    {fieldState.error ? <p className="text-xs text-red-500">{fieldState.error.message}</p> : null}
                  </div>
                )}
              />

              <Controller
                control={registerForm.control}
                name="plan_id"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Plan *</p>
                    <SearchableSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={plans.map((plan) => ({
                        value: String(plan.id),
                        label: plan.name,
                        description: `${plan.maintenance_frequency_days} días · $${(plan.monthly_amount ?? 0).toFixed(2)}/mes`,
                      }))}
                      placeholder="Buscar plan..."
                      searchPlaceholder="Escribe nombre del plan..."
                    />
                    {fieldState.error ? <p className="text-xs text-red-500">{fieldState.error.message}</p> : null}
                  </div>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ValidatedInput label="Marca" name="brand" control={registerForm.control} required />
                <ValidatedInput label="Modelo" name="model" control={registerForm.control} required />
                <ValidatedInput
                  label="Serial"
                  name="serial_number"
                  control={registerForm.control}
                  required
                  type="text"
                  inputMode="text"
                  maxLength={120}
                  placeholder="Ej. 1234567890 o alfanumérico"
                />
                <ValidatedInput label="Tipo de equipo" name="type" control={registerForm.control} required />
                <ValidatedInput label="Capacidad" name="capacity" control={registerForm.control} required />
                <ValidatedInput label="Tipo de gas" name="refrigerant_type" control={registerForm.control} required />
                <ValidatedInput
                  label="Ubicación del equipo"
                  name="installation_location"
                  control={registerForm.control}
                  required
                  placeholder="Ej. Cuarto principal, sala, terraza"
                />
              </div>

            </form>
          </CardContent>
        </Card>
      ) : !loading && isAvailable && !isClientRole ? (
        <Card>
          <CardHeader>
            <CardTitle>Equipo pendiente de vinculacion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Este QR esta disponible pero no ha sido vinculado aun. Contacta a un tecnico para registrar el equipo.
            </p>
          </CardContent>
        </Card>
      ) : !loading && !isClientRole && scanData ? (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle>Estado del equipo</CardTitle>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="rounded-md border-2 border-primary/40 bg-primary/5 px-3 py-1.5 text-sm font-bold text-primary tabular-nums">
                    FCT: {(scanData.fct_remaining ?? 0).toFixed(2)}$
                  </span>
                  <Badge className={statusStyle[scanData.equipment.current_status] || 'bg-slate-200 text-slate-800'}>
                    {scanData.equipment.current_status}
                  </Badge>
                </div>
              </div>
              {scanData.fondo_de_cobertura != null && scanData.fondo_de_cobertura > 0 ? (
                <p className="text-xs text-muted-foreground pt-1">
                  Fondo inicial: ${scanData.fondo_de_cobertura.toFixed(2)}
                  {(scanData.fct_deducted ?? 0) > 0
                    ? ` · Descontado: $${(scanData.fct_deducted ?? 0).toFixed(2)}`
                    : null}
                </p>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="font-medium">Marca/Modelo:</span> {scanData.equipment.brand} {scanData.equipment.model}</p>
              <p><span className="font-medium">Serial:</span> {scanData.equipment.serial_number}</p>
              <p><span className="font-medium">Tipo:</span> {scanData.equipment.type}</p>
              <p><span className="font-medium">Capacidad:</span> {scanData.equipment.capacity}</p>
              <p><span className="font-medium">Gas:</span> {scanData.equipment.refrigerant_type}</p>
              <p><span className="font-medium">Ubicación:</span> {scanData.equipment.installation_location || '—'}</p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <NextServiceDateBadge nextServiceAt={scanData.equipment.next_service_at} />
              </div>
              <p><span className="font-medium">Cliente:</span> {scanData.customer?.name || 'Sin cliente'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de mantenimiento</CardTitle>
            </CardHeader>
            <CardContent>
              {scanData.maintenance_logs?.length ? (
                <div className="max-h-[45vh] overflow-auto pr-1">
                  <div className="space-y-3">
                    {scanData.maintenance_logs.map((log, index) => (
                      <div key={`${log.created_at ?? 'log'}-${index}`} className="relative pl-5">
                        <span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-primary" />
                        <div className="rounded-lg border p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{log.service_type}</p>
                            <MaintenanceTypeBadge maintenanceType={log.maintenance_type} />
                          </div>
                          <p className="text-xs text-muted-foreground">{formatDateTime(log.created_at)}</p>
                          {log.description ? <p className="text-sm mt-1">{log.description}</p> : null}
                          {log.technician?.name ? (
                            <p className="text-xs text-muted-foreground mt-2">Tecnico: {log.technician.name}</p>
                          ) : null}
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 h-8"
                            onClick={() => openLogDetail(index)}
                          >
                            Ver detalle
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sin mantenimientos registrados.</p>
              )}
            </CardContent>
          </Card>
        </>
      ) : !loading && !isClientRole ? (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">No se encontro informacion para este QR.</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="fixed bottom-24 left-0 right-0 px-4 z-20 md:hidden">
        {isAvailable && canManageEquipment ? (
          <Button className="w-full h-12" onClick={registerForm.handleSubmit(handleRegister)} disabled={registering}>
            {registering ? 'Vinculando equipo...' : 'Vincular equipo'}
          </Button>
        ) : !isAvailable && canCreateMaintenance ? (
          <Button
            className="w-full h-12"
            onClick={async () => {
              setIsLogDetailModalOpen(false);
              await waitForDomSettled();
              navigate(`/scan/${uuid}/registrar-servicio`);
            }}
          >
            <Wrench className="h-4 w-4 mr-2" />
            Registrar nuevo servicio
          </Button>
        ) : null}
      </div>

      <EditModal
        open={isLogDetailModalOpen}
        onOpenChange={setIsLogDetailModalOpen}
        title="Detalle de Mantenimiento"
        description="Información completa del registro seleccionado."
        footer={
          <Button variant="outline" onClick={() => setIsLogDetailModalOpen(false)}>
            Cerrar
          </Button>
        }
      >
        {selectedLog ? (
          <div className="space-y-3 text-sm">
            <p className="flex flex-wrap items-center gap-2">
              <span className="font-medium"><strong>Tipo de mantenimiento:</strong></span>
              {selectedLog.maintenance_type?.name ? (
                <MaintenanceTypeBadge maintenanceType={selectedLog.maintenance_type} />
              ) : (
                'No indicado'
              )}
            </p>
            <p><span className="font-medium"><strong>Tipo de Servicio:</strong></span> {selectedLog.service_type}</p>
            <p><span className="font-medium"><strong>Fecha y Hora:</strong></span> {formatDateTime(selectedLog.created_at)}</p>
            <p><span className="font-medium"><strong>Técnico:</strong></span> {selectedLog.technician?.name || 'No asignado'}</p>
            <p><span className="font-medium"><strong>Correo Técnico:</strong></span> {selectedLog.technician?.email || 'No disponible'}</p>
            <p><span className="font-medium"><strong>Descripción:</strong></span> {selectedLog.description || 'Sin descripción'}</p>
            <MaintenanceSparePartsFctRow cost={selectedLog.spare_parts_cost} />
            <p><span className="font-medium"><strong>Fotos:</strong></span> {(selectedLog.photos?.length ?? 0) > 0 ? selectedLog.photos?.join(', ') : 'Sin fotos'}</p>
            {selectedLog.diagnostic ? (
              <div className="space-y-1 border-t pt-3 mt-1">
                <p className="font-medium">Diagnóstico (mediciones)</p>
                {(() => {
                  const entries = listHvacDiagnosticMeasurements(selectedLog.diagnostic, {
                    includeEmpty: true,
                  });
                  if (entries.length === 0) {
                    return <p className="text-xs text-muted-foreground">Sin mediciones en este servicio.</p>;
                  }
                  return (
                    <ul className="list-disc pl-4 space-y-1 text-xs">
                      {entries.map(({ key, label, value }) => (
                        <li key={key} className="text-muted-foreground">
                          <span className="font-medium text-foreground">{label}</span>: {value}
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No hay detalle para mostrar.</p>
        )}
      </EditModal>
    </div>
  );
}
