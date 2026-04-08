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
    <div className="space-y-4 md:space-y-6">
      {/* Header Section - Responsive */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Configuración de Navegación</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
            Personaliza los items del menú de navegación inferior (mobile)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-2 flex-1 md:flex-none">
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Restaurar</span>
          </Button>
          <Button onClick={handleSave} className="gap-2 btn-primary-modern flex-1 md:flex-none">
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Guardar</span>
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
          <div className="space-y-2 md:space-y-3">
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
                    'flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg border border-border/50 bg-card transition-smooth',
                    draggedItem === item.id && 'opacity-50',
                    'hover:border-border hover:shadow-soft cursor-move'
                  )}
                >
                  {/* Mobile: Top Row - Drag, Badge, Icon, Title */}
                  <div className="flex items-center gap-3 md:gap-4">
                    {/* Drag Handle */}
                    <div className="cursor-grab active:cursor-grabbing">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>

                    {/* Order Badge */}
                    <Badge variant="outline" className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center font-semibold text-xs md:text-sm">
                      {index + 1}
                    </Badge>

                    {/* Icon Preview */}
                    <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg bg-muted">
                      {IconComponent && <IconComponent className="h-4 w-4 md:h-5 md:w-5" />}
                    </div>

                    {/* Item Details - Mobile inline */}
                    <div className="flex-1 md:hidden">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{item.label}</span>
                        {item.isCenter && (
                          <Badge className="badge-primary gap-1 text-xs">
                            <Star className="h-2.5 w-2.5" />
                            Central
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{item.href}</p>
                    </div>
                  </div>

                  {/* Desktop: Item Details */}
                  <div className="hidden md:block flex-1 space-y-2">
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

                  {/* Mobile: Edit Form */}
                  {isEditing && (
                    <div className="md:hidden grid grid-cols-1 gap-3 pt-2 border-t border-border/30">
                      <div className="space-y-1">
                        <Label htmlFor={`label-mobile-${item.id}`} className="text-xs">Etiqueta</Label>
                        <Input
                          id={`label-mobile-${item.id}`}
                          value={item.label}
                          onChange={(e) => updateNavItem(item.id, { label: e.target.value })}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`icon-mobile-${item.id}`} className="text-xs">Icono</Label>
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
                                    <span className="text-sm">{iconName}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`href-mobile-${item.id}`} className="text-xs">Ruta</Label>
                        <Input
                          id={`href-mobile-${item.id}`}
                          value={item.href}
                          onChange={(e) => updateNavItem(item.id, { href: e.target.value })}
                          className="h-9 text-sm"
                          placeholder="/ruta"
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions - Responsive */}
                  <div className="flex items-center justify-between md:justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border/30">
                    {/* Set as Center */}
                    {!item.isCenter && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCenterItem(item.id)}
                        className="gap-1 h-8"
                        title="Marcar como central"
                      >
                        <Star className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        <span className="text-xs md:hidden">Central</span>
                      </Button>
                    )}

                    {/* Edit Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingItem(isEditing ? null : item.id)}
                      className="h-8 text-xs md:text-sm"
                    >
                      {isEditing ? 'Listo' : 'Editar'}
                    </Button>

                    {/* Enable/Disable Switch */}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.enabled}
                        onCheckedChange={(checked) => updateNavItem(item.id, { enabled: checked })}
                      />
                      <Label className="text-xs md:text-sm text-muted-foreground">
                        {item.enabled ? 'Activo' : 'Inactivo'}
                      </Label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Preview Section - Responsive */}
          <div className="mt-6 md:mt-8 p-4 md:p-6 rounded-lg bg-muted/30 border border-border/50">
            <h3 className="text-sm md:text-base font-semibold mb-3 md:mb-4 text-center md:text-left">
              Vista Previa (Mobile)
            </h3>
            <div className="flex items-center justify-around max-w-sm md:max-w-md mx-auto py-2">
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
                        item.isCenter && 'relative -mt-4 md:-mt-6'
                      )}
                    >
                      {item.isCenter ? (
                        <div className="relative">
                          <div className="absolute inset-0 bg-primary rounded-full blur-lg opacity-30" />
                          <div className="relative flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-glow">
                            <IconComponent className="h-4 w-4 md:h-5 md:w-5" />
                          </div>
                        </div>
                      ) : (
                        <IconComponent className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                      )}
                      <span className={cn(
                        'text-[9px] md:text-[10px] font-medium text-center',
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
