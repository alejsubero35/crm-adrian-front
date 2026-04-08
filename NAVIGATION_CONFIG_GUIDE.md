# 🧭 Guía de Configuración de Navegación - Started Kit

## 🎯 Sistema de Navegación Configurable

He implementado un sistema completo para configurar las opciones del footer de navegación desde una sección de configuración, permitiendo personalizar completamente los items del menú inferior mobile.

---

## 📋 **Características Implementadas**

### ✅ **1. Contexto de Configuración** (`NavigationConfigContext.tsx`)

**Funcionalidades:**
- ✅ Gestión centralizada de items de navegación
- ✅ Persistencia automática en localStorage
- ✅ 10 iconos disponibles de Lucide React
- ✅ Configuración de item central destacado
- ✅ Habilitar/deshabilitar items
- ✅ Reordenar items con drag & drop
- ✅ Restaurar valores por defecto

**Estructura del NavItem:**
```typescript
interface NavItem {
  id: string;           // Identificador único
  label: string;        // Etiqueta visible
  icon: string;         // Nombre del icono (string)
  href: string;         // Ruta de navegación
  enabled: boolean;     // Activo/Inactivo
  order: number;        // Orden de visualización
  isCenter?: boolean;   // Item destacado central
}
```

### ✅ **2. Página de Configuración** (`NavigationSettings.tsx`)

**Características:**
- ✅ **Drag & Drop** para reordenar items
- ✅ **Edición inline** de etiquetas, iconos y rutas
- ✅ **Switch** para habilitar/deshabilitar
- ✅ **Botón estrella** para marcar item central
- ✅ **Vista previa en tiempo real** del footer
- ✅ **Guardar/Restaurar** configuración
- ✅ **Badges visuales** para identificar estado

### ✅ **3. MobileBottomNav Dinámico**

**Actualizado para:**
- ✅ Leer configuración del contexto
- ✅ Renderizar solo items habilitados
- ✅ Respetar orden personalizado
- ✅ Destacar item central configurado
- ✅ Cargar iconos dinámicamente

---

## 🎨 **Iconos Disponibles**

```typescript
const AVAILABLE_ICONS = {
  Home,           // 🏠 Inicio
  Users,          // 👥 Usuarios/Clientes
  ShoppingBag,    // 🛍️ Productos/Tienda
  BarChart3,      // 📊 Reportes/Estadísticas
  Settings,       // ⚙️ Configuración
  Package,        // 📦 Paquetes/Inventario
  FileText,       // 📄 Documentos
  TrendingUp,     // 📈 Tendencias
  Calendar,       // 📅 Calendario
  MessageSquare,  // 💬 Mensajes
};
```

---

## 🚀 **Cómo Usar**

### **1. Acceder a la Configuración**

Navega a la página de configuración:
```
/settings/navigation
```

O agrega un enlace en tu menú de configuración:
```tsx
<Link to="/settings/navigation">
  Configurar Navegación
</Link>
```

### **2. Reordenar Items**

1. **Arrastra** el icono de grip (☰) a la izquierda de cada item
2. **Suelta** en la nueva posición deseada
3. El orden se actualiza automáticamente

### **3. Editar un Item**

1. Click en **"Editar"** en el item deseado
2. Modifica:
   - **Etiqueta**: Texto visible en el footer
   - **Icono**: Selecciona de la lista disponible
   - **Ruta**: URL de navegación (ej: `/dashboard`)
3. Click en **"Listo"** para guardar

### **4. Marcar Item Central**

1. Click en el icono de **estrella** (⭐) del item deseado
2. El item se destacará con:
   - Botón flotante con gradiente
   - Efecto glow
   - Elevación visual (-mt-8)

### **5. Habilitar/Deshabilitar**

- Usa el **Switch** a la derecha de cada item
- Items deshabilitados no aparecen en el footer
- Mínimo recomendado: 3-5 items activos

### **6. Vista Previa**

- La sección inferior muestra cómo se verá el footer
- Actualización en tiempo real
- Incluye el efecto del item central

### **7. Guardar Cambios**

- Click en **"Guardar"** (esquina superior derecha)
- Los cambios se persisten en localStorage
- Aparece notificación de confirmación

### **8. Restaurar Valores por Defecto**

- Click en **"Restaurar"**
- Vuelve a la configuración inicial:
  - Inicio, Clientes, Productos (central), Ajustes, Reportes

