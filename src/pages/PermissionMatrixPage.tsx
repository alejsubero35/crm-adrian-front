import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { rbacService, type RoleItem, type PermissionItem } from '@/services/rbac.service';

export default function PermissionMatrixPage() {
  const { toast } = useToast();
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissionsByCategory, setPermissionsByCategory] = useState<Record<string, PermissionItem[]>>({});
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await rbacService.getRolesPermissions();
      setRoles(data.roles);
      setPermissionsByCategory(data.permissions_by_category);
      if (data.roles.length > 0) {
        const firstRole = data.roles[0];
        setSelectedRoleId(String(firstRole.id));
        setSelectedPermissions(firstRole.permissions);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error cargando matriz',
        description: error instanceof Error ? error.message : 'No se pudo cargar permisos.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const selectedRole = useMemo(
    () => roles.find((role) => String(role.id) === selectedRoleId) ?? null,
    [roles, selectedRoleId]
  );

  const onChangeRole = (roleId: string) => {
    setSelectedRoleId(roleId);
    const role = roles.find((item) => String(item.id) === roleId);
    setSelectedPermissions(role?.permissions ?? []);
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission) ? prev.filter((item) => item !== permission) : [...prev, permission]
    );
  };

  const savePermissions = async () => {
    if (!selectedRole) return;
    try {
      setSaving(true);
      await rbacService.syncRolePermissions(selectedRole.id, selectedPermissions);
      toast({
        variant: 'success',
        title: 'Permisos actualizados',
        description: `Rol ${selectedRole.name} sincronizado correctamente.`,
      });
      await loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo guardar',
        description: error instanceof Error ? error.message : 'Error inesperado.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Matriz de permisos</h1>
          <p className="text-sm text-muted-foreground">Gestiona permisos de Spatie por rol.</p>
        </div>
        <Button onClick={savePermissions} disabled={!selectedRole || saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rol</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedRoleId} onValueChange={onChangeRole}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={String(role.id)}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando permisos...</p>
      ) : (
        Object.entries(permissionsByCategory).map(([category, permissions]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-base">{category}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {permissions.map((permission) => (
                <label key={permission.id} className="flex items-center gap-2 rounded border p-2">
                  <Checkbox
                    checked={selectedPermissions.includes(permission.name)}
                    onCheckedChange={() => togglePermission(permission.name)}
                  />
                  <span className="text-sm">{permission.name}</span>
                </label>
              ))}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

