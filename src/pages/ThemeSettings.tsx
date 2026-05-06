import React, { useState } from 'react';
import { Palette, RotateCcw, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  applyThemeConfig,
  getThemeConfig,
  resetThemeConfig,
  saveThemeConfig,
  type ThemeConfig,
} from '@/lib/themeConfig';

export default function ThemeSettings() {
  const { toast } = useToast();
  const [theme, setTheme] = useState<ThemeConfig>(() => getThemeConfig());

  const updateTheme = (next: ThemeConfig) => {
    setTheme(next);
    applyThemeConfig(next);
  };

  const handleSave = () => {
    saveThemeConfig(theme);
    toast({
      variant: 'success',
      title: 'Tema guardado',
      description: 'Los colores se aplicaron globalmente.',
    });
  };

  const handleReset = () => {
    const defaults = resetThemeConfig();
    setTheme(defaults);
    toast({
      variant: 'success',
      title: 'Tema restaurado',
      description: 'Se restauraron los colores predeterminados.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Apariencia</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Personaliza sidebar, texto del menú y color predominante del sistema.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Colores del tema
          </CardTitle>
          <CardDescription>
            Cambios en vivo. Guarda para persistir entre sesiones.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Color del sidebar</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={theme.sidebarColor}
                className="h-10 w-14 p-1"
                onChange={(e) => updateTheme({ ...theme, sidebarColor: e.target.value })}
              />
              <Input
                value={theme.sidebarColor}
                onChange={(e) => updateTheme({ ...theme, sidebarColor: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color de letras del menú</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={theme.sidebarTextColor}
                className="h-10 w-14 p-1"
                onChange={(e) => updateTheme({ ...theme, sidebarTextColor: e.target.value })}
              />
              <Input
                value={theme.sidebarTextColor}
                onChange={(e) => updateTheme({ ...theme, sidebarTextColor: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color predominante</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={theme.primaryColor}
                className="h-10 w-14 p-1"
                onChange={(e) => updateTheme({ ...theme, primaryColor: e.target.value })}
              />
              <Input
                value={theme.primaryColor}
                onChange={(e) => updateTheme({ ...theme, primaryColor: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
