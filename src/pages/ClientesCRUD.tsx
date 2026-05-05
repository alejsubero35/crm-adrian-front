import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, PencilSimple, Trash } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EditModal } from '@/components/ui/EditModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable, type DataTableColumn } from '@/components/DataTable';
import { useToast } from '@/hooks/use-toast';
import { ValidatedInput } from '@/components/ui/ValidatedInput';
import { ValidatedTextarea } from '@/components/ui/ValidatedTextarea';
import { customerSchema, type CustomerFormData } from '@/validations/hvac.schema';
import { hvacService } from '@/services/hvac.service';
import type { Customer } from '@/types/hvac';

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

  const createForm = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: '', tax_id: '', email: '', phone: '', address: '' },
  });

  const editForm = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: '', tax_id: '', email: '', phone: '', address: '' },
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
  }, []);

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((customer) =>
      [customer.name, customer.tax_id, customer.email, customer.phone]
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
    editForm.reset({
      name: customer.name,
      tax_id: customer.tax_id ?? '',
      email: customer.email ?? '',
      phone: customer.phone ?? '',
      address: customer.address ?? '',
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
      header: 'RIF',
      cell: ({ item }) => <span>{item.tax_id || 'Sin RIF'}</span>,
      hideBelow: 'lg',
      mobileLabel: 'RIF',
    },
    {
      id: 'address',
      header: 'Direccion',
      cell: ({ item }) => <span>{item.address || 'Sin direccion'}</span>,
      hideBelow: 'xl',
      mobileLabel: 'Direccion',
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
        placeholder="Buscar por nombre, RIF, correo o telefono..."
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
          <ValidatedInput label="RIF / Tax ID" name="tax_id" control={createForm.control} />
          <ValidatedInput label="Correo" name="email" control={createForm.control} type="email" />
          <ValidatedInput label="Telefono" name="phone" control={createForm.control} />
          <ValidatedTextarea label="Direccion" name="address" control={createForm.control} rows={3} />
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
          <ValidatedInput label="RIF / Tax ID" name="tax_id" control={editForm.control} />
          <ValidatedInput label="Correo" name="email" control={editForm.control} type="email" />
          <ValidatedInput label="Telefono" name="phone" control={editForm.control} />
          <ValidatedTextarea label="Direccion" name="address" control={editForm.control} rows={3} />
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
