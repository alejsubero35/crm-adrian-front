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
import { proveedoresSchema, proveedoresFormData } from '@/validations/proveedores.schema';
import { ValidatedInput } from '@/components/ui/ValidatedInput';
import { ValidatedSelect } from '@/components/ui/ValidatedSelect';
import { ValidatedTextarea } from '@/components/ui/ValidatedTextarea';
import { ValidatedCheckbox } from '@/components/ui/ValidatedCheckbox';

type Proveedores = {
  id: number;
name: string;
  identity_card: number;
  address?: string;
};

export default function ProveedoresCRUD() {
  const { toast } = useToast();
  
  const [proveedoress, setProveedoress] = useState<Proveedores[]>([
{ id: 1, name: 'name 1', identity_card: 67, address: 'address 1' },
    { id: 2, name: 'name 2', identity_card: 86, address: 'address 2' },
    { id: 3, name: 'name 3', identity_card: 34, address: 'address 3' },
  ]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProveedores, setEditingProveedores] = useState<Proveedores | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [proveedoresToDelete, setProveedoresToDelete] = useState<Proveedores | null>(null);

  const createForm = useForm<proveedoresFormData>({
    resolver: zodResolver(proveedoresSchema),
    defaultValues: {
name: '',
      identity_card: 0,
      address: '',
    },
    mode: 'onSubmit',
  });

  const editForm = useForm<proveedoresFormData>({
    resolver: zodResolver(proveedoresSchema),
    defaultValues: {
name: '',
      identity_card: 0,
      address: '',
    },
    mode: 'onSubmit',
  });

  const handleEdit = (proveedores: Proveedores) => {
    setEditingProveedores(proveedores);
    editForm.reset({
name: proveedores.name || '',
      identity_card: proveedores.identity_card ?? 0,
      address: proveedores.address || '',
    });
    setIsEditModalOpen(true);
  };

  const handleCreate = () => {
    createForm.reset();
    setIsCreateModalOpen(true);
  };

  const handleDeleteClick = (proveedores: Proveedores) => {
    setProveedoresToDelete(proveedores);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (proveedoresToDelete) {
      setProveedoress(proveedoress.filter(p => p.id !== proveedoresToDelete!.id));
      setIsDeleteDialogOpen(false);
      setProveedoresToDelete(null);
      toast({ variant: 'success', title: 'Proveedores eliminado', description: 'Registro eliminado exitosamente.' });
    }
  };

  const handleSaveEdit = async (data: proveedoresFormData) => {
    if (editingProveedores) {
      setProveedoress(proveedoress.map(p =>
        p.id === editingProveedores!.id ? { ...p, ...data } as Proveedores : p
      ));
      setIsEditModalOpen(false);
      setEditingProveedores(null);
      editForm.reset();
      toast({ variant: 'success', title: 'Proveedores actualizado', description: 'Registro actualizado exitosamente.' });
    }
  };

  const handleSaveCreate = async (data: proveedoresFormData) => {
    const newProveedores: Proveedores = {
      id: Math.max(...proveedoress.map(p => p.id), 0) + 1,
name: data.name,
      identity_card: data.identity_card,
      address: data.address,
    };
    setProveedoress([...proveedoress, newProveedores]);
    setIsCreateModalOpen(false);
    createForm.reset();
    toast({ variant: 'success', title: 'Proveedores creado', description: 'Registro creado exitosamente.' });
  };

  const columns: DataTableColumn<Proveedores>[] = [
{
      id: 'name',
      header: 'Nombre',
      cell: ({ item }) => <span>{String(item.name)}</span>,
    },
    {
      id: 'identity_card',
      header: 'Rif',
      cell: ({ item }) => <span>{String(item.identity_card)}</span>,
    },
    {
      id: 'address',
      header: 'Dirección',
      cell: ({ item }) => <span>{String(item.address)}</span>,
      hideBelow: 'md' as const,
      mobileLabel: 'Dirección',
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
          <h1 className="text-2xl font-bold text-slate-900">Lista Proveedores</h1>
          <p className="text-slate-500">Administra los proveedoress del sistema</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proveedores
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500">Total Proveedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proveedoress.length}</div>
          </CardContent>
        </Card>
      </div>

      <DataTable<Proveedores>
        items={proveedoress}
        columns={columns}
        rowKey={({ item }) => String(item.id)}
        wrapInCard
      />

      <EditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Editar Proveedores"
        description="Modifica la información del proveedores seleccionado"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
            <Button onClick={editForm.handleSubmit(handleSaveEdit)} disabled={editForm.formState.isSubmitting}>Guardar Cambios</Button>
          </>
        }
      >
        <form onSubmit={editForm.handleSubmit(handleSaveEdit)} className="space-y-4">
<ValidatedInput
            label="Nombre"
            name="name"
            control={editForm.control}
            placeholder="Ej: ..."
            required={true}
          />

          <ValidatedInput
            label="Rif"
            name="identity_card"
            control={editForm.control}
            placeholder="Ej: ..." type="number" step="1"
            required={true}
          />

          <ValidatedTextarea
            label="Dirección"
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
        title="Nuevo Proveedores"
        description="Ingresa la información del nuevo proveedores"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
            <Button onClick={createForm.handleSubmit(handleSaveCreate)} disabled={createForm.formState.isSubmitting}>Crear Proveedores</Button>
          </>
        }
      >
        <form onSubmit={createForm.handleSubmit(handleSaveCreate)} className="space-y-4">
<ValidatedInput
            label="Nombre"
            name="name"
            control={createForm.control}
            placeholder="Ej: ..."
            required={true}
          />

          <ValidatedInput
            label="Rif"
            name="identity_card"
            control={createForm.control}
            placeholder="Ej: ..." type="number" step="1"
            required={true}
          />

          <ValidatedTextarea
            label="Dirección"
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
        description={`¿Estás seguro de que deseas eliminar este proveedores? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
