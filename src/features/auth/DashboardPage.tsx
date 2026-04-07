import React from 'react';
import { useDemoAuth, User } from './DemoAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const { user, logout, hasRole, isDemoMode } = useDemoAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderRoles = () => {
    if (!user?.roles) return null;
    
    const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
    
    return roles.map((role, index) => {
      const roleName = typeof role === 'string' ? role : role.name || role.slug;
      return (
        <Badge key={index} variant="secondary" className="mr-2">
          {roleName}
        </Badge>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isDemoMode && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-green-800">Modo Demo Activo</h3>
                <p className="text-xs text-green-600 mt-1">
                  Estás navegando con datos simulados. Los cambios no persisten.
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                DEMO
              </Badge>
            </div>
          </div>
        )}
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Bienvenido al sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de Usuario</CardTitle>
              <CardDescription>Detalles de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="font-medium">{user?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Correo</p>
                  <p className="font-medium">{user?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Roles</p>
                  <div className="mt-1">
                    {renderRoles() || <span className="text-gray-400">Sin roles asignados</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>Operaciones comunes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hasRole('admin') && (
                  <Button variant="outline" className="w-full justify-start">
                    Administración
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start">
                  Configuración
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Ayuda
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sesión</CardTitle>
              <CardDescription>Control de tu sesión</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <p className="font-medium text-green-600">Activa</p>
                </div>
                <Button 
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full"
                >
                  Cerrar Sesión
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Ejemplo de CRUD</CardTitle>
              <CardDescription>
                Este es un ejemplo de cómo se vería un módulo CRUD genérico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Aquí se integraría el componente GenericModule con la configuración
                adecuada para mostrar, crear, editar y eliminar recursos.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