---

## 💾 **Persistencia de Datos**

### **LocalStorage**

Los datos se guardan automáticamente en:
```javascript
localStorage.setItem('navigation_config', JSON.stringify(navItems));
```

**Estructura guardada:**
```json
[
  {
    "id": "home",
    "label": "Inicio",
    "icon": "Home",
    "href": "/dashboard",
    "enabled": true,
    "order": 0,
    "isCenter": false
  },
  {
    "id": "products",
    "label": "Productos",
    "icon": "ShoppingBag",
    "href": "/products",
    "enabled": true,
    "order": 2,
    "isCenter": true
  }
]
```

---

## 🎯 **Configuración por Defecto**

```typescript
const DEFAULT_NAV_ITEMS = [
  {
    id: 'home',
    label: 'Inicio',
    icon: 'Home',
    href: '/dashboard',
    enabled: true,
    order: 0,
  },
  {
    id: 'clients',
    label: 'Clientes',
    icon: 'Users',
    href: '/users',
    enabled: true,
    order: 1,
  },
  {
    id: 'products',
    label: 'Productos',
    icon: 'ShoppingBag',
    href: '/products',
    enabled: true,
    order: 2,
    isCenter: true, // ⭐ Item central destacado
  },
  {
    id: 'settings',
    label: 'Ajustes',
    icon: 'Settings',
    href: '/settings',
    enabled: true,
    order: 3,
  },
  {
    id: 'reports',
    label: 'Reportes',
    icon: 'BarChart3',
    href: '/reports',
    enabled: true,
    order: 4,
  },
];
```

---

## 🔧 **API del Contexto**

### **Hooks Disponibles**

```typescript
const {
  navItems,           // Array de todos los items
  updateNavItem,      // Actualizar un item específico
  resetToDefaults,    // Restaurar configuración por defecto
  reorderNavItems,    // Cambiar orden de items
  getEnabledItems,    // Obtener solo items activos
  getCenterItem,      // Obtener item central
} = useNavigationConfig();
```

### **Ejemplos de Uso**

**Actualizar etiqueta:**
```typescript
updateNavItem('home', { label: 'Mi Inicio' });
```

**Cambiar icono:**
```typescript
updateNavItem('products', { icon: 'Package' });
```

**Deshabilitar item:**
```typescript
updateNavItem('reports', { enabled: false });
```

**Marcar como central:**
```typescript
updateNavItem('products', { isCenter: true });
```

**Obtener items activos:**
```typescript
const activeItems = getEnabledItems();
// Retorna solo items con enabled: true, ordenados
```

---

## 🎨 **Personalización Avanzada**

### **Agregar Nuevos Iconos**

Edita `NavigationConfigContext.tsx`:

```typescript
import { NewIcon } from 'lucide-react';

export const AVAILABLE_ICONS: Record<string, LucideIcon> = {
  // ... iconos existentes
  NewIcon,  // Agregar nuevo icono
};
```

### **Agregar Nuevos Items por Defecto**

Edita el array `DEFAULT_NAV_ITEMS`:

```typescript
const DEFAULT_NAV_ITEMS: NavItem[] = [
  // ... items existentes
  {
    id: 'new-item',
    label: 'Nuevo',
    icon: 'NewIcon',
    href: '/new-route',
    enabled: true,
    order: 5,
  },
];
```

### **Cambiar Límite de Items**

El footer funciona mejor con **3-5 items**. Para más items, considera:
- Usar un menú desplegable
- Crear categorías
- Implementar paginación

---

## 📱 **Responsive Behavior**

### **Mobile (< 1024px)**
- ✅ Footer visible con items configurados
- ✅ Item central flotante con glow
- ✅ Máximo 5 items recomendado

### **Desktop (≥ 1024px)**
- ✅ Footer oculto automáticamente
- ✅ Sidebar principal visible
- ✅ Configuración persiste para mobile

---

## 🎯 **Mejores Prácticas**

### **1. Número de Items**
- ✅ **Óptimo**: 5 items
- ⚠️ **Aceptable**: 3-4 items
- ❌ **Evitar**: Más de 5 items (se ve saturado)

### **2. Item Central**
- ✅ Usar para la acción principal (ej: Productos, Ventas)
- ✅ Solo un item puede ser central
- ✅ Debe ser una función frecuente

