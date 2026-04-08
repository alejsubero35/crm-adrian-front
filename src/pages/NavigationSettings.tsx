import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigationConfig, AVAILABLE_ICONS, NavItem } from '@/contexts/NavigationConfigContext';
import { GripVertical, Save, RotateCcw, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function NavigationSettings() {
  const { navItems, updateNavItem, resetToDefaults, reorderNavItems } = useNavigationConfig();
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleSave = () => {
    toast.success('Configuración guardada correctamente');
  };

  const handleReset = () => {
    resetToDefaults();
    toast.info('Configuración restaurada a valores por defecto');
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const items = [...navItems];
    const draggedIndex = items.findIndex(item => item.id === draggedItem);
    const targetIndex = items.findIndex(item => item.id === targetId);

    const [removed] = items.splice(draggedIndex, 1);
    items.splice(targetIndex, 0, removed);

    reorderNavItems(items);
    setDraggedItem(null);
  };

  const setCenterItem = (itemId: string) => {
    // Remover isCenter de todos los items
    navItems.forEach(item => {
      if (item.isCenter && item.id !== itemId) {
        updateNavItem(item.id, { isCenter: false });
      }
    });
    // Establecer el nuevo item central
    updateNavItem(itemId, { isCenter: true });
    toast.success('Item central actualizado');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración de Navegación</h1>
          <p className="text-muted-foreground mt-2">
            Personaliza los items del menú de navegación inferior (mobile)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Restaurar
          </Button>
          <Button onClick={handleSave} className="gap-2 btn-primary-modern">
            <Save className="h-4 w-4" />
            Guardar
          </Button>
        </div>
      </div>

      <Card className="card-modern">
        <CardHeader>
          <CardTitle>Items de Navegación</CardTitle>
          <CardDescription>
            Arrastra para reordenar, habilita/deshabilita items, y personaliza etiquetas e iconos.
            Marca un item como central para destacarlo en el footer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {navItems.map((item, index) => {
              const IconComponent = AVAILABLE_ICONS[item.icon];
              const isEditing = editingItem === item.id;

              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, item.id)}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card transition-smooth',
                    draggedItem === item.id && 'opacity-50',
                    'hover:border-border hover:shadow-soft cursor-move'
                  )}
                >
                  {/* Drag Handle */}
                  <div className="cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>

                  {/* Order Badge */}
                  <Badge variant="outline" className="w-8 h-8 flex items-center justify-center font-semibold">
                    {index + 1}
                  </Badge>

                  {/* Icon Preview */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    {IconComponent && <IconComponent className="h-5 w-5" />}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 space-y-2">
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor={`label-${item.id}`} className="text-xs">Etiqueta</Label>
                          <Input
                            id={`label-${item.id}`}
                            value={item.label}
                            onChange={(e) => updateNavItem(item.id, { label: e.target.value })}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`icon-${item.id}`} className="text-xs">Icono</Label>
                          <Select
                            value={item.icon}
                            onValueChange={(value) => updateNavItem(item.id, { icon: value })}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(AVAILABLE_ICONS).map((iconName) => {
                                const Icon = AVAILABLE_ICONS[iconName];
                                return (
                                  <SelectItem key={iconName} value={iconName}>
                                    <div className="flex items-center gap-2">
                                      <Icon className="h-4 w-4" />
                                      <span>{iconName}</span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1 col-span-2">
                          <Label htmlFor={`href-${item.id}`} className="text-xs">Ruta</Label>
                          <Input
                            id={`href-${item.id}`}
                            value={item.href}
                            onChange={(e) => updateNavItem(item.id, { href: e.target.value })}
                            className="h-9"
                            placeholder="/ruta"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.label}</span>
                          {item.isCenter && (
                            <Badge className="badge-primary gap-1">
                              <Star className="h-3 w-3" />
                              Central
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.href}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Set as Center */}
                    {!item.isCenter && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCenterItem(item.id)}
                        className="gap-1"
                        title="Marcar como central"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}

                    {/* Edit Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingItem(isEditing ? null : item.id)}
                    >
                      {isEditing ? 'Listo' : 'Editar'}
                    </Button>

                    {/* Enable/Disable Switch */}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.enabled}
                        onCheckedChange={(checked) => updateNavItem(item.id, { enabled: checked })}
                      />
                      <Label className="text-sm text-muted-foreground">
                        {item.enabled ? 'Activo' : 'Inactivo'}
                      </Label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Preview Section */}
          <div className="mt-8 p-6 rounded-lg bg-muted/30 border border-border/50">
            <h3 className="text-sm font-semibold mb-4">Vista Previa (Mobile)</h3>
            <div className="flex items-center justify-around max-w-md mx-auto">
              {navItems
                .filter(item => item.enabled)
                .sort((a, b) => a.order - b.order)
                .map((item) => {
                  const IconComponent = AVAILABLE_ICONS[item.icon];
                  if (!IconComponent) return null;

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'flex flex-col items-center gap-1',
                        item.isCenter && 'relative -mt-6'
                      )}
                    >
                      {item.isCenter ? (
                        <div className="relative">
                          <div className="absolute inset-0 bg-primary rounded-full blur-lg opacity-30" />
                          <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-glow">
                            <IconComponent className="h-5 w-5" />
                          </div>
                        </div>
                      ) : (
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className={cn(
                        'text-[10px] font-medium',
                        item.isCenter ? 'text-primary' : 'text-muted-foreground'
                      )}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
