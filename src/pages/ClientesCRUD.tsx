import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus, PencilSimple, Trash } from '@phosphor-icons/react';
import { DataTable, DataTableColumn } from '@/components/DataTable';
import { EditModal } from '@/components/ui/EditModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { clientesSchema, clientesFormData } from '@/validations/clientes.schema';
import { ValidatedInput } from '@/components/ui/ValidatedInput';
import { ValidatedSelect } from '@/components/ui/ValidatedSelect';
import { ValidatedTextarea } from '@/components/ui/ValidatedTextarea';
import { ValidatedCheckbox } from '@/components/ui/ValidatedCheckbox';

type Clientes = {
  id: number;
name: string;
  identity_Card: number;
  phone?: number;
  address?: string;
};

export default function ClientesCRUD() {
  const { toast } = useToast();
  
  const [clientess, setClientess] = useState<Clientes[]>([
{ id: 1, name: 'name 1', identity_Card: 32, phone: 0, address: 'address 1' },
    { id: 2, name: 'name 2', identity_Card: 11, phone: 7, address: 'address 2' },
    { id: 3, name: 'name 3', identity_Card: 60, phone: 8, address: 'address 3' },
  ]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClientes, setEditingClientes] = useState<Clientes | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientesToDelete, setClientesToDelete] = useState<Clientes | null>(null);

  const createForm = useForm<clientesFormData>({
    resolver: zodResolver(clientesSchema),
    defaultValues: {
name: '',
      identity_Card: 0,
      phone: 0,
      address: '',
    },
    mode: 'onSubmit',
  });

  const editForm = useForm<clientesFormData>({
    resolver: zodResolver(clientesSchema),
    defaultValues: {
name: '',
      identity_Card: 0,
      phone: 0,
      address: '',
    },
    mode: 'onSubmit',
  });

  const handleEdit = (clientes: Clientes) => {
    setEditingClientes(clientes);
    editForm.reset({
name: clientes.name || '',
      identity_Card: clientes.identity_Card ?? 0,
      phone: clientes.phone ?? 0,
      address: clientes.address || '',
    });
    setIsEditModalOpen(true);
  };

  const handleCreate = () => {
    createForm.reset();
    setIsCreateModalOpen(true);
  };

  const handleDeleteClick = (clientes: Clientes) => {
    setClientesToDelete(clientes);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (clientesToDelete) {
      setClientess(clientess.filter(p => p.id !== clientesToDelete!.id));
      setIsDeleteDialogOpen(false);
      setClientesToDelete(null);
      toast({ variant: 'success', title: 'Clientes eliminado', description: 'Registro eliminado exitosamente.' });
    }
  };

  const handleSaveEdit = async (data: clientesFormData) => {
    if (editingClientes) {
      setClientess(clientess.map(p =>
        p.id === editingClientes!.id ? { ...p, ...data } as Clientes : p
      ));
      setIsEditModalOpen(false);
      setEditingClientes(null);
      editForm.reset();
      toast({ variant: 'success', title: 'Clientes actualizado', description: 'Registro actualizado exitosamente.' });
    }
  };

  const handleSaveCreate = async (data: clientesFormData) => {
    const newClientes: Clientes = {
      id: Math.max(...clientess.map(p => p.id), 0) + 1,
name: data.name,
      identity_Card: data.identity_Card,
      phone: data.phone,
      address: data.address,
    };
    setClientess([...clientess, newClientes]);
    setIsCreateModalOpen(false);
    createForm.reset();
    toast({ variant: 'success', title: 'Clientes creado', description: 'Registro creado exitosamente.' });
  };

  const columns: DataTableColumn<Clientes>[] = [
{
      id: 'name',
      header: 'Name',
      cell: ({ item }) => <span>{String(item.name)}</span>,
    },
    {
      id: 'identity_Card',
      header: 'Identity_Card',
      cell: ({ item }) => <span>{String(item.identity_Card)}</span>,
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: ({ item }) => <span>{String(item.phone)}</span>,
      hideBelow: 'md' as const,
      mobileLabel: 'Phone',
    },
    {
      id: 'address',
      header: 'Address',
      cell: ({ item }) => <span>{String(item.address)}</span>,
      hideBelow: 'md' as const,
      mobileLabel: 'Address',
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ item }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
            <PencilSimple className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(item)}>
            <Trash className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-500">Administra los clientess del sistema</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Clientes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500">Total Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientess.length}</div>
          </CardContent>
        </Card>
      </div>

      <DataTable<Clientes>
        items={clientess}
        columns={columns}
        rowKey={({ item }) => String(item.id)}
        wrapInCard
      />

      <EditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Editar Clientes"
        description="Modifica la información del clientes seleccionado"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
            <Button onClick={editForm.handleSubmit(handleSaveEdit)} disabled={editForm.formState.isSubmitting}>Guardar Cambios</Button>
          </>
        }
      >
        <form onSubmit={editForm.handleSubmit(handleSaveEdit)} className="space-y-4">
<ValidatedInput
            label="Name"
            name="name"
            control={editForm.control}
            placeholder="Ej: ..."
            required={true}
          />

          <ValidatedInput
            label="Identity_Card"
            name="identity_Card"
            control={editForm.control}
            placeholder="Ej: ..." type="number" step="1"
            required={true}
          />

          <ValidatedInput
            label="Phone"
            name="phone"
            control={editForm.control}
            placeholder="Ej: ..." type="number" step="1"
            required={false}
          />

          <ValidatedTextarea
            label="Address"
            name="address"
            control={editForm.control}
            placeholder="Describe..."
            rows={3}
          />
        </form>
      </EditModal>

      <EditModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        title="Nuevo Clientes"
        description="Ingresa la información del nuevo clientes"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
            <Button onClick={createForm.handleSubmit(handleSaveCreate)} disabled={createForm.formState.isSubmitting}>Crear Clientes</Button>
          </>
        }
      >
        <form onSubmit={createForm.handleSubmit(handleSaveCreate)} className="space-y-4">
<ValidatedInput
            label="Name"
            name="name"
            control={createForm.control}
            placeholder="Ej: ..."
            required={true}
          />

          <ValidatedInput
            label="Identity_Card"
            name="identity_Card"
            control={createForm.control}
            placeholder="Ej: ..." type="number" step="1"
            required={true}
          />

          <ValidatedInput
            label="Phone"
            name="phone"
            control={createForm.control}
            placeholder="Ej: ..." type="number" step="1"
            required={false}
          />

          <ValidatedTextarea
            label="Address"
            name="address"
            control={createForm.control}
            placeholder="Describe..."
            rows={3}
          />
        </form>
      </EditModal>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Confirmar Eliminación"
        description={`¿Estás seguro de que deseas eliminar este clientes? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
