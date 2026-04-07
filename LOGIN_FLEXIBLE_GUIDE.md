# Login Flexible - Username o Email

## Cambio Implementado

El formulario de login ahora acepta tanto **username** como **email** para iniciar sesión.

## Validaciones Implementadas

### Frontend (React Hook Form)
```typescript
// Validación flexible
validate: (value) => {
  const isEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value);
  const isUsername = /^[a-zA-Z0-9_]{3,20}$/.test(value);
  return isEmail || isUsername || 'Ingresa un correo válido o un nombre de usuario';
}
```

### Criterios de Validación

#### Email:
- Formato: `usuario@dominio.com`
- Expresión regular: `/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i`

#### Username:
- Longitud: 3-20 caracteres
- Caracteres permitidos: letras, números, guión bajo
- Expresión regular: `/^[a-zA-Z0-9_]{3,20}$/`

## Backend Esperado

Tu API debe manejar ambos casos en el endpoint `/login`:

```php
// Ejemplo Laravel
public function login(Request $request) {
    $credentials = $request->only('username', 'password');
    
    // Intentar login con email o username
    $field = filter_var($credentials['username'], FILTER_VALIDATE_EMAIL) 
        ? 'email' 
        : 'username';
    
    if (Auth::attempt([$field => $credentials['username'], 'password' => $credentials['password']])) {
        // Login exitoso
    }
}
```

```javascript
// Ejemplo Node.js
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Determinar si es email o username
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
  const query = isEmail ? { email: username } : { username: username };
  
  // Buscar usuario y verificar contraseña
  const user = await User.findOne(query);
  if (user && await bcrypt.compare(password, user.password)) {
    // Login exitoso
  }
});
```

## Formato del Request

```json
{
  "username": "usuario123", // o "correo@ejemplo.com"
  "password": "password123"
}
```

## UI/UX Mejoras

- **Label**: "Usuario o Correo electrónico"
- **Placeholder**: "usuario o correo@ejemplo.com"
- **Type**: `text` (en lugar de `email`)
- **Validación en tiempo real**: Muestra si es válido como email o username

## Ejemplos de Uso

### Válidos:
- `usuario123`
- `john_doe`
- `correo@ejemplo.com`
- `user.name@domain.com`

### Inválidos:
- `ab` (muy corto)
- `usuario@` (email inválido)
- `user-name` (guión no permitido)
- `usuario123456789012345` (muy largo)

## Testing

Para probar esta funcionalidad:

1. **Inicia el frontend**: `npm run dev`
2. **Intenta login con email**: `test@example.com`
3. **Intenta login con username**: `testuser`
4. **Verifica validación**: Intenta valores inválidos

## Configuración Backend

Asegúrate que tu backend:
- Reciba el campo `username` (no `email`)
- Verifique si es email o username
- Busque en el campo correspondiente de la base de datos
- Devuelva el mismo formato de respuesta JWT

Esta implementación hace el login más flexible y amigable para los usuarios.
