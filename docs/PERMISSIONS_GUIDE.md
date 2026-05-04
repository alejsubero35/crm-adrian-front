# Guía de uso: Permisos y Roles en Venta Simplyfy

## Objetivo

Controlar la visibilidad y acceso a acciones, botones y rutas según los permisos y roles del usuario, tanto en menús como en cualquier componente o página.

---

## 1. Hook y helpers disponibles

### `useUserPermissions`

Importa y usa el hook para acceder a los helpers y datos:

```ts
import { useUserPermissions } from "@/hooks/useUserPermissions";

const { hasPermission, hasRole, permissions, roles } = useUserPermissions();
```

- `hasPermission('permiso')` → `true/false`
- `hasPermission(['perm1', 'perm2'])` → `true` si tiene todos
- `hasRole('rol')` → `true/false`
- `hasRole(['rol1', 'rol2'])` → `true` si tiene alguno

---

## 2. Ejemplo de uso en botones/acciones

```tsx
import { useUserPermissions } from "@/hooks/useUserPermissions";

function AccionesPOS() {
  const { hasPermission, hasRole } = useUserPermissions();

  return (
    <div>
      {/* Solo usuarios con permiso "ventas.create" */}
      {hasPermission('ventas.create') && (
        <Button>Nuevo Ticket</Button>
      )}

      {/* Solo para super-admin */}
      {hasRole('super-admin') && (
        <Button>Configurar POS</Button>
      )}

      {/* Ocultar POS para vendedores */}
      {!hasRole(['vendedor', 'super-admin']) && (
        <Button>Ir a POS</Button>
      )}
    </div>
  );
}
```

---

## 3. Buenas prácticas

- Usa `hasPermission` para acciones sensibles (editar, eliminar, exportar, etc).
- Usa `hasRole` para flujos exclusivos de un rol (super-admin, central, tenant, etc).
- Aplica el helper en menús, headers, toolbars y cualquier botón/acción.
- Si necesitas lógica más compleja, combínalos:

```tsx
{hasRole('super-admin') || hasPermission('admin.access') ? <AdminPanel /> : null}
```

---

## 4. Extensión

- Si agregas nuevos permisos o roles en backend, asegúrate de usarlos aquí para controlar la UI.
- Puedes extender el hook para exponer más datos del usuario si lo necesitas.

---

## 5. Dónde implementar

- Menús laterales y superiores
- Botones de acción en headers, toolbars, tablas
- Acciones de edición/eliminación
- Cualquier componente sensible a permisos/roles

---

## 6. Ejemplo rápido

```tsx
import { useUserPermissions } from "@/hooks/useUserPermissions";

const { hasPermission } = useUserPermissions();

return (
  <Button disabled={!hasPermission('ventas.create')}>Nuevo Ticket</Button>
);
```

---

## 7. Gating por features de plan

Además de roles/permisos, puedes ocultar/mostrar módulos según el plan del tenant usando el hook `usePlanFeatures`:

```tsx
import { usePlanFeatures } from "@/hooks/usePlanFeatures";

const { hasFeature } = usePlanFeatures();

// Mostrar POS sólo si el plan incluye 'pos' y el scope es tenant
{userCtx?.scope === 'tenant' && hasFeature('pos') && (
  <Link to="/" className="btn-primary-new">POS</Link>
)}
```

Define las features del plan en el backend y envíalas en `/user/context` como `features: string[]`.

---

## 7. Tenencia y selección de API (local)

- Variables de entorno (React):
  - `VITE_API_BASE_CENTRAL=https://127-0-0-1.sslip.io/api`
  - `VITE_API_BASE_TENANT_PREFIX=https://{tenant}.127-0-0-1.sslip.io/api`
- Hook `useApiClient` ajusta automáticamente el `baseURL` de Axios según `scope` (`central`/`tenant`). Opcionalmente usa `localStorage.tenant_domain`.
- Renderiza menús y POS sólo cuando `scope === 'tenant'` y permisos/features lo permiten.
