import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldX, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldX className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Acceso Denegado</CardTitle>
          <CardDescription>
            No tienes permisos para acceder a esta página.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-3">
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Ir al Dashboard
            </Button>
            <Button variant="outline" onClick={() => window.history.back()} className="w-full">
              Volver atrás
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
