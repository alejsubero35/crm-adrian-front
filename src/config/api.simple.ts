// Configuración simple para CRUD Boilerplate
const getApiBaseUrl = () => {
  // Prioridad: Variable de entorno > fallback
  return import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
};

export const getApiBase = () => getApiBaseUrl();
export const API_URL = getApiBaseUrl();

// Default fetch options
export const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
};

// Auth header creator
export const authHeader = (token: string | null): Record<string, string> => {
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

// Convenience helpers to build full URLs
export const url = (path: string) => `${getApiBase()}${path}`;
