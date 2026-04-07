# Diagnóstico del Error useAuth

## Problema
El error `ReferenceError: useAuth is not defined` indica que hay alguna referencia a `useAuth` que no se ha actualizado.

## Soluciones Aplicadas

### 1. Eliminamos dependencias circulares
- Creamos interfaz `User` directamente en `DemoAuthContext`
- Actualizamos todas las importaciones para usar `User` del `DemoAuthContext`

### 2. Archivos actualizados
- `LoginPage.tsx` - Ahora usa `useDemoAuth` y `User` del DemoAuthContext
- `DashboardPage.tsx` - Ahora usa `useDemoAuth` y `User` del DemoAuthContext
- `ProtectedRoute.tsx` - Ahora usa `useDemoAuth`

## Pasos para Solucionar

### 1. Limpiar Cache del Navegador
```bash
# Fuerza recarga completa
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### 2. Verificar Consola
Abre DevTools y busca:
- Errores de importación
- Advertencias de dependencias circulares
- Errores de módulos no encontrados

### 3. Reiniciar Servidor de Desarrollo
```bash
# Detén el servidor (Ctrl + C)
# Luego reinicia
npm run dev
```

### 4. Acceder Directamente
```
http://localhost:5173/login?clear=1
```

## Si el Error Persiste

### Opción A: Verificar Archivos Conflictivos
Busca estos archivos que podrían tener `useAuth`:
- `src/pages/Login.tsx` (viejo archivo de login)
- `src/contexts/useAuth.ts`
- Cualquier otro archivo que importe `useAuth`

### Opción B: Reemplazo Completo
Si el problema persiste, reemplaza completamente el LoginPage:

```typescript
// src/features/auth/LoginPage.tsx
import React from 'react';
import { useDemoAuth } from './DemoAuthContext';

export default function LoginPage() {
  const { login, isLoading } = useDemoAuth();
  
  const handleLogin = async () => {
    await login('admin', 'password');
  };

  return (
    <div>
      <h1>Modo Demo</h1>
      <button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? 'Cargando...' : 'Iniciar Sesión Demo'}
      </button>
    </div>
  );
}
```

## Verificación Final

Después de aplicar las soluciones:

1. **Login debe mostrar**: "Modo Demo Activado"
2. **Debe aceptar**: cualquier username/password
3. **Dashboard debe mostrar**: banner verde "DEMO"
4. **No debe haber errores** en la consola

## Comandos Útiles

```bash
# Buscar referencias a useAuth
grep -r "useAuth" src/ --exclude-dir=node_modules

# Limpiar cache de Vite
rm -rf node_modules/.vite

# Reinstalar dependencias
npm install
```

## Estado Actual
- [x] DemoAuthContext creado
- [x] LoginPage actualizado
- [x] DashboardPage actualizado  
- [x] ProtectedRoute actualizado
- [x] App.tsx configurado
- [ ] Cache limpio (manual)
- [ ] Error resuelto (verificar)