### **3. Etiquetas**
- ✅ Cortas (máx. 10 caracteres)
- ✅ Descriptivas
- ✅ Sin abreviaturas confusas

### **4. Iconos**
- ✅ Representativos de la función
- ✅ Reconocibles universalmente
- ✅ Consistentes en estilo

### **5. Rutas**
- ✅ Validar que existan en el router
- ✅ Usar rutas absolutas (`/dashboard`)
- ✅ Evitar rutas externas

---

## 🐛 **Troubleshooting**

### **Los cambios no se guardan**

**Problema**: Configuración no persiste al recargar.

**Solución**:
1. Verificar que localStorage esté habilitado
2. Revisar consola por errores
3. Limpiar caché del navegador

```javascript
// Limpiar configuración manualmente
localStorage.removeItem('navigation_config');
```

### **Iconos no aparecen**

**Problema**: Item muestra sin icono.

**Solución**:
1. Verificar que el nombre del icono esté en `AVAILABLE_ICONS`
2. Revisar importación en `NavigationConfigContext.tsx`
3. Usar un icono por defecto si falla

### **Item central no se destaca**

**Problema**: Item marcado como central no tiene efecto flotante.

**Solución**:
1. Solo un item puede ser central a la vez
2. Verificar que `isCenter: true` esté configurado
3. Revisar que el item esté habilitado (`enabled: true`)

---

## 📦 **Archivos del Sistema**

### **Nuevos:**
1. ✅ `src/contexts/NavigationConfigContext.tsx` - Contexto y lógica
2. ✅ `src/pages/NavigationSettings.tsx` - Página de configuración
3. ✅ `NAVIGATION_CONFIG_GUIDE.md` - Esta documentación

### **Modificados:**
1. ✅ `src/components/layout/MobileBottomNav.tsx` - Usa configuración dinámica
2. ✅ `src/App.tsx` - Integra NavigationConfigProvider

---

## 🎨 **Capturas de Pantalla**

### **Página de Configuración**
```
┌─────────────────────────────────────────────┐
│ Configuración de Navegación    [Restaurar] │
│                                   [Guardar] │
├─────────────────────────────────────────────┤
│ Items de Navegación                         │
│                                             │
│ ☰ 1 🏠 Inicio          /dashboard  [Editar]│
│                                    [Switch] │
│                                             │
│ ☰ 2 👥 Clientes        /users     [Editar] │
│                                    [Switch] │
│                                             │
│ ☰ 3 🛍️ Productos ⭐    /products  [Editar] │
│     (Central)                      [Switch] │
│                                             │
│ ☰ 4 ⚙️ Ajustes         /settings  [Editar] │
│                                    [Switch] │
│                                             │
│ ☰ 5 📊 Reportes        /reports   [Editar] │
│                                    [Switch] │
│                                             │
├─────────────────────────────────────────────┤
│ Vista Previa (Mobile)                       │
│                                             │
│  🏠   👥   🛍️   ⚙️   📊                   │
│ Inicio Clientes Productos Ajustes Reportes │
│              (flotante)                     │
└─────────────────────────────────────────────┘
```

---

## ✨ **Características Destacadas**

1. **Drag & Drop Intuitivo** - Reordena arrastrando
2. **Edición Inline** - Modifica sin modales
3. **Vista Previa en Tiempo Real** - Ve los cambios al instante
4. **Persistencia Automática** - Se guarda en localStorage
5. **Item Central Configurable** - Marca cualquier item como destacado
6. **10 Iconos Disponibles** - Ampliable fácilmente
7. **Validación Visual** - Badges y estados claros
8. **Responsive** - Funciona en mobile y desktop

---

## 🚀 **Próximas Mejoras Sugeridas**

- [ ] Agregar más iconos de Lucide React
- [ ] Permitir iconos personalizados (upload)
- [ ] Configurar colores del item central
- [ ] Exportar/Importar configuración (JSON)
- [ ] Presets de configuración (Tienda, CRM, etc.)
- [ ] Validación de rutas existentes
- [ ] Límite configurable de items
- [ ] Animaciones de transición personalizables

---

**Implementado por:** Cascade AI  
**Fecha:** Abril 2026  
**Stack:** React 18 + TypeScript + Context API + LocalStorage  
**Inspirado en:** Configuración de navegación de apps móviles modernas
