# Menú dinámico (frontend) y pruebas con tenants demo

Este documento describe cómo el frontend consume la navegación dinámica y el contexto de `BusinessTier`, y cómo validar con los tenants demo creados en backend.

## Objetivo

- Renderizar el sidebar a partir de `GET /api/navigation` (server-driven).
- Adaptar visibilidad por scope (central vs tenant), permisos y features del tier.
- Mostrar límites y uso en `UsageDashboard` (con fallbacks seguros mientras se agrega el endpoint de uso real).

## Integración principal

- `src/App.tsx`
  - La app está envuelta con `BusinessTierProvider` para exponer `tier`, `enabledFeatures` y `limits` a todo el árbol.

- `src/components/features/BusinessTierProvider.jsx`
  - Carga datos desde backend (`/api/business-tier`).
  - Maneja `loading`/`error` y normaliza `limits` para evitar crashes.

- `src/hooks/useFeatures.ts`
  - Combina features del usuario con `enabledFeatures` del `BusinessTierContext` para gating de UI.

- `src/components/Layout/Sidebar.tsx`
  - Solicita `GET /api/navigation`.
  - Renderiza grupos e ítems filtrados por permissions/features (ya prefiltrados en backend).
  - Muestra diferente menú según `scope` retornado (`central` vs `tenant`).

- `src/components/features/BusinessTier/UsageDashboard.jsx`
  - Muestra barras de uso con `limits` desde el contexto.
  - Tiene fallbacks seguros para evitar errores si aún no hay datos.
  - Próximo: consumir `/api/usage` para valores reales.

## Configuración de API

- Archivo: `src/config/api.ts`.
  - Define `getApiBase()` y `defaultOptions` para las llamadas.
  - Asegura incluir el token Bearer en `api.service.ts`.

- `src/services/api.service.ts`
  - Maneja token en `localStorage` y headers de autorización.
  - Expuestos métodos `get/post/put/patch/delete` con manejo de errores y credenciales.

## Flujo de prueba end-to-end

1. Autenticarte en el backend (Sanctum token) desde el login del frontend.
2. Verificar que el sidebar se carga desde `/api/navigation` y coincide con el scope devuelto.
3. Entrar con un usuario de tenant con rol `admin` y otro con rol `vendedor` para observar diferencias en el menú.
4. Modificar el tier/`enabled_features` del tenant y refrescar: los ítems con `required_features` deben ocultarse/mostrarse.

## Próximos pasos

- Consumir `/api/usage` en `UsageDashboard` para métricas reales (productos/usuarios/almacenes).
- Agregar UI de selección de tenant (tenant switcher) para pruebas locales si aplica.
- Impersonación desde central (futuro) para visualizar vistas del tenant.

---

Mantén este documento en el repo para compartir con el equipo y actualizar conforme avancen las funcionalidades.
