# Modo Demo - Login Simulado

## ¿Qué es el Modo Demo?

El modo demo es una funcionalidad que te permite probar todo el sistema CRUD sin necesidad de tener un backend conectado. Simula completamente la autenticación y te da acceso a todas las vistas internas del starter.

## Características del Modo Demo

### 1. **Login Flexible**
- Acepta cualquier combinación de username/password
- No requiere conexión a API
- Simula delay de red para experiencia realista

### 2. **Usuarios Predefinidos**
Según el username que ingreses, obtendrás diferentes roles:

| Username | Roles | Nombre de Usuario |
|----------|-------|-------------------|
| `admin` | admin, user | Administrador Demo |
| `user` | user | Usuario Demo |
| `manager` | manager, user | Manager Demo |
| Cualquier otro | admin (default) | Administrador Demo |

### 3. **Datos Simulados**
- Usuarios predefinidos
- Roles y permisos funcionales
- Sesión persistente en localStorage
- Indicadores visuales del modo demo

## Cómo Usar el Modo Demo

### 1. **Iniciar el Proyecto**
```bash
npm run dev
```

### 2. **Acceder al Login**
Visita: `http://localhost:5173/login`

### 3. **Iniciar Sesión**
Usa cualquiera de estas credenciales:

```
Username: admin
Password: password
```

```
Username: user
Password: password
```

```
Username: manager
Password: password
```

O simplemente usa cualquier combinación (ej: `test`/`test123`)

### 4. **Explorar las Vistas**
- **Dashboard**: Ver información del usuario y acciones disponibles
- **Example CRUD**: Probar el módulo CRUD genérico
- **Navegación**: Todas las rutas protegidas funcionan

## Vistas Disponibles

### 1. **Dashboard (`/dashboard`)**
- Información del usuario actual
- Roles asignados
- Acciones rápidas según permisos
- Control de sesión

### 2. **Example CRUD (`/example-crud`)**
- Tabla genérica con datos simulados
- Formulario de creación
- Edición y eliminación
- Paginación y filtros

### 3. **Login (`/login`)**
- Formulario flexible (username o email)
- Validación en tiempo real
- Indicador de modo demo

## Indicadores Visuales

### **Banner de Modo Demo**
- **Login**: Banner azul con credenciales de ejemplo
- **Dashboard**: Banner verde indicando modo demo activo
- **Badge DEMO**: En el dashboard para recordar el modo

### **Comportamiento**
- **Delay simulado**: 500ms para login, 200ms para logout
- **Datos persistentes**: Sesión se mantiene en localStorage
- **No persistencia**: Los cambios no se guardan realmente

## Cambiar entre Modo Demo y Real

### **Para Activar Modo Real**

1. **Editar App.tsx**:
```typescript
import { AuthProvider } from "@/features/auth/AuthContext";
// Reemplazar DemoAuthProvider por AuthProvider
```

2. **Configurar API**:
```env
VITE_API_URL=http://tu-backend.com/api
```

3. **Actualizar Componentes**:
- LoginPage: usar `useAuth()` en lugar de `useDemoAuth()`
- ProtectedRoute: usar `useAuth()` en lugar de `useDemoAuth()`
- DashboardPage: usar `useAuth()` en lugar de `useDemoAuth()`

### **Para Volver a Modo Demo**

1. **Restaurar App.tsx**:
```typescript
import { DemoAuthProvider } from "@/features/auth/DemoAuthContext";
```

2. **Los componentes ya están configurados** para modo demo

## Ventajas del Modo Demo

### **Para Desarrollo**
- **Rápido inicio**: Sin necesidad de configurar backend
- **Pruebas de UI**: Verificar diseño y UX
- **Demostraciones**: Mostrar el sistema a clientes
- **Documentación**: Capturas de pantalla para docs

### **Para Presentaciones**
- **Listo inmediatamente**: Solo `npm run dev`
- **Datos consistentes**: Siempre los mismos usuarios
- **Funcionalidad completa**: Todas las características visibles

## Limitaciones

### **No Persiste Datos**
- Los cambios en CRUDs no se guardan
- La sesión se pierde si se limpia localStorage
- No hay comunicación real con backend

### **Datos Estáticos**
- Usuarios predefinidos
- Roles fijos
- Sin validaciones de negocio reales

## Próximos Pasos

### **Cuando tengas tu backend listo**:

1. **Configura la URL del API**:
```env
VITE_API_URL=http://tu-backend.com/api
```

2. **Cambia a AuthProvider real**:
```typescript
<AuthProvider>
  {/* tu aplicación */}
</AuthProvider>
```

3. **Asegura que tu backend**:
- Soporte login con username/email
- Devuelva tokens JWT
- Tenga los endpoints CRUD estándar

## Troubleshooting

### **El login no funciona**
- Verifica que estés usando `DemoAuthProvider`
- Revisa la consola por errores
- Limpia localStorage y recarga

### **No muestra las vistas**
- Asegúrate de haber iniciado sesión
- Verifica que `ProtectedRoute` use `useDemoAuth`
- Revisa las rutas en `App.tsx`

### **Los datos no persisten**
- Es normal, el modo demo no persiste datos
- Para persistencia real, necesitas un backend

El modo demo te permite explorar completamente el starter CRUD sin complicaciones de backend. ¡Perfecto para desarrollo rápido y demostraciones!
