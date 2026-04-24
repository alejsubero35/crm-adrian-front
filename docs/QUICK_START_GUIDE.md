# Guía Rápida - Arquitectura Maestra React

## Estado Actual

He actualizado el `App.tsx` para usar la nueva arquitectura maestra. La aplicación ahora debería mostrar:

- **Nuevo Layout**: Sidebar colapsable + Header sticky
- **Dashboard Moderno**: Con estadísticas y actividad reciente  
- **UserCRUD Completo**: Tabla genérica con acciones y formularios
- **Sistema de Rutas Dinámicas**: Navegación automática desde configuración

## Para Probar la Aplicación

### 1. Ejecutar el Servidor de Desarrollo
```bash
cd c:\laragon\www\frontend\crm-adrian-front
npm run dev
```

### 2. Acceder a la Aplicación
- Abre `http://localhost:5173` en tu navegador
- Verás el login con modo demo activado

### 3. Iniciar Sesión (Modo Demo)
Usa cualquiera de estos credenciales:
- **Usuario**: `admin` - **Contraseña**: `password`
- **Usuario**: `user` - **Contraseña**: `password`  
- **Usuario**: `manager` - **Contraseña**: `password`

### 4. Explorar las Funcionalidades

#### Dashboard Principal
- Estadísticas en tiempo real
- Actividad reciente del sistema
- Acciones rápidas
- Gráficos placeholder (listos para Chart.js)

#### Gestión de Usuarios (/users)
- Tabla genérica con sorting, paginación, búsqueda
- CRUD completo con formularios modales
- Acciones por rol (solo admin puede eliminar)
- Selección múltiple

#### Sidebar Dinámico
- Click en el ícono de menú para colapsar/expandir
- En móvil: comportamiento tipo drawer
- Navegación automática según configuración

#### Header Global
- Logo y toggle de sidebar
- Barra de búsqueda (placeholder)
- Notificaciones con badge
- Avatar de usuario con menú desplegable

## Características Implementadas

### 100% Responsive
- **Mobile** (<768px): Drawer overlay, header simplificado
- **Tablet** (768px-1023px): Sidebar colapsable
- **Desktop** (>=1024px): Layout completo

### Componentes CRUD Reutilizables
- **GenericTable**: Headers dinámicos, sorting, pagination, search
- **GenericForm**: Todos los tipos de campos, validación Zod
- **CustomButton**: 7 variantes, loading states, icons

### Sistema de Rutas
- **Configuración Centralizada**: `src/config/routes.ts`
- **Lazy Loading**: Carga asíncrona de componentes
- **AuthGuard**: Protección por roles
- **Navegación Automática**: Sidebar se actualiza desde config

### UX Optimizada
- **Skeleton Loaders**: Durante carga de datos
- **Loading States**: Spinners y estados de carga
- **Transiciones Suaves**: Animaciones CSS
- **Error Boundaries**: Manejo de errores

## Próximos Pasos

### Para Producción
1. **Conectar Backend**: Reemplazar DemoAuth con AuthService real
2. **API Integration**: Conectar endpoints reales
3. **Base de Datos**: Implementar persistencia
4. **Charts**: Integrar Chart.js o Recharts

### Personalización
1. **Branding**: Cambiar logo, colores, nombre
2. **Rutas**: Agregar nuevas páginas en `routes.ts`
3. **Componentes**: Extender CRUDs para tus necesidades
4. **Theme**: Modo oscuro/claro ya implementado

## Archivos Clave

### Configuración
- `src/config/routes.ts` - Definición de rutas y navegación
- `src/App.tsx` - Punto de entrada actualizado

### Layout Principal
- `src/components/layout/MasterHeader.tsx` - Header global
- `src/components/layout/MasterSidebar.tsx` - Sidebar dinámico
- `src/components/layout/MainLayout.tsx` - Layout principal

### Componentes CRUD
- `src/components/tables/GenericTable.tsx` - Tabla genérica
- `src/components/forms/GenericForm.tsx` - Formularios genéricos
- `src/components/ui/custom-button.tsx` - Botones personalizados

### Context API
- `src/contexts/UIContext.tsx` - Estado de UI (sidebar, theme, responsive)
- `src/features/auth/DemoAuthContext.tsx` - Autenticación demo

### Páginas de Ejemplo
- `src/pages/MasterDashboard.tsx` - Dashboard principal
- `src/pages/UserCRUD.tsx` - CRUD de usuarios completo
- `src/pages/ProductCRUD.tsx` - CRUD de productos
- `src/pages/Reports.tsx` - Sistema de reportes

## Troubleshooting

### Si no se ven los cambios:
1. **Reiniciar servidor**: `npm run dev`
2. **Limpiar caché**: `Ctrl + Shift + R` en navegador
3. **Verificar consola**: Buscar errores de importación

### Errores comunes:
- **Import errors**: Revisa que todos los archivos existan
- **Type errors**: Los tipos de roles pueden necesitar ajuste
- **Missing components**: Algunas páginas aún son placeholders

## Feedback

Por favor, comparte capturas de pantalla de:
1. **Página de login** con modo demo
2. **Dashboard principal** con estadísticas
3. **UserCRUD** con tabla y acciones
4. **Sidebar** en modo colapsado/extendido
5. **Mobile view** si es posible

Así puedo identificar qué necesita ajuste o mejora.
