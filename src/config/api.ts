
// API Configuration for CRUD Boilerplate
// Simple, clean, and extensible configuration

// Get API base URL from environment or fallback to localhost
export const getApiBase = (): string => {
  return import.meta.env.VITE_API_URL || 'http://conapdis.test/api/v1';
};

// Export for direct access
export const API_URL = getApiBase();

// Default fetch options
export const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
};

// Auth header creator for JWT tokens
export const authHeader = (token: string | null): Record<string, string> => {
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

// Helper to build full URLs
export const url = (path: string): string => `${getApiBase()}${path}`;

// Optional: Future multitenancy support (commented for now)
/*
// Uncomment and modify if you need multitenancy later
export const setApiBase = (baseUrl: string): void => {
  // Implementation for dynamic base URL switching
  // This could be stored in context, state, or localStorage
};

export const getTenantApiBase = (tenantSlug?: string): string => {
  if (!tenantSlug) return getApiBase();
  
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return `${baseUrl}/tenant/${tenantSlug}/api`;
};
*/
