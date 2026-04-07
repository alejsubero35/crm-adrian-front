import React, { useState } from 'react';
import { GenericTable } from '@/components/tables/GenericTable';
import { GenericForm, FormFieldConfig } from '@/components/forms/GenericForm';
import { CustomButton } from '@/components/ui/custom-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useDemoAuth } from '@/features/auth/DemoAuthContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  Users,
  Mail,
  Calendar,
  Shield
} from 'lucide-react';
import { z } from 'zod';

// Mock data
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-15',
    lastLogin: '2024-03-10',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'user',
    status: 'active',
    createdAt: '2024-02-20',
    lastLogin: '2024-03-09',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'manager',
    status: 'inactive',
    createdAt: '2024-01-25',
    lastLogin: '2024-02-28',
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    role: 'user',
    status: 'active',
    createdAt: '2024-03-01',
    lastLogin: '2024-03-10',
  },
  {
    id: 5,
    name: 'Charlie Wilson',
    email: 'charlie.wilson@example.com',
    role: 'user',
    status: 'pending',
    createdAt: '2024-03-05',
    lastLogin: null,
  },
];

export default function UserCRUD() {
  const { user: currentUser, hasRole } = useDemoAuth();
  const [users, setUsers] = useState(mockUsers);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<typeof mockUsers[0] | null>(null);
  const [loading, setLoading] = useState(false);

  // Form fields configuration
  const formFields: FormFieldConfig[] = [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Ingrese el nombre completo',
      required: true,
      validation: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    },
    {
      name: 'email',
      label: 'Correo Electrónico',
      type: 'email',
      placeholder: 'correo@ejemplo.com',
      required: true,
      validation: z.string().email('Ingrese un correo válido'),
    },
    {
      name: 'role',
      label: 'Rol',
      type: 'select',
      required: true,
      options: [
        { value: 'user', label: 'Usuario' },
        { value: 'manager', label: 'Manager' },
        { value: 'admin', label: 'Administrador' },
      ],
      validation: z.enum(['user', 'manager', 'admin']),
    },
    {
      name: 'status',
      label: 'Estado',
      type: 'select',
      required: true,
      options: [
        { value: 'active', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' },
        { value: 'pending', label: 'Pendiente' },
      ],
      validation: z.enum(['active', 'inactive', 'pending']),
    },
  ];

  // Table columns configuration
  const tableColumns = [
    {
      key: 'name',
      label: 'Nombre',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-muted-foreground">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Rol',
      sortable: true,
      render: (value: string) => {
        const roleConfig = {
          admin: { label: 'Administrador', variant: 'destructive' as const },
          manager: { label: 'Manager', variant: 'default' as const },
          user: { label: 'Usuario', variant: 'secondary' as const },
        };
        
        const config = roleConfig[value as keyof typeof roleConfig];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      render: (value: string) => {
        const statusConfig = {
          active: { label: 'Activo', variant: 'default' as const },
          inactive: { label: 'Inactivo', variant: 'secondary' as const },
          pending: { label: 'Pendiente', variant: 'outline' as const },
        };
        
        const config = statusConfig[value as keyof typeof statusConfig];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: 'createdAt',
      label: 'Creado',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Último Acceso',
      sortable: true,
      render: (value: string | null) => (
        <div className="flex items-center gap-2">
          {value ? (
            <>
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{value}</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Nunca</span>
          )}
        </div>
      ),
    },
  ];

  // Table actions
  const tableActions = [
    {
      key: 'view',
      label: 'Ver',
      icon: <Eye className="h-4 w-4" />,
      onClick: (user: any) => {
        console.log('View user:', user);
      },
    },
    {
      key: 'edit',
      label: 'Editar',
      icon: <Edit className="h-4 w-4" />,
      onClick: (user: any) => {
        setEditingUser(user);
      },
      disabled: (user: any) => !hasRole('admin') && user.id !== currentUser?.id,
    },
    {
      key: 'delete',
      label: 'Eliminar',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (user: any) => {
        if (window.confirm(`¿Estás seguro de eliminar a ${user.name}?`)) {
          setUsers(users.filter(u => u.id !== user.id));
        }
      },
      variant: 'destructive' as const,
      disabled: (user: any) => !hasRole('admin') || user.id === currentUser?.id,
    },
  ];

  // Form submission handlers
  const handleCreateUser = async (data: any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser = {
        id: users.length + 1,
        ...data,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: null,
      };
      
      setUsers([...users, newUser]);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (data: any) => {
    if (!editingUser) return;
    
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...data }
          : user
      ));
      
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra los usuarios del sistema y sus permisos
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <CustomButton leftIcon={<Plus className="h-4 w-4" />}>
              Nuevo Usuario
            </CustomButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Complete el formulario para crear un nuevo usuario en el sistema.
              </DialogDescription>
            </DialogHeader>
            <GenericForm
              fields={formFields}
              onSubmit={handleCreateUser}
              loading={loading}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 respecto al mes pasado
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((users.filter(u => u.status === 'active').length / users.length) * 100)}% del total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Con acceso completo
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Esperando aprobación
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <GenericTable
        data={users}
        columns={tableColumns}
        actions={tableActions}
        title="Lista de Usuarios"
        description="Todos los usuarios registrados en el sistema"
        searchable={true}
        selectable={true}
        onSelectionChange={(selectedUsers) => {
          console.log('Selected users:', selectedUsers);
        }}
        onRefresh={() => {
          console.log('Refreshing users...');
        }}
        onExport={() => {
          console.log('Exporting users...');
        }}
        emptyState={{
          title: 'No hay usuarios',
          description: 'No se encontraron usuarios en el sistema.',
          action: {
            label: 'Crear primer usuario',
            onClick: () => setIsCreateDialogOpen(true),
          },
        }}
      />

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la información del usuario seleccionado.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <GenericForm
              fields={formFields}
              onSubmit={handleUpdateUser}
              loading={loading}
              onCancel={() => setEditingUser(null)}
              defaultValues={editingUser}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
