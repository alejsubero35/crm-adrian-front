# Guía de Tenencia (Stancl) + React local

## Objetivo

Usar React en `http://localhost:8080` y Laravel API con tenencia por dominio `sslip.io`:
- Central: `https://127-0-0-1.sslip.io/api`
- Tenant: `https://{tenant}.127-0-0-1.sslip.io/api`

## Variables de entorno (frontend)

Añade en `.env` (venta-simplyfy):
- `VITE_API_BASE_CENTRAL=https://127-0-0-1.sslip.io/api`
- `VITE_API_BASE_TENANT_PREFIX=https://{tenant}.127-0-0-1.sslip.io/api`

## Selección automática de API

- `src/config/api.ts`: define bases central/tenant y helpers `getApiBase`, `setApiBaseCentral`, `setApiBaseTenant`.
- `src/hooks/useApiClient.ts`: lee `scope` de `useUserContext` y ajusta `axios.baseURL`.
- `src/services/api.service.ts`: usa `getApiBase()` para concatenar la URL.

## CORS y autenticación

- En Laravel `config/cors.php`:
  - `allowed_origins`: incluye `http://localhost:8080`.
  - `supports_credentials`: `true` si usas cookies; con JWT puede ser `false`.
- Recomendado en dev: JWT (tienes `php-open-source-saver/jwt-auth`).

## Flujo de arranque

1. Frontend llama `/user/context` (base central por defecto).
2. Backend devuelve `scope` (central/tenant) y opcional `tenant.slug`.
3. Si `scope === 'tenant'`, el hook cambia el base a `https://{slug}.127-0-0-1.sslip.io/api`.
4. Menús y botones se renderizan según `scope`, `roles`, `permissions` y features del plan.

## Menús y POS

- POS sólo visible si `scope === 'tenant'` y el plan lo permite.
- Dashboard central para `scope === 'central'`.

## Datos compartidos

- Si necesitas datos centrales en tenant, mantén dos clientes (central y tenant) o llama endpoints centrales específicos.

## Impersonar tenant (central)

- Backend: `tenancy()->initialize($tenant)`, para consultar datos del tenant desde central.
- Úsalo en endpoints protegidos para super-admin.

## Pruebas locales

- Abre `http://localhost:8080`.
- Inicia sesión central: verás menú central y llamadas al API central.
- Inicia sesión tenant: el baseURL cambia y verás menú tenant + POS.
