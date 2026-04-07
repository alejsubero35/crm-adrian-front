# API Configuration Guide

## Simple Configuration (Default)

The boilerplate now uses a simple, clean API configuration without multitenancy complexity.

### 1. Environment Variables

Create `.env.local` in your project root:

```env
# Required: Your API base URL
VITE_API_URL=http://your-backend.com/api

# Optional: App info
VITE_APP_NAME=My CRUD App
VITE_APP_VERSION=1.0.0
```

### 2. Common Backend Configurations

#### Laravel
```env
VITE_API_URL=http://localhost:8000/api
```

#### Node.js/Express
```env
VITE_API_URL=http://localhost:3000/api
```

#### Django
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

#### Spring Boot
```env
VITE_API_URL=http://localhost:8080/api
```

#### Production
```env
VITE_API_URL=https://api.yourdomain.com/api
```

### 3. API Structure Expected

Your backend should provide these standard REST endpoints:

```
GET    /api/users           # List users
POST   /api/users           # Create user
GET    /api/users/:id       # Get user
PUT    /api/users/:id       # Update user
DELETE /api/users/:id       # Delete user

POST   /api/login           # Authentication
POST   /api/logout          # Logout
GET    /api/user            # Current user
```

### 4. Response Formats

#### List Response (with pagination)
```json
{
  "data": [
    { "id": 1, "name": "John", "email": "john@example.com" },
    { "id": 2, "name": "Jane", "email": "jane@example.com" }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

#### Login Response
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "roles": ["user"]
  },
  "token": "jwt_token_here",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

## Future Multitenancy Support (Optional)

If you need multitenancy later, the configuration is ready to extend:

### Uncomment the multitenancy section in `src/config/api.ts`:

```typescript
// Uncomment these functions
export const setApiBase = (baseUrl: string): void => {
  // Implementation for dynamic base URL switching
};

export const getTenantApiBase = (tenantSlug?: string): string => {
  if (!tenantSlug) return getApiBase();
  
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return `${baseUrl}/tenant/${tenantSlug}/api`;
};
```

### Add tenant environment variables:

```env
VITE_TENANT_MODE=true
VITE_DEFAULT_TENANT=default
```

### Update your CRUD configs:

```typescript
const userConfig: CrudConfig<User> = {
  endpoint: getTenantApiBase('users'), // or '/users' for single-tenant
  // ... rest of config
};
```

## Testing Your Configuration

1. **Start your backend**
2. **Set VITE_API_URL** in `.env.local`
3. **Start frontend**: `npm run dev`
4. **Check browser console** for API calls

## Troubleshooting

### CORS Issues
Add CORS headers to your backend:
```javascript
// Express example
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### 404 Errors
- Verify `VITE_API_URL` is correct
- Check if your backend endpoints match the expected structure
- Ensure `/api` prefix is included if needed

### Authentication Issues
- Verify JWT token format
- Check `Authorization: Bearer <token>` header
- Ensure login endpoint returns the expected format

## Production Deployment

```env
# Production environment
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_NAME=Production App
VITE_DEV_MODE=false
```

The configuration automatically adapts to production vs development environments.
