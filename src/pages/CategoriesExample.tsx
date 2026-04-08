import React, { useState } from 'react';
import { GenericTable } from '@/components/tables/GenericTable';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  code: string;
  slug: string;
  status: string;
}

const mockCategories: Category[] = [
  {
    id: 1,
    name: 'CONFITERÍA',
    code: '12',
    slug: 'confiteria',
    status: 'Activo',
  },
  {
    id: 2,
    name: 'SERVICIOS Y RECARGAS',
    code: '11',
    slug: 'servicios-y-recargas',
    status: 'Activo',
  },
  {
    id: 3,
    name: 'QUINCALLERÍA Y MISCELÁNEOS',
    code: '10',
    slug: 'quincalleria-y-miscelaneos',
    status: 'Activo',
  },
];

export default function CategoriesExample() {
  const [categories] = useState<Category[]>(mockCategories);

  const handleEdit = (row: Category) => {
    console.log('Editar:', row);
  };

  const handleDelete = (row: Category) => {
    console.log('Eliminar:', row);
  };

  const handleAdd = () => {
    console.log('Nueva categoría');
  };

  return (
    <div className="space-y-6">
      <GenericTable
        title="Categorías de Productos"
        data={categories}
        columns={[
          {
            key: 'id',
            label: '#',
            width: '60px',
            className: 'font-medium text-muted-foreground',
          },
          {
            key: 'name',
            label: 'Nombre',
            sortable: true,
            render: (value) => (
              <span className="font-medium text-primary hover:underline cursor-pointer">
                {value}
              </span>
            ),
          },
          {
            key: 'code',
            label: 'Código',
            align: 'right',
            width: '100px',
          },
        ]}
        actions={[
          {
            key: 'edit',
            label: 'Editar',
            icon: <Edit className="h-4 w-4" />,
            onClick: handleEdit,
          },
          {
            key: 'delete',
            label: 'Eliminar',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: handleDelete,
            variant: 'destructive',
          },
        ]}
        expandable={true}
        onRowExpand={(row) => (
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-medium">Slug:</span>
              <Badge className="badge-primary">{row.slug}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-medium">Estado:</span>
              <Badge className="badge-success">{row.status}</Badge>
            </div>
          </div>
        )}
        searchable={true}
        onAdd={handleAdd}
        pagination={{
          page: 1,
          pageSize: 10,
          total: categories.length,
          onPageChange: (page) => console.log('Page:', page),
          onPageSizeChange: (size) => console.log('Page size:', size),
        }}
      />
    </div>
  );
}
