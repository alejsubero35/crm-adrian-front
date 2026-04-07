import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Save, RotateCcw } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">
            Gestiona la configuración del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Restablecer
          </Button>
          <Button size="sm">
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración General
            </CardTitle>
            <CardDescription>
              Configuración básica de la aplicación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre de la aplicación</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  defaultValue="CRM Dashboard"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  defaultValue="Sistema de gestión de clientes y ventas"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración de Usuario</CardTitle>
            <CardDescription>
              Preferencias de usuario y accesibilidad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Modo oscuro</label>
                <input type="checkbox" className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Notificaciones</label>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Sonidos</label>
                <input type="checkbox" className="toggle" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
