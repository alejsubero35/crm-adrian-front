# Guía de Debugging - Redirección Login

## Problema
El login funciona pero no redirige al dashboard.

## Debugging Implementado

### 1. Console Logs Agregados

#### LoginPage.tsx:
```javascript
// Al iniciar login
console.log('Iniciando login con:', data.username);

// Después del login exitoso
console.log('Login exitoso, redirigiendo...');

// En el useEffect de autenticación
console.log('Estado de autenticación:', isAuthenticated);
console.log('Usuario ya autenticado, redirigiendo...');
```

#### DemoAuthContext.tsx:
```javascript
// Al seleccionar usuario
console.log('Usuario seleccionado:', selectedUser);

// Al almacenar usuario
console.log('Usuario almacenado, autenticación actualizada');
```

## Pasos para Debuggear

### 1. Abrir Consola del Navegador
- Presiona `F12` o `Ctrl + Shift + I`
- Ve a la pestaña "Console"

### 2. Realizar Login
1. Ingresa `admin` y `password`
2. Haz clic en "Iniciar Sesión"
3. Observa los mensajes en la consola

### 3. Esperados en Consola

#### Flujo Exitoso:
```
Estado de autenticación: false
Iniciando login con: admin
Usuario seleccionado: {id: 1, name: "Administrador Demo", ...}
Usuario almacenado, autenticación actualizada
Login exitoso, redirigiendo...
Estado de autenticación: true
Usuario ya autenticado, redirigiendo...
```

#### Si hay errores:
```
Estado de autenticación: false
Iniciando login con: admin
Error en login: [mensaje de error]
```

## Posibles Problemas y Soluciones

### Problema 1: El estado no se actualiza
**Síntomas:**
```
Estado de autenticación: false
Login exitoso, redirigiendo...
// Pero no aparece "Usuario ya autenticado, redirigiendo..."
```

**Solución:**
El problema está en el DemoAuthContext. El estado `isAuthenticated` no se está actualizando.

### Problema 2: La redirección no funciona
**Síntomas:**
```
Estado de autenticación: true
Usuario ya autenticado, redirigiendo...
// Pero no redirige
```

**Solución:**
El problema está en el hook `useNavigate` o en las rutas.

### Problema 3: El ProtectedRoute bloquea
**Síntomas:**
```
Login exitoso, redirigiendo...
// Redirige a /dashboard pero vuelve a /login
```

**Solución:**
El ProtectedRoute no está reconociendo la autenticación.

## Verificaciones Rápidas

### 1. Verificar Rutas
```javascript
// En App.tsx verifica que las rutas sean correctas
<Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
```

### 2. Verificar Estado
En la consola del navegador, ejecuta:
```javascript
// Verificar localStorage
localStorage.getItem('demo_auth_user');

// Verificar si el hook está funcionando
// Esto solo funciona en la consola del componente React
```

### 3. Verificar Navegación Manual
Intenta navegar manualmente:
1. Inicia sesión
2. En la URL escribe `http://localhost:5173/dashboard`
3. Presiona Enter

Si manualmente funciona, el problema está en la redirección automática.

## Solución Temporal (si nada funciona)

Si la redirección automática no funciona, puedes agregar un botón:

```javascript
// En LoginPage.tsx después del login exitoso
{isAuthenticated && (
  <Button onClick={() => navigate('/dashboard')}>
    Ir al Dashboard
  </Button>
)}
```

## Pasos a Seguir

1. **Prueba el login** y observa los console logs
2. **Identifica qué mensaje falta** en la secuencia
3. **Reporta los resultados** con los logs exactos
4. **Aplica la solución específica** según el problema detectado

## Logs Esperados vs Reales

### Esperado:
```
Estado de autenticación: false
Iniciando login con: admin
Usuario seleccionado: {id: 1, name: "Administrador Demo", ...}
Usuario almacenado, autenticación actualizada
Login exitoso, redirigiendo...
// Navegación a /dashboard
```

### Si ves algo diferente, reporta exactamente lo que aparece en la consola.
