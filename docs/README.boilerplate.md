# CRUD Boilerplate / Starter Kit

Un boilerplate React + TypeScript con TailwindCSS y Shadcn/UI para generar CRUDs automáticamente mediante configuración.

## Características

- **Generador de CRUDs**: Define tablas y formularios mediante configuración JSON
- **Arquitectura Limpia**: Estructura organizada con features, hooks, y servicios reutilizables
- **Autenticación JWT**: Flujo de login genérico con manejo de tokens
- **Componentes Modernos**: Basado en Shadcn/UI con TailwindCSS
- **TypeScript**: Tipado completo para mejor desarrollo
- **React Query**: Manejo eficiente de estado y caché
- **React Hook Form**: Formularios dinámicos con validación

## Estructura del Proyecto

```
src/
  components/
    shared/           # Componentes reutilizables
      DynamicForm.tsx     # Formulario dinámico basado en configuración
      GenericTable.tsx    # Tabla genérica con paginación, filtros, ordenamiento
      GenericModule.tsx   # Módulo completo que orquesta CRUD
    ui/               # Componentes atómicos (shadcn/ui)
      button.tsx
      input.tsx
      table.tsx
      # ... etc
  features/
    auth/             # Módulo de autenticación
      AuthContext.tsx     # Contexto de autenticación
      LoginPage.tsx       # Página de login
      DashboardPage.tsx   # Dashboard genérico
      ProtectedRoute.tsx  # Rutas protegidas
    example/          # Ejemplo de implementación CRUD
      ExampleCrudPage.tsx
  hooks/
    useCrud.tsx       # Hook personalizado para manejo de CRUDs
  services/
    api.service.ts    # Servicio base de API con interceptores
    auth.generic.service.ts  # Servicio de autenticación genérico
    base/
      base.service.ts # Servicio base para recursos CRUD
  types/
    crud.types.ts     # Definiciones de tipos para configuración CRUD
```

## Quick Start

1. **Clonar y configurar**
```bash
npm install
cp .env.example .env.local
# Ajustar VITE_API_URL en .env.local
npm run dev
```

2. **Login**: Usa credenciales de prueba para acceder al sistema

3. **Ver ejemplo**: Navega a `/example-crud` para ver el CRUD de ejemplo

## Crear un Nuevo CRUD

### 1. Define la interfaz del recurso

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
}
```

### 2. Configura el CRUD

```typescript
const userCrudConfig: CrudConfig<User> = {
  endpoint: '/users',
  title: 'Usuario',
  pluralTitle: 'Usuarios',
  
  // Columnas de la tabla
  columns: [
    {
      key: 'name',
      label: 'Nombre',
      type: 'text',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Correo',
      type: 'text',
      sortable: true,
    },
    {
      key: 'role',
      label: 'Rol',
      type: 'badge',
      badgeVariant: (value) => value === 'admin' ? 'destructive' : 'default',
    },
  ],
  
  // Campos del formulario
  fields: [
    {
      name: 'name',
      label: 'Nombre Completo',
      type: 'text',
      required: true,
      validation: { min: 2, max: 100 },
    },
    {
      name: 'email',
      label: 'Correo',
      type: 'email',
      required: true,
    },
    {
      name: 'role',
      label: 'Rol',
      type: 'select',
      required: true,
      options: [
        { value: 'user', label: 'Usuario' },
        { value: 'admin', label: 'Administrador' },
      ],
    },
  ],
  
  // Permisos y características
  permissions: {
    create: true,
    edit: true,
    delete: true,
    view: true,
  },
  
  features: {
    search: true,
    pagination: true,
    sorting: true,
    bulkActions: true,
  },
};
```

### 3. Usa el GenericModule

```typescript
export default function UsersPage() {
  return <GenericModule config={userCrudConfig} />;
}
```

¡Listo! Tienes un CRUD completo con tabla, formulario, paginación, búsqueda, y más.

## Configuración CRUD Avanzada

### Tipos de Columnas

- `text`: Texto simple
- `badge`: Badge con variantes de color
- `date`: Fechas formateadas
- `number`: Números formateados
- `boolean`: Valores sí/no como badges
- `image`: Miniaturas de imágenes
- `actions`: Botones de acción personalizados

### Tipos de Campos de Formulario

- `text`, `email`, `password`, `number`: Inputs básicos
- `textarea`: Texto multilinea
- `select`: Selector desplegable
- `checkbox`: Casillas de verificación
- `date`: Selector de fechas
- `file`: Upload de archivos

### Hooks del Ciclo de Vida

```typescript
const config: CrudConfig<User> = {
  // ... configuración básica
  
  // Hooks personalizados
  onBeforeCreate: (data) => ({ ...data, created_at: new Date() }),
  onAfterCreate: (item) => console.log('Creado:', item),
  onBeforeUpdate: (id, data) => data,
  onAfterUpdate: (item) => console.log('Actualizado:', item),
  onBeforeDelete: (id) => confirm('¿Eliminar este registro?'),
  onAfterDelete: (id) => console.log('Eliminado:', id),
};
```

### Acciones Personalizadas

```typescript
actions: [
  {
    key: 'view',
    label: 'Ver',
    icon: <Eye className="h-4 w-4" />,
    onClick: (item) => navigate(`/users/${item.id}`),
    variant: 'ghost',
  },
  {
    key: 'activate',
    label: 'Activar',
    onClick: (item) => activateUser(item.id),
    show: (item) => item.status === 'inactive',
  },
],
```

## Arquitectura y Patrones

### 1. Servicio Base API

```typescript
// BaseService proporciona métodos CRUD genéricos
const service = new BaseService<User>('/users');
await service.getAll({ page: 1, limit: 10 });
await service.create({ name: 'John', email: 'john@example.com' });
await service.update(id, { name: 'John Doe' });
await service.delete(id);
```

### 2. Contexto de Autenticación

```typescript
const { user, isAuthenticated, login, logout, hasRole } = useAuth();

// Protección de rutas
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Verificación de roles
{hasRole('admin') && <AdminPanel />}
```

### 3. Manejo de Estado

React Query maneja automáticamente:
- Caching de datos
- Refetching en background
- Estados de carga/error
- Invalidación de caché

## Personalización

### Tema y Estilos

- Modifica `tailwind.config.ts` para personalizar colores y estilos
- Los componentes usan TailwindCSS y son fácilmente personalizables
- Soporte para dark mode incluido

### API Backend

El boilerplate espera una API RESTful con endpoints estándar:

```
GET    /api/resource     # Listar (con paginación)
POST   /api/resource     # Crear
GET    /api/resource/:id # Obtener uno
PUT    /api/resource/:id # Actualizar
DELETE /api/resource/:id # Eliminar
```

### Autenticación

Endpoints esperados:
```
POST   /api/login        # Login
POST   /api/logout       # Logout
GET    /api/user         # Usuario actual
```

## Deploy

### Variables de Entorno

```env
VITE_API_URL=https://tu-api.com/api
VITE_APP_NAME=Tu App
VITE_APP_VERSION=1.0.0
```

### Build

```bash
npm run build
# Los archivos estarán en dist/
```

## Contribuciones

1. Fork el proyecto
2. Crear feature branch
3. Hacer commit de cambios
4. Push al branch
5. Abrir Pull Request

## Licencia

MIT License - libre para uso comercial y personal.

## Soporte

Para dudas o soporte:
- Revisa el ejemplo en `src/features/example/`
- Consulta los tipos en `src/types/crud.types.ts`
- Mira la guía de limpieza en `CLEANUP_GUIDE.md`
