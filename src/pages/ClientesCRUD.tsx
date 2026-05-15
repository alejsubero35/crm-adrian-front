import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, PencilSimple, Trash } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditModal } from '@/components/ui/EditModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable, type DataTableColumn } from '@/components/DataTable';
import { useToast } from '@/hooks/use-toast';
import { ValidatedInput } from '@/components/ui/ValidatedInput';
import { GooglePlaceAddressField } from '@/components/forms/GooglePlaceAddressField';
import { customerSchema, type CustomerFormData } from '@/validations/hvac.schema';
import { hvacService } from '@/services/hvac.service';
import { rbacService } from '@/services/rbac.service';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import type { Customer } from '@/types/hvac';
import { cn } from '@/lib/utils';

const NO_PORTAL_USER = '__none__';

export default function ClientesCRUD() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [portalUserId, setPortalUserId] = useState(NO_PORTAL_USER);
  const [portalPassword, setPortalPassword] = useState('');
  const [clienteUsers, setClienteUsers] = useState<Array<{ id: number; label: string }>>([]);
  const [portalSaving, setPortalSaving] = useState(false);
  const createForm = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: '', tax_id: '', email: '', phone: '', address: '', como_nos_conocio: '', gps_coordinates: '' },
  });

  const editForm = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: '', tax_id: '', email: '', phone: '', address: '', como_nos_conocio: '', gps_coordinates: '' },
  });

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setCustomers(await hvacService.getCustomers());
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al cargar clientes',
        description: error instanceof Error ? error.message : 'No fue posible obtener clientes.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCustomers();
    void loadClienteUsers();
  }, []);

  const loadClienteUsers = async () => {
    try {
      const response = await rbacService.getUsers();
      setClienteUsers(
        response.data
          .filter((u) => u.roles?.includes('cliente'))
          .map((u) => ({
            id: u.id,
            label: `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || u.email,
          }))
      );
    } catch {
      setClienteUsers([]);
    }
  };

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((customer) =>
      [customer.name, customer.tax_id, customer.email, customer.phone, customer.como_nos_conocio]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [customers, search]);

  const handleCreate = async (data: CustomerFormData) => {
    try {
      await hvacService.createCustomer(data);
      toast({ variant: 'success', title: 'Cliente creado', description: 'Registro exitoso.' });
      setIsCreateModalOpen(false);
      createForm.reset();
      await loadCustomers();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo crear',
        description: error instanceof Error ? error.message : 'Error inesperado.',
      });
    }
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setPortalUserId(customer.portal_user?.id ? String(customer.portal_user.id) : NO_PORTAL_USER);
    setPortalPassword('');
    editForm.reset({
      name: customer.name,
      tax_id: customer.tax_id ?? '',
      email: customer.email ?? '',
      phone: customer.phone ?? '',
      address: customer.address ?? '',
      como_nos_conocio: customer.como_nos_conocio ?? '',
      gps_coordinates: customer.gps_coordinates ?? '',
    });
    setIsEditModalOpen(true);
  };

  const handleEdit = async (data: CustomerFormData) => {
    if (!editingCustomer?.id) return;
    try {
      await hvacService.updateCustomer(editingCustomer.id, data);
      toast({ variant: 'success', title: 'Cliente actualizado', description: 'Cambios guardados.' });
      setIsEditModalOpen(false);
      setEditingCustomer(null);
      await loadCustomers();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo actualizar',
        description: error instanceof Error ? error.message : 'Error inesperado.',
      });
    }
  };

  const openDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteDialogOpen(true);
  };

  const handleLinkPortalUser = async () => {
    if (!editingCustomer?.id) return;
    try {
      setPortalSaving(true);
      const userId =
        portalUserId && portalUserId !== NO_PORTAL_USER ? Number(portalUserId) : null;
      const updated = await hvacService.syncCustomerPortalUser(editingCustomer.id, userId);
      setEditingCustomer(updated);
      await loadCustomers();
      await loadClienteUsers();
      toast({
        variant: 'success',
        title: userId ? 'Usuario vinculado' : 'Usuario desvinculado',
        description: 'Acceso al portal actualizado.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo vincular',
        description: error instanceof Error ? error.message : 'Error inesperado.',
      });
    } finally {
      setPortalSaving(false);
    }
  };

  const handleCreatePortalUser = async () => {
    if (!editingCustomer?.id) return;
    if (portalPassword.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Contraseña corta',
        description: 'La contraseña debe tener al menos 8 caracteres.',
      });
      return;
    }
    try {
      setPortalSaving(true);
      await hvacService.createCustomerPortalUser(editingCustomer.id, {
        email: editingCustomer.email || undefined,
        password: portalPassword,
        name: editingCustomer.name,
      });
      setPortalPassword('');
      await loadCustomers();
      await loadClienteUsers();
      const refreshed = (await hvacService.getCustomers()).find((c) => c.id === editingCustomer.id);
      if (refreshed) {
        setEditingCustomer(refreshed);
        setPortalUserId(
          refreshed.portal_user?.id ? String(refreshed.portal_user.id) : NO_PORTAL_USER
        );
      }
      toast({ variant: 'success', title: 'Acceso creado', description: 'Usuario de portal listo para iniciar sesión.' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo crear acceso',
        description: error instanceof Error ? error.message : 'Error inesperado.',
      });
    } finally {
      setPortalSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!customerToDelete?.id) return;
    try {
      await hvacService.deleteCustomer(customerToDelete.id);
      toast({ variant: 'success', title: 'Cliente eliminado', description: 'Registro eliminado correctamente.' });
      setIsDeleteDialogOpen(false);
      setCustomerToDelete(null);
      await loadCustomers();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo eliminar',
        description: error instanceof Error ? error.message : 'Error inesperado.',
      });
    }
  };

  const columns: DataTableColumn<Customer>[] = [
    {
      id: 'name',
      header: 'Cliente',
      cell: ({ item }) => (
        <div className="min-w-0">
          <p className="font-semibold truncate">{item.name}</p>
          <p className="text-xs text-muted-foreground truncate">{item.email || 'Sin correo'}</p>
        </div>
      ),
    },
    {
      id: 'phone',
      header: 'Telefono',
      cell: ({ item }) => <span>{item.phone || 'Sin telefono'}</span>,
      hideBelow: 'md',
      mobileLabel: 'Telefono',
    },
    {
      id: 'tax_id',
      header: 'RIF o cédula',
      cell: ({ item }) => <span>{item.tax_id || '—'}</span>,
      hideBelow: 'lg',
      mobileLabel: 'RIF o cédula',
    },
    {
      id: 'address',
      header: 'Direccion',
      cell: ({ item }) => <span>{item.address || 'Sin direccion'}</span>,
      hideBelow: 'xl',
      mobileLabel: 'Direccion',
    },
    {
      id: 'portal',
      header: 'Portal',
      cell: ({ item }) => (
        <Badge variant={item.portal_user ? 'secondary' : 'outline'}>
          {item.portal_user ? 'Con acceso' : 'Sin acceso'}
        </Badge>
      ),
      hideBelow: 'lg',
      mobileLabel: 'Portal',
    },
    {
      id: 'equipments_count',
      header: 'Equipos',
      cell: ({ item }) => {
        const count = item.equipments_count ?? 0;
        return (
          <Badge variant={count > 0 ? 'secondary' : 'outline'} className="tabular-nums">
            {count} {count === 1 ? 'equipo' : 'equipos'}
          </Badge>
        );
      },
      hideBelow: 'lg',
      mobileLabel: 'Cantidad de equipos',
    },
    {
      id: 'monthly_investment',
      header: 'Inversión mensual',
      cell: ({ item }) => {
        const amount = item.monthly_investment ?? 0;
        return (
          <Badge
            variant={amount > 0 ? 'default' : 'outline'}
            className={cn(
              'tabular-nums',
              amount > 0 && 'border-transparent bg-emerald-600 text-white hover:bg-emerald-600/90'
            )}
          >
            ${amount.toFixed(2)}
          </Badge>
        );
      },
      hideBelow: 'lg',
      mobileLabel: 'Inversión mensual',
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ item }) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => openEdit(item)}
          >
            <PencilSimple className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:border-red-300"
            onClick={() => openDelete(item)}
          >
            <Trash className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 pb-24 md:pb-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-muted-foreground">Lista de contactos para asignacion rapida en campo.</p>
        </div>
        <Button className="hidden md:inline-flex" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo cliente
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Total clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{customers.length}</p>
        </CardContent>
      </Card>

      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar por nombre, RIF/cédula, correo o teléfono..."
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando clientes...</p>
      ) : filteredCustomers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay clientes para mostrar.</p>
      ) : (
        <DataTable<Customer>
          items={filteredCustomers}
          columns={columns}
          rowKey={({ item }) => String(item.id ?? item.name)}
          wrapInCard
        />
      )}

      <div className="fixed bottom-24 left-0 right-0 px-4 z-20 md:hidden">
        <Button className="w-full h-12 shadow-lg" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo cliente
        </Button>
      </div>

      <EditModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        title="Crear cliente"
        description="Datos fiscales y de contacto."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
            <Button onClick={createForm.handleSubmit(handleCreate)}>Guardar</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={createForm.handleSubmit(handleCreate)}>
          <ValidatedInput label="Nombre" name="name" control={createForm.control} required />
          <ValidatedInput label="RIF o cédula" name="tax_id" control={createForm.control} />
          <ValidatedInput label="Correo" name="email" control={createForm.control} type="email" />
          <ValidatedInput label="Telefono" name="phone" control={createForm.control} />
          <GooglePlaceAddressField
            control={createForm.control}
            name="address"
            label="Dirección del cliente"
            active={isCreateModalOpen}
            onCoordinatesChange={(coords) =>
              createForm.setValue('gps_coordinates', coords, { shouldDirty: true })
            }
          />
          <ValidatedInput
            label="¿Cómo nos conoció?"
            name="como_nos_conocio"
            control={createForm.control}
            placeholder="Referido, redes sociales, publicidad..."
          />
        </form>
      </EditModal>

      <EditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Editar cliente"
        description="Actualiza la ficha de contacto."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
            <Button onClick={editForm.handleSubmit(handleEdit)}>Guardar cambios</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={editForm.handleSubmit(handleEdit)}>
          <ValidatedInput label="Nombre" name="name" control={editForm.control} required />
          <ValidatedInput label="RIF o cédula" name="tax_id" control={editForm.control} />
          <ValidatedInput label="Correo" name="email" control={editForm.control} type="email" />
          <ValidatedInput label="Telefono" name="phone" control={editForm.control} />
          <GooglePlaceAddressField
            control={editForm.control}
            name="address"
            label="Dirección del cliente"
            active={isEditModalOpen}
            onCoordinatesChange={(coords) =>
              editForm.setValue('gps_coordinates', coords, { shouldDirty: true })
            }
          />
          <ValidatedInput
            label="¿Cómo nos conoció?"
            name="como_nos_conocio"
            control={editForm.control}
            placeholder="Referido, redes sociales, publicidad..."
          />

          <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
            <p className="text-sm font-semibold">Acceso al portal (rol cliente)</p>
            {editingCustomer?.portal_user ? (
              <p className="text-xs text-muted-foreground">
                Vinculado: <span className="font-medium text-foreground">{editingCustomer.portal_user.email}</span>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Sin usuario. Crea uno nuevo o vincula un usuario existente con rol cliente.
              </p>
            )}

            <div className="space-y-2">
              <p className="text-xs font-medium">Vincular usuario existente</p>
              <SearchableSelect
                value={portalUserId}
                onChange={setPortalUserId}
                options={[
                  { value: NO_PORTAL_USER, label: 'Sin usuario vinculado' },
                  ...clienteUsers.map((u) => ({ value: String(u.id), label: u.label })),
                ]}
                placeholder="Buscar usuario cliente..."
                searchPlaceholder="Nombre o correo..."
              />
              <Button type="button" variant="outline" size="sm" disabled={portalSaving} onClick={() => void handleLinkPortalUser()}>
                Guardar vinculación
              </Button>
            </div>

            {!editingCustomer?.portal_user ? (
              <div className="space-y-2 border-t pt-3">
                <p className="text-xs font-medium">Crear acceso nuevo</p>
                <Input
                  type="password"
                  value={portalPassword}
                  onChange={(e) => setPortalPassword(e.target.value)}
                  placeholder="Contraseña (mín. 8 caracteres)"
                />
                <p className="text-[11px] text-muted-foreground">
                  Usará el correo del cliente{editingCustomer?.email ? `: ${editingCustomer.email}` : ' (agrega email en la ficha)'}.
                </p>
                <Button type="button" size="sm" disabled={portalSaving} onClick={() => void handleCreatePortalUser()}>
                  Crear usuario de portal
                </Button>
              </div>
            ) : null}
          </div>
        </form>
      </EditModal>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Confirmar eliminación"
        description={`¿Eliminar al cliente "${customerToDelete?.name ?? ''}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setCustomerToDelete(null);
        }}
      />
    </div>
  );
}
