import React from 'react';
import { GenericModule } from '@/components/shared/GenericModule';
import { CrudConfig } from '@/types/crud.types';
import { Edit, Trash2, Eye } from 'lucide-react';

// Example User interface
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive';
  created_at: string;
}

// Example CRUD configuration
const userCrudConfig: CrudConfig<User> = {
  endpoint: '/users',
  title: 'Usuario',
  pluralTitle: 'Usuarios',
  
  // Table columns
  columns: [
    {
      key: 'name',
      label: 'Nombre',
      type: 'text',
      sortable: true,
      filterable: true,
    },
    {
      key: 'email',
      label: 'Correo',
      type: 'text',
      sortable: true,
      filterable: true,
    },
    {
      key: 'role',
      label: 'Rol',
      type: 'badge',
      sortable: true,
      filterable: true,
      badgeVariant: (value) => {
        switch (value) {
          case 'admin': return 'destructive';
          case 'moderator': return 'default';
          case 'user': return 'secondary';
          default: return 'outline';
        }
      },
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'badge',
      sortable: true,
      filterable: true,
      badgeVariant: (value) => value === 'active' ? 'default' : 'secondary',
    },
    {
      key: 'created_at',
      label: 'Fecha de Creación',
      type: 'date',
      sortable: true,
    },
    {
      key: 'actions',
      label: 'Acciones',
      type: 'actions',
    },
  ],
  
  // Form fields
  fields: [
    {
      name: 'name',
      label: 'Nombre Completo',
      type: 'text',
      required: true,
      placeholder: 'Juan Pérez',
      validation: {
        min: 2,
        max: 100,
        message: 'El nombre debe tener entre 2 y 100 caracteres',
      },
    },
    {
      name: 'email',
      label: 'Correo Electrónico',
      type: 'email',
      required: true,
      placeholder: 'correo@ejemplo.com',
      validation: {
        pattern: '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$',
        message: 'Correo inválido',
      },
    },
    {
      name: 'role',
      label: 'Rol',
      type: 'select',
      required: true,
      options: [
        { value: 'user', label: 'Usuario' },
        { value: 'moderator', label: 'Moderador' },
        { value: 'admin', label: 'Administrador' },
      ],
    },
    {
      name: 'status',
      label: 'Estado',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { value: 'active', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' },
      ],
    },
  ],
  
  // Actions
  actions: [
    {
      key: 'view',
      label: 'Ver',
      icon: <Eye className="h-4 w-4" />,
      onClick: (item) => {
        console.log('View item:', item);
        // Implement view logic
      },
      variant: 'ghost',
    },
    {
      key: 'edit',
      label: 'Editar',
      icon: <Edit className="h-4 w-4" />,
      onClick: (item) => {
        console.log('Edit item:', item);
        // This will be handled by the GenericModule
      },
      variant: 'ghost',
    },
    {
      key: 'delete',
      label: 'Eliminar',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (item) => {
        console.log('Delete item:', item);
        // This will be handled by the GenericModule
      },
      variant: 'destructive',
      show: (item) => item.role !== 'admin', // Don't show delete for admin users
    },
  ],
  
  // Permissions
  permissions: {
    create: true,
    edit: true,
    delete: true,
    view: true,
  },
  
  // Features
  features: {
    search: true,
    pagination: true,
    sorting: true,
    filtering: true,
    bulkActions: true,
    export: true,
  },
  
  // Customization
  pageSize: 10,
  emptyStateMessage: 'No se encontraron usuarios',
  createButtonLabel: 'Nuevo Usuario',
  
  // Hooks (optional)
  onBeforeCreate: (data) => {
    console.log('Before create:', data);
    // Add created_at timestamp
    return {
      ...data,
      created_at: new Date().toISOString(),
    };
  },
  
  onAfterCreate: (item) => {
    console.log('User created:', item);
    // Show success notification
  },
  
  onBeforeUpdate: (id, data) => {
    console.log('Before update:', id, data);
    return data;
  },
  
  onAfterUpdate: (item) => {
    console.log('User updated:', item);
    // Show success notification
  },
  
  onBeforeDelete: (id) => {
    console.log('Before delete:', id);
    // Show confirmation dialog
  },
  
  onAfterDelete: (id) => {
    console.log('User deleted:', id);
    // Show success notification
  },
};

export default function ExampleCrudPage() {
  return (
    <div>
      <GenericModule config={userCrudConfig} />
    </div>
  );
}
