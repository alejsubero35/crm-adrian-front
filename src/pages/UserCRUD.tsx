import React, { useMemo, useState } from 'react';
import { GenericForm, FormFieldConfig } from '@/components/forms/GenericForm';
import { CustomButton } from '@/components/ui/custom-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, type DataTableColumn } from '@/components/DataTable';
import { useDemoAuth } from '@/features/auth/DemoAuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Users, Calendar, Shield } from 'lucide-react';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import { z } from 'zod';
import { rbacService } from '@/services/rbac.service';

type UserRow = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastLogin: string | null;
};

export default function UserCRUD() {
  const { user: currentUser, hasRole } = useDemoAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [listLoading, setListLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(false);

  const loadRoleManagerData = async () => {
    try {
      setListLoading(true);
      const [usersResponse, rolePermissionResponse] = await Promise.all([
        rbacService.getUsers(),
        rbacService.getRolesPermissions(),
      ]);
      setUsers(
        usersResponse.data.map((user) => ({
          id: user.id,
          name: `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.email,
          email: user.email,
          role: user.roles?.[0] ?? 'sin-rol',
          status: 'active',
          createdAt: '-',
          lastLogin: null,
        }))
      );
      setAvailableRoles(rolePermissionResponse.roles.map((role) => role.name));
    } catch (error) {
      console.warn('No se pudo cargar data de roles/permisos', error);
      toast({
        variant: 'destructive',
        title: 'Error cargando usuarios',
        description: error instanceof Error ? error.message : 'No se pudo cargar la informacion de usuarios.',
      });
    } finally {
      setListLoading(false);
    }
  };

  React.useEffect(() => {
    void loadRoleManagerData();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) =>
      [user.name, user.email, user.role]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [users, search]);

  const createFormFields: FormFieldConfig[] = useMemo(() => {
    const roleOptions = availableRoles.map((role) => ({
      value: role,
      label: role,
    }));
    return [
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
        options: roleOptions,
        validation: z.string().min(1, 'Debes seleccionar un rol'),
      },
      {
        name: 'password',
        label: 'Contraseña',
        type: 'password',
        placeholder: 'Minimo 8 caracteres',
        required: true,
        validation: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
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
          { value: 'pending', label: 'Pendiente' },
        ],
        validation: z.enum(['active', 'inactive', 'pending']),
      },
    ];
  }, [availableRoles]);

  const editFormFields: FormFieldConfig[] = useMemo(() => {
    const roleOptions = availableRoles.map((role) => ({
      value: role,
      label: role,
    }));
    return [
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
        options: roleOptions,
        validation: z.string().min(1, 'Debes seleccionar un rol'),
      },
      {
        name: 'password',
        label: 'Contraseña',
        type: 'password',
        placeholder: 'Dejar vacio para no cambiar (minimo 8 caracteres)',
        required: false,
        validation: z.string().refine((val) => val.trim() === '' || val.length >= 8, {
          message: 'La contraseña debe tener al menos 8 caracteres',
        }),
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
  }, [availableRoles]);

  const statusBadge = (status: UserRow['status']) => {
    const statusConfig = {
      active: { label: 'Activo', variant: 'default' as const },
      inactive: { label: 'Inactivo', variant: 'secondary' as const },
      pending: { label: 'Pendiente', variant: 'outline' as const },
    };
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns: DataTableColumn<UserRow>[] = [
    {
      id: 'name',
      header: 'Nombre',
      cell: ({ item }) => (
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground truncate">{item.email}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'role',
      header: 'Rol',
      cell: ({ item }) => {
        const variant = item.role === 'admin' ? 'destructive' : 'secondary';
        return <Badge variant={variant}>{item.role || 'sin-rol'}</Badge>;
      },
      hideBelow: 'md',
      mobileLabel: 'Rol',
    },
    {
      id: 'status',
      header: 'Estado',
      cell: ({ item }) => statusBadge(item.status),
      hideBelow: 'md',
      mobileLabel: 'Estado',
    },
    {
      id: 'createdAt',
      header: 'Creado',
      cell: ({ item }) => (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>{item.createdAt}</span>
        </div>
      ),
      hideBelow: 'lg',
      mobileLabel: 'Creado',
    },
    {
      id: 'lastLogin',
      header: 'Último acceso',
      cell: ({ item }) => (
        <div className="flex items-center gap-2 text-sm">
          {item.lastLogin ? (
            <>
              <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>{item.lastLogin}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Nunca</span>
          )}
        </div>
      ),
      hideBelow: 'lg',
      mobileLabel: 'Último acceso',
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ item }) => {
        const canEdit = hasRole('admin') || item.id === currentUser?.id;
        const canDelete = hasRole('admin') && item.id !== currentUser?.id;
        return (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={!canEdit}
              onClick={() => setEditingUser(item)}
            >
              <PencilSimple className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:border-red-300"
              disabled={!canDelete}
              onClick={async () => {
                if (!window.confirm(`¿Estás seguro de eliminar a ${item.name}?`)) return;
                try {
                  await rbacService.deleteUser(item.id);
                  await loadRoleManagerData();
                  toast({
                    variant: 'success',
                    title: 'Usuario eliminado',
                    description: 'El usuario se elimino correctamente.',
                  });
                } catch (error) {
                  toast({
                    variant: 'destructive',
                    title: 'No se pudo eliminar',
                    description: error instanceof Error ? error.message : 'Error inesperado.',
                  });
                }
              }}
            >
              <Trash className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Form submission handlers
  const handleCreateUser = async (data: any) => {
    setLoading(true);
    try {
      await rbacService.createUser({
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        password: data.password || undefined,
      });
      await loadRoleManagerData();
      setIsCreateDialogOpen(false);
      toast({
        variant: 'success',
        title: 'Usuario creado',
        description: 'El usuario se guardo correctamente.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo crear',
        description: error instanceof Error ? error.message : 'Error inesperado.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (data: any) => {
    if (!editingUser) return;
    
    setLoading(true);
    try {
      await rbacService.updateUser(editingUser.id, {
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        password: data.password || undefined,
      });
      await loadRoleManagerData();
      setEditingUser(null);
      toast({
        variant: 'success',
        title: 'Usuario actualizado',
        description: 'Los cambios se guardaron correctamente.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo actualizar',
        description: error instanceof Error ? error.message : 'Error inesperado.',
      });
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
              key="create-user"
              fields={createFormFields}
              onSubmit={handleCreateUser}
              loading={loading}
              onCancel={() => setIsCreateDialogOpen(false)}
              defaultValues={{ status: 'active' }}
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
              {users.length
                ? `${Math.round((users.filter((u) => u.status === 'active').length / users.length) * 100)}% del total`
                : '0% del total'}
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

      {/*
      Sección retirada: "Asignación de rol de usuario" (lista con Select por fila).
      El rol del usuario se gestiona desde el modal Editar usuario.
      */}

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Lista de usuarios</h2>
          <p className="text-sm text-muted-foreground">Todos los usuarios registrados en el sistema</p>
        </div>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, correo o rol..."
        />
        {listLoading ? (
          <p className="text-sm text-muted-foreground">Cargando usuarios...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {users.length === 0
              ? 'No hay usuarios. Crea el primero con el botón Nuevo Usuario.'
              : 'Ningún usuario coincide con la búsqueda.'}
          </p>
        ) : (
          <DataTable<UserRow>
            items={filteredUsers}
            columns={columns}
            rowKey={({ item }) => String(item.id)}
            wrapInCard
          />
        )}
      </div>

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
              key={editingUser.id}
              fields={editFormFields}
              onSubmit={handleUpdateUser}
              loading={loading}
              onCancel={() => setEditingUser(null)}
              defaultValues={{
                ...editingUser,
                password: '',
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
