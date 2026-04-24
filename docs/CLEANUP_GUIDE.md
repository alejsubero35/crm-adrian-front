# Guía de Limpieza para Boilerplate CRUD

## Overview
Esta guía te ayudará a transformar el proyecto CRM existente en un boilerplate reutilizable para generar CRUDs automáticamente.

## Archivos a Eliminar

### 1. Páginas Específicas del Negocio
Elimina estos archivos y directorios en `src/pages/`:
- `Sales/`
- `Products/`
- `Customers/`
- `Suppliers/`
- `Departments/`
- `Employees/`
- `Accounting/`
- `Returns/`
- `Subscription/`
- `InventoryAdjustmentCreate.tsx`
- `PurchaseCreate.tsx`
- `Purchases/`
- `InventoryAdjustments/`
- `Settings/`
- `Units.tsx`
- `VatRates.tsx`
- `Brands.tsx`
- `ProductCategories.tsx`
- `ProductSubCategories.tsx`
- `PosSettings.tsx`
- `InventoryMovements.tsx`
- `StockTransfers.tsx`
- `Credits.tsx`
- `Admin/`
- `Reports/`

### 2. Componentes Específicos
Elimina estos directorios en `src/components/`:
- `pos/`
- `receipt/`
- `tour/`
- `pwa/`
- `central/`
- `navigation/`
- `tiers/`
- `BiometricAuth.jsx`
- `CalculatorDialog.tsx`
- `CashCloseReport.tsx`
- `DenominationCounter.tsx`
- `ModalAperturaCaja.tsx`
- `ModalAperturaCaja2.tsx`
- `ModalCierreCaja.tsx`
- `ModalCierreCajaSimple.tsx`
- `OpenRegisterModal.tsx`
- `ThemeCustomizerFab.tsx`

### 3. Contextos Específicos
Elimina estos archivos en `src/contexts/`:
- `AccountingContext.tsx`
- `CashRegisterContext.tsx`
- `CartContext.tsx`
- `ProductContext.tsx`
- `LanguageContext.tsx`
- `PosLocationContext.tsx`

### 4. Servicios Específicos
Elimina estos archivos en `src/services/`:
- `ProductService.js`
- `accountingTransactions.ts`
- `accounts.ts`
- `branches.ts`
- `brands.ts`
- `business-type.service.ts`
- `businessTierService.js`
- `cashSessions.ts`
- `clients.ts`
- `currencies.ts`
- `currencyDenominations.ts`
- `customer.service.ts`
- `dashboard.ts`
- `departments.ts`
- `employees.ts`
- `exchangeRate.ts`
- `expenses.ts`
- `feature-catalog.service.ts`
- `inventoryAdjustments.ts`
- `inventoryMovements.ts`
- `invoice.service.ts`
- `invoicePaymentsPay.ts`
- `invoices.ts`
- `navigation.service.ts`
- `navigation.ts`
- `navigationAdmin.service.ts`
- `paymentMethods.ts`
- `permissions.ts`
- `plan.service.ts`
- `posDrafts.ts`
- `posSettings.ts`
- `product.service.ts`
- `productCategories.ts`
- `productSubCategories.ts`
- `provision.service.ts`
- `public-signup.service.ts`
- `purchases.ts`
- `reports.ts`
- `roles.ts`
- `sales.ts`
- `stockTransfers.ts`
- `suppliers.ts`
- `tenant.service.ts`
- `tenantUsers.ts`
- `tierLimits.ts`
- `units.ts`
- `user.service.ts`
- `users.ts`
- `vatRates.ts`
- `warehouses.ts`
- `webauthn.service.ts`

### 5. Hooks Específicos
Elimina estos archivos en `src/hooks/`:
- Mantén solo los hooks genéricos como `useForm`, `useTable`, etc.

### 6. Assets y Recursos
Elimina estos directorios y archivos:
- `public/` (mantén solo archivos genéricos como favicon, logo placeholder)
- Imágenes específicas del cliente en `public/`
- Assets de branding específicos

## Archivos a Mantener y Modificar

### 1. App.tsx
Reemplaza con `App.clean.tsx` que contiene solo las rutas básicas:
- `/login`
- `/dashboard`
- `/example-crud`
- `/` (redirige a dashboard)

### 2. Configuración
Mantén estos archivos de configuración:
- `src/config/api.ts` (ajusta para tu API)
- `tailwind.config.ts`
- `vite.config.ts`

### 3. Componentes UI Genéricos
Mantén todo en `src/components/ui/`:
- Botones, inputs, tables, modals, etc.
- Estos son la base para el generador de CRUDs

## Nueva Estructura de Directorios

Después de la limpieza, tu estructura debería verse así:

```
src/
  components/
    shared/           # Componentes reutilizables
      DynamicForm.tsx
      GenericTable.tsx
      GenericModule.tsx
    ui/               # Componentes atómicos (shadcn/ui)
      button.tsx
      input.tsx
      table.tsx
      # ... etc
  features/
    auth/             # Autenticación
      AuthContext.tsx
      LoginPage.tsx
      DashboardPage.tsx
      ProtectedRoute.tsx
    example/          # Ejemplo de CRUD
      ExampleCrudPage.tsx
  hooks/
    useCrud.tsx       # Hook genérico para CRUDs
    # ... otros hooks genéricos
  services/
    api.service.ts    # Servicio base de API
    auth.generic.service.ts
    base/
      base.service.ts # Servicio base para recursos
  types/
    crud.types.ts     # Tipos para configuración CRUD
```

## Configuración del Entorno

### 1. .env.example
Crea un archivo `.env.example` con:

```env
# API Configuration
VITE_API_URL=http://localhost:8000/api

# Authentication
VITE_AUTH_TOKEN_KEY=auth_token
VITE_AUTH_USER_KEY=auth_user

# App Configuration
VITE_APP_NAME=CRUD Boilerplate
VITE_APP_VERSION=1.0.0

# Development
VITE_DEV_MODE=true
```

### 2. package.json
Asegúrate de que estas dependencias estén presentes:
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2",
    "react-hook-form": "^7.53.0",
    "@tanstack/react-query": "^5.56.2",
    "axios": "^1.13.2",
    "zod": "^3.23.8",
    "@hookform/resolvers": "^3.9.0",
    "lucide-react": "^0.462.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.2"
  }
}
```

## Pasos Finales

1. **Reemplaza App.tsx**: Copia `App.clean.tsx` sobre `App.tsx`
2. **Actualiza imports**: Asegúrate de que todos los imports apunten a los archivos correctos
3. **Limpia package.json**: Elimina scripts específicos del negocio
4. **Configura variables de entorno**: Copia `.env.example` a `.env.local`
5. **Testea el flujo**: Verifica que login, dashboard y el CRUD de ejemplo funcionen

## Crear Nuevos CRUDs

Para crear un nuevo CRUD, simplemente:

1. Define la configuración en una página:
```typescript
const newUserConfig: CrudConfig<User> = {
  endpoint: '/users',
  title: 'Usuario',
  columns: [...],
  fields: [...],
  // ... configuración
};
```

2. Usa el GenericModule:
```typescript
<GenericModule config={newUserConfig} />
```

¡Listo! Ahora tienes un boilerplate limpio y reutilizable para generar CRUDs automáticamente.
