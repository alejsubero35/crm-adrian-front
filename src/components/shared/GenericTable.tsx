import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, DataTableColumn } from '@/components/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { CrudConfig, CrudColumn, CrudAction } from '@/types/crud.types';
import { DynamicForm } from './DynamicForm';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';

interface GenericTableProps<T> {
  config: CrudConfig<T>;
  items: T[];
  isLoading: boolean;
  onEdit: (item: T) => void;
  onDelete: (id: string | number) => void;
  onView?: (item: T) => void;
  selectedItems: (string | number)[];
  onSelectionChange: (items: (string | number)[]) => void;
  onSort: (field: string, direction: 'asc' | 'desc') => void;
  currentSort: { field: string; direction: 'asc' | 'desc' };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPaginationChange: (page: number) => void;
}

export function GenericTable<T extends { id: string | number }>({
  config,
  items,
  isLoading,
  onEdit,
  onDelete,
  onView,
  selectedItems,
  onSelectionChange,
  onSort,
  currentSort,
  pagination,
  onPaginationChange,
}: GenericTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // In a real implementation, this would trigger a search API call
  };

  const handleSort = (field: string) => {
    const direction = currentSort.field === field && currentSort.direction === 'asc' ? 'desc' : 'asc';
    onSort(field, direction);
  };

  const handleDelete = (item: T) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete.id);
      setShowDeleteDialog(false);
      setItemToDelete(null);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(items.map(item => item.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectItem = (id: string | number, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedItems, id]);
    } else {
      onSelectionChange(selectedItems.filter(itemId => itemId !== id));
    }
  };

  const renderCell = (column: CrudColumn, item: T) => {
    const value = item[column.key as keyof T];

    if (column.format) {
      return column.format(value, item);
    }

    switch (column.type) {
      case 'badge':
        return (
          <Badge variant={column.badgeVariant?.(value) || 'default'}>
            {String(value)}
          </Badge>
        );

      case 'date':
        return value ? new Date(value as string).toLocaleDateString() : '-';

      case 'boolean':
        return (
          <Badge variant={value ? 'default' : 'secondary'}>
            {value ? 'Sí' : 'No'}
          </Badge>
        );

      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : '-';

      case 'image':
        return value ? (
          <img
            src={value as string}
            alt="Preview"
            className="h-8 w-8 rounded object-cover"
          />
        ) : '-';

      case 'actions':
        return (
          <div className="flex space-x-2">
            {config.actions?.map((action) => (
              <Button
                key={action.key}
                size="sm"
                variant={action.variant || 'ghost'}
                onClick={() => action.onClick(item)}
                disabled={action.disabled?.(item) || false}
              >
                {action.icon}
              </Button>
            ))}
          </div>
        );

      default:
        return value ? String(value) : '-';
    }
  };

  const columns: DataTableColumn<T>[] = [
    ...(config.features?.bulkActions ? [
      {
        id: 'select',
        header: (
          <Checkbox
            checked={selectedItems.length === items.length && items.length > 0}
            onCheckedChange={handleSelectAll}
          />
        ),
        cell: ({ item }) => (
          <Checkbox
            checked={selectedItems.includes(item.id)}
            onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
          />
        ),
      }
    ] : []),
    ...config.columns.map((column): DataTableColumn<T> => ({
      id: column.key,
      header: (
        <div className="flex items-center space-x-2">
          <span>{column.label}</span>
          {column.sortable && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleSort(column.key)}
            >
              <ArrowUpDown className="h-3 w-3" />
            </Button>
          )}
        </div>
      ),
      cell: ({ item }) => renderCell(column, item),
    })),
  ];

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {config.features?.search && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {config.permissions?.create && (
            <Button onClick={() => {/* Open create modal */}}>
              <Plus className="h-4 w-4 mr-2" />
              {config.createButtonLabel || 'Crear'}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <DataTable
        items={items}
        columns={columns}
        rowKey={({ item }) => item.id.toString()}
        overlay={isLoading}
        overlayUseLogo={true}
        overlayTitle="CARGANDO"
        overlayMessage="Obteniendo datos..."
      />

      {/* Pagination */}
      {config.features?.pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando {items.length} de {pagination.total} resultados
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPaginationChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPaginationChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
