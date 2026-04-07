import React, { useEffect } from 'react';
import { GenericTable } from './GenericTable';
import { DynamicForm } from './DynamicForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CrudConfig } from '@/types/crud.types';
import createCrudContext from '@/hooks/useCrud';

interface GenericModuleProps<T> {
  config: CrudConfig<T>;
}

export function GenericModule<T extends { id: string | number }>({ config }: GenericModuleProps<T>) {
  const { useCrud } = createCrudContext<T>();
  const {
    items,
    loading,
    error,
    pagination,
    sorting,
    selectedItems,
    isCreateModalOpen,
    isEditModalOpen,
    editingItem,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    setPagination,
    setSorting,
    setSelectedItems,
    openCreateModal,
    openEditModal,
    closeModals,
  } = useCrud();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleEdit = (item: T) => {
    openEditModal(item);
  };

  const handleDelete = async (id: string | number) => {
    await deleteItem(id);
  };

  const handleCreate = async (data: any) => {
    await createItem(data);
  };

  const handleUpdate = async (data: any) => {
    if (editingItem) {
      await updateItem(editingItem.id, data);
    }
  };

  const handlePaginationChange = (page: number) => {
    setPagination(page, pagination.limit);
    fetchItems();
  };

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSorting(field, direction);
    fetchItems();
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => fetchItems()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{config.pluralTitle || config.title}</h1>
        <p className="mt-2 text-gray-600">
          Gestiona los {config.pluralTitle?.toLowerCase() || config.title.toLowerCase()} del sistema
        </p>
      </div>

      <GenericTable
        config={config}
        items={items}
        isLoading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        onSort={handleSort}
        currentSort={sorting}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
      />

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={closeModals}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear {config.title}</DialogTitle>
            <DialogDescription>
              Completa el formulario para crear un nuevo {config.title.toLowerCase()}
            </DialogDescription>
          </DialogHeader>
          <DynamicForm
            fields={config.fields}
            onSubmit={handleCreate}
            onCancel={closeModals}
            title={`Crear ${config.title}`}
            submitLabel="Crear"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={closeModals}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar {config.title}</DialogTitle>
            <DialogDescription>
              Modifica los datos del {config.title.toLowerCase()}
            </DialogDescription>
          </DialogHeader>
          <DynamicForm
            fields={config.fields}
            onSubmit={handleUpdate}
            onCancel={closeModals}
            initialData={editingItem}
            title={`Editar ${config.title}`}
            submitLabel="Actualizar"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
