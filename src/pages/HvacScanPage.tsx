import React, { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EditModal } from '@/components/ui/EditModal';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/loading-spinner';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { ValidatedInput } from '@/components/ui/ValidatedInput';
import { ValidatedTextarea } from '@/components/ui/ValidatedTextarea';
import { hvacService } from '@/services/hvac.service';
import type { Customer, Plan, EquipmentDetails } from '@/types/hvac';
import {
  registerEquipmentSchema,
  maintenanceLogSchema,
  type RegisterEquipmentFormData,
  type MaintenanceLogFormData,
} from '@/validations/hvac.schema';

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

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [scanData, setScanData] = useState<EquipmentDetails | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isLogDetailModalOpen, setIsLogDetailModalOpen] = useState(false);
  const [selectedLogIndex, setSelectedLogIndex] = useState<number | null>(null);
  const [manualUuid, setManualUuid] = useState('');

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
      gps_coordinates: '',
    },
  });

  const logForm = useForm<MaintenanceLogFormData>({
    resolver: zodResolver(maintenanceLogSchema),
    defaultValues: {
      service_type: '',
      description: '',
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
    void loadFormData();
  }, [uuid]);

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

  const customerById = useMemo(
    () => Object.fromEntries(customers.map((customer) => [String(customer.id), customer])),
    [customers]
  );
  const planById = useMemo(
    () => Object.fromEntries(plans.map((plan) => [String(plan.id), plan])),
    [plans]
  );

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({ variant: 'destructive', title: 'GPS no disponible', description: 'El dispositivo no soporta geolocalizacion.' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude},${position.coords.longitude}`;
        registerForm.setValue('gps_coordinates', coords, { shouldDirty: true });
        toast({ variant: 'success', title: 'Ubicacion obtenida', description: 'Se cargo la coordenada del equipo.' });
      },
      () => {
        toast({ variant: 'destructive', title: 'No se pudo leer GPS', description: 'Verifica permisos de ubicacion.' });
      }
    );
  };

  const handleRegister = async (values: RegisterEquipmentFormData) => {
    const customer = customerById[values.customer_id];
    const plan = planById[values.plan_id];
    if (!customer || !plan) {
      toast({ variant: 'destructive', title: 'Datos incompletos', description: 'Selecciona cliente y plan validos.' });
      return;
    }

    try {
      setRegistering(true);
      await hvacService.registerEquipment({
        qr_uuid: uuid,
        plan_id: plan.id,
        customer: {
          name: customer.name,
          tax_id: customer.tax_id ?? undefined,
          email: customer.email ?? undefined,
          phone: customer.phone ?? undefined,
          address: customer.address ?? undefined,
        },
        brand: values.brand,
        model: values.model,
        serial_number: values.serial_number,
        type: values.type,
        capacity: values.capacity,
        refrigerant_type: values.refrigerant_type,
        gps_coordinates: values.gps_coordinates,
      });
      toast({ variant: 'success', title: 'Equipo vinculado', description: 'Redirigiendo al dashboard del equipo...' });
      await fetchScan();
      navigate(`/scan/${uuid}`, { replace: true });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo vincular',
        description: error instanceof Error ? error.message : 'Revisa los campos e intenta de nuevo.',
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleCreateLog = async (values: MaintenanceLogFormData) => {
    try {
      await hvacService.createMaintenanceLog({
        equipment_qr_uuid: uuid,
        service_type: values.service_type,
        description: values.description,
      });
      toast({ variant: 'success', title: 'Servicio registrado', description: 'El historial fue actualizado.' });
      setIsLogModalOpen(false);
      logForm.reset();
      await fetchScan();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo registrar',
        description: error instanceof Error ? error.message : 'Intenta nuevamente.',
      });
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

  const formatDate = (value?: string | null) => {
    if (!value) return 'No definido';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'No definido';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="space-y-4 pb-24 md:pb-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Escaneo QR HVAC</h1>
          <p className="text-sm text-muted-foreground">UUID: {uuid}</p>
        </div>
        <div className="hidden md:block">
          {isAvailable ? (
            <Button onClick={registerForm.handleSubmit(handleRegister)} disabled={registering}>
              {registering ? 'Vinculando equipo...' : 'Vincular equipo'}
            </Button>
          ) : (
            <Button onClick={() => setIsLogModalOpen(true)}>
              <Wrench className="h-4 w-4 mr-2" />
              Registrar nuevo servicio
            </Button>
          )}
        </div>
      </div>

      {!uuid ? (
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

      {!loading && isAvailable ? (
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
                        description: `${plan.maintenance_frequency_days} dias`,
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
                <ValidatedInput label="Serial" name="serial_number" control={registerForm.control} required />
                <ValidatedInput label="Tipo de equipo" name="type" control={registerForm.control} required />
                <ValidatedInput label="Capacidad" name="capacity" control={registerForm.control} required />
                <ValidatedInput label="Tipo de gas" name="refrigerant_type" control={registerForm.control} required />
              </div>

              <ValidatedInput label="GPS" name="gps_coordinates" control={registerForm.control} />
              <Button type="button" variant="outline" className="w-full" onClick={handleGetLocation}>
                <MapPin className="h-4 w-4 mr-2" />
                Obtener ubicacion GPS
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : !loading && scanData ? (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>Estado del equipo</CardTitle>
                <Badge className={statusStyle[scanData.equipment.current_status] || 'bg-slate-200 text-slate-800'}>
                  {scanData.equipment.current_status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="font-medium">Marca/Modelo:</span> {scanData.equipment.brand} {scanData.equipment.model}</p>
              <p><span className="font-medium">Serial:</span> {scanData.equipment.serial_number}</p>
              <p><span className="font-medium">Tipo:</span> {scanData.equipment.type}</p>
              <p><span className="font-medium">Capacidad:</span> {scanData.equipment.capacity}</p>
              <p><span className="font-medium">Gas:</span> {scanData.equipment.refrigerant_type}</p>
              <p><span className="font-medium">Proximo servicio:</span> {formatDate(scanData.equipment.next_service_at)}</p>
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
                          <p className="font-medium">{log.service_type}</p>
                          <p className="text-xs text-muted-foreground">{log.created_at || 'Sin fecha'}</p>
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
      ) : !loading ? (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">No se encontro informacion para este QR.</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="fixed bottom-24 left-0 right-0 px-4 z-20 md:hidden">
        {isAvailable ? (
          <Button className="w-full h-12" onClick={registerForm.handleSubmit(handleRegister)} disabled={registering}>
            {registering ? 'Vinculando equipo...' : 'Vincular equipo'}
          </Button>
        ) : (
          <Button className="w-full h-12" onClick={() => setIsLogModalOpen(true)}>
            <Wrench className="h-4 w-4 mr-2" />
            Registrar nuevo servicio
          </Button>
        )}
      </div>

      <EditModal
        open={isLogModalOpen}
        onOpenChange={setIsLogModalOpen}
        title="Registrar servicio"
        description="Agregar registro de mantenimiento."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsLogModalOpen(false)}>Cancelar</Button>
            <Button onClick={logForm.handleSubmit(handleCreateLog)}>Guardar</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={logForm.handleSubmit(handleCreateLog)}>
          <ValidatedInput label="Tipo de servicio" name="service_type" control={logForm.control} required />
          <ValidatedTextarea label="Descripcion" name="description" control={logForm.control} rows={4} />
        </form>
      </EditModal>

      <EditModal
        open={isLogDetailModalOpen}
        onOpenChange={setIsLogDetailModalOpen}
        title="Detalle de mantenimiento"
        description="Información completa del registro seleccionado."
        footer={
          <Button variant="outline" onClick={() => setIsLogDetailModalOpen(false)}>
            Cerrar
          </Button>
        }
      >
        {selectedLog ? (
          <div className="space-y-3 text-sm">
            <p><span className="font-medium">Tipo de servicio:</span> {selectedLog.service_type}</p>
            <p><span className="font-medium">Fecha:</span> {formatDate(selectedLog.created_at)}</p>
            <p><span className="font-medium">Tecnico:</span> {selectedLog.technician?.name || 'No asignado'}</p>
            <p><span className="font-medium">Correo tecnico:</span> {selectedLog.technician?.email || 'No disponible'}</p>
            <p><span className="font-medium">Descripcion:</span> {selectedLog.description || 'Sin descripcion'}</p>
            <p><span className="font-medium">Fotos:</span> {(selectedLog.photos?.length ?? 0) > 0 ? selectedLog.photos?.join(', ') : 'Sin fotos'}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No hay detalle para mostrar.</p>
        )}
      </EditModal>
    </div>
  );
}
