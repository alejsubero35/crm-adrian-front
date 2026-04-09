
const API_BASE_STORAGE_KEY = 'api_base_url';

const normalizeBaseUrl = (value: string): string => value.replace(/\/+$/, '');

const getEnvApiBase = (): string => import.meta.env.VITE_API_URL || 'http://api-crm-adrian.test/api';

let apiBaseOverride: string | null = null;

export const getApiBase = (): string => {
  const storedBase = typeof window !== 'undefined'
    ? window.localStorage.getItem(API_BASE_STORAGE_KEY)
    : null;

  const apiBase = normalizeBaseUrl(apiBaseOverride || storedBase || getEnvApiBase());

  if (typeof window !== 'undefined') {
    (window as Window & { ___debugApiBase?: string }).___debugApiBase = apiBase;
  }

  return apiBase;
};

export const setApiBase = (baseUrl: string): void => {
  const normalized = normalizeBaseUrl(baseUrl);
  apiBaseOverride = normalized;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(API_BASE_STORAGE_KEY, normalized);
    (window as Window & { ___debugApiBase?: string }).___debugApiBase = normalized;
  }
};

export const setApiBaseCentral = (): void => {
  setApiBase(import.meta.env.VITE_API_BASE_CENTRAL || getEnvApiBase());
};

export const setApiBaseTenant = (_tenantSlug: string): void => {
  setApiBaseCentral();
};

export const setApiBaseFromLocation = (): void => {
  setApiBaseCentral();
};

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
