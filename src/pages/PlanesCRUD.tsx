import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, PencilSimple, Trash } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditModal } from '@/components/ui/EditModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable, type DataTableColumn } from '@/components/DataTable';
import { ValidatedInput } from '@/components/ui/ValidatedInput';
import { ValidatedTextarea } from '@/components/ui/ValidatedTextarea';
import { useToast } from '@/hooks/use-toast';
import { hvacService } from '@/services/hvac.service';
import type { Plan } from '@/types/hvac';
import { planSchema, type PlanFormData } from '@/validations/hvac.schema';

export default function PlanesCRUD() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  const createForm = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: { name: '', description: '', maintenance_frequency_days: 30, monthly_amount: 0, fondo_de_cobertura: 0 },
  });

  const editForm = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: { name: '', description: '', maintenance_frequency_days: 30, monthly_amount: 0, fondo_de_cobertura: 0 },
  });

  const loadPlans = async () => {
    try {
      setLoading(true);
      setPlans(await hvacService.getPlans());
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error cargando planes',
        description: error instanceof Error ? error.message : 'No se pudo obtener la lista.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPlans();
  }, []);

  const handleCreate = async (data: PlanFormData) => {
    try {
      await hvacService.createPlan(data);
      toast({ variant: 'success', title: 'Plan creado', description: 'Frecuencia registrada correctamente.' });
      setIsCreateModalOpen(false);
      createForm.reset();
      await loadPlans();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo crear',
        description: error instanceof Error ? error.message : 'Error inesperado.',
      });
    }
  };

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan);
    editForm.reset({
      name: plan.name,
      description: plan.description ?? '',
      maintenance_frequency_days: plan.maintenance_frequency_days,
      monthly_amount: plan.monthly_amount ?? 0,
      fondo_de_cobertura: plan.fondo_de_cobertura ?? 0,
    });
    setIsEditModalOpen(true);
  };

  const handleEdit = async (data: PlanFormData) => {
    if (!editingPlan) return;
    try {
      await hvacService.updatePlan(editingPlan.id, data);
      toast({ variant: 'success', title: 'Plan actualizado', description: 'Cambios guardados correctamente.' });
      setIsEditModalOpen(false);
      setEditingPlan(null);
      await loadPlans();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo actualizar',
        description: error instanceof Error ? error.message : 'Error inesperado.',
      });
    }
  };

  const openDelete = (plan: Plan) => {
    setPlanToDelete(plan);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!planToDelete) return;
    try {
      await hvacService.deletePlan(planToDelete.id);
      toast({ variant: 'success', title: 'Plan eliminado', description: 'Registro eliminado correctamente.' });
      setIsDeleteDialogOpen(false);
      setPlanToDelete(null);
      await loadPlans();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo eliminar',
        description: error instanceof Error ? error.message : 'Error inesperado.',
      });
    }
  };

  const columns: DataTableColumn<Plan>[] = [
    {
      id: 'name',
      header: 'Plan',
      cell: ({ item }) => <span className="font-semibold">{item.name}</span>,
    },
    {
      id: 'maintenance_frequency_days',
      header: 'Frecuencia',
      cell: ({ item }) => <Badge variant="secondary">{item.maintenance_frequency_days} dias</Badge>,
      mobileLabel: 'Frecuencia',
    },
    {
      id: 'monthly_amount',
      header: 'Monto mensual',
      cell: ({ item }) => (
        <span className="tabular-nums font-medium">${(item.monthly_amount ?? 0).toFixed(2)}</span>
      ),
      hideBelow: 'md',
      mobileLabel: 'Monto mensual',
    },
    {
      id: 'fondo_de_cobertura',
      header: 'FCT inicial',
      cell: ({ item }) => (
        <span className="tabular-nums font-medium">${(item.fondo_de_cobertura ?? 0).toFixed(2)}</span>
      ),
      hideBelow: 'lg',
      mobileLabel: 'FCT inicial',
    },
    {
      id: 'description',
      header: 'Descripcion',
      cell: ({ item }) => <span>{item.description || 'Sin descripcion'}</span>,
      hideBelow: 'lg',
      mobileLabel: 'Descripcion',
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
          <h1 className="text-2xl font-bold">Planes de mantenimiento</h1>
          <p className="text-sm text-muted-foreground">La frecuencia en dias define la proxima visita tecnica.</p>
        </div>
        <Button className="hidden md:inline-flex" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo plan
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando planes...</p>
      ) : plans.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay planes registrados.</p>
      ) : (
        <DataTable<Plan>
          items={plans}
          columns={columns}
          rowKey={({ item }) => String(item.id)}
          wrapInCard
        />
      )}

      <div className="fixed bottom-24 left-0 right-0 px-4 z-20 md:hidden">
        <Button className="w-full h-12 shadow-lg" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo plan
        </Button>
      </div>

      <EditModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        title="Crear plan"
        description="Define nombre, descripcion y frecuencia."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
            <Button onClick={createForm.handleSubmit(handleCreate)}>Guardar</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={createForm.handleSubmit(handleCreate)}>
          <ValidatedInput label="Nombre" name="name" control={createForm.control} required />
          <ValidatedTextarea label="Descripcion" name="description" control={createForm.control} rows={3} />
          <ValidatedInput
            label="Frecuencia (dias)"
            name="maintenance_frequency_days"
            control={createForm.control}
            type="number"
            step="1"
            required
          />
          <ValidatedInput
            label="Monto mensual (USD)"
            name="monthly_amount"
            control={createForm.control}
            type="number"
            step="0.01"
            placeholder="0.00"
          />
          <ValidatedInput
            label="Fondo de cobertura total — FCT (USD)"
            name="fondo_de_cobertura"
            control={createForm.control}
            type="number"
            step="0.01"
            placeholder="0.00"
          />
        </form>
      </EditModal>

      <EditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Editar plan"
        description="Actualiza los datos del plan."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
            <Button onClick={editForm.handleSubmit(handleEdit)}>Guardar cambios</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={editForm.handleSubmit(handleEdit)}>
          <ValidatedInput label="Nombre" name="name" control={editForm.control} required />
          <ValidatedTextarea label="Descripcion" name="description" control={editForm.control} rows={3} />
          <ValidatedInput
            label="Frecuencia (dias)"
            name="maintenance_frequency_days"
            control={editForm.control}
            type="number"
            step="1"
            required
          />
          <ValidatedInput
            label="Monto mensual (USD)"
            name="monthly_amount"
            control={editForm.control}
            type="number"
            step="0.01"
            placeholder="0.00"
          />
          <ValidatedInput
            label="Fondo de cobertura total — FCT (USD)"
            name="fondo_de_cobertura"
            control={editForm.control}
            type="number"
            step="0.01"
            placeholder="0.00"
          />
        </form>
      </EditModal>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Confirmar eliminación"
        description={`¿Eliminar el plan "${planToDelete?.name ?? ''}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setPlanToDelete(null);
        }}
      />
    </div>
  );
}
