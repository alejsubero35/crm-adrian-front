import { getApiBase, defaultOptions, authHeader } from "@/config/api";

// Token storage key
const TOKEN_KEY = 'auth_token';

interface RequestOptions {
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    // Try to load token from storage on initialization
    this.loadToken();
  }

  /**
   * Set token for auth requests
   */
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Clear token (logout)
   */
  clearToken(): void {
    this.token = null;
    localStorage.removeItem(TOKEN_KEY);
  }

  /**
   * Load token from storage
   */
  loadToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      this.token = token;
      return token;
    }
    return null;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, auth: boolean = true, options: RequestOptions = {}): Promise<T> {
    try {
      const url = `${getApiBase()}${endpoint}`;
      const token = auth ? this.loadToken() : null;

      const headers = {
        ...defaultOptions.headers,
        ...(auth && token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
      };


      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...headers,
        },
        mode: 'cors',
        credentials: options.withCredentials ? 'include' : 'omit',
        redirect: 'follow',
        cache: 'no-store',
      });

      if (!response.ok) {
        // If unauthorized or session expired, trigger global logout to redirect to login
        if (response.status === 401 || response.status === 419) {
          try { window.dispatchEvent(new Event('app-logout')); } catch (e) { /* noop */ }
        }
        // Do not dispatch a global logout here; let the auth layer decide how to react
        const error = await response.json().catch(() => ({ message: 'Error de servidor' }));
        throw new Error(error.message || `HTTP error ${response.status}`);
      }

      try {
        const ct = response.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          return await response.json();
        }
        const text = await response.text();
        throw new Error('API response was not JSON');
      } catch (e) {
        throw e;
      }
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * POST request
   */
  async post<D, T>(endpoint: string, data: D, auth: boolean = true, options: RequestOptions = {}): Promise<T> {
    try {
      const url = `${getApiBase()}${endpoint}`;
      const token = auth ? this.loadToken() : null;

      const headers = {
        ...defaultOptions.headers,
        ...(auth && token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...headers,
        },
        mode: 'cors',
        credentials: options.withCredentials ? 'include' : 'omit',
        redirect: 'follow',
        cache: 'no-store',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const isAuthEndpoint = endpoint === '/login' || endpoint === '/logout';
        if ((response.status === 401 || response.status === 419) && !isAuthEndpoint) {
          try { window.dispatchEvent(new Event('app-logout')); } catch (e) { /* noop */ }
        }
        // Do not dispatch a global logout here; let the auth layer decide how to react
        const error = await response.json().catch(() => ({ message: 'Error de servidor' }));
        throw new Error(error.message || `HTTP error ${response.status}`);
      }

      try {
        const ct = response.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          return await response.json();
        }
        const text = await response.text();
        console.error('API POST non-JSON response:', url, text.slice(0, 200));
        throw new Error('API response was not JSON');
      } catch (e) {
        throw e;
      }
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * PUT request
   */
  async put<D, T>(endpoint: string, data: D, auth: boolean = true): Promise<T> {
    try {
      const url = `${getApiBase()}${endpoint}`;
      const token = auth ? this.loadToken() : null;

      // If this request requires auth but there's no token, do not execute the request
      if (auth && !token) {
        console.warn(`API PUT aborted for '${endpoint}': no authentication token available.`);
        throw new Error('No authentication token available');
      }

      const headers = {
        ...defaultOptions.headers,
        ...(auth && token ? authHeader(token) : {})
      };

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          ...headers,
        },
        mode: 'cors',
        redirect: 'follow',
        cache: 'no-store',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        // Do not dispatch a global logout here; let the auth layer decide how to react
        if (response.status === 401 || response.status === 419) {
          try { window.dispatchEvent(new Event('app-logout')); } catch (e) { /* noop */ }
        }
        const error = await response.json().catch(() => ({ message: 'Error de servidor' }));
        throw new Error(error.message || `HTTP error ${response.status}`);
      }

      try {
        return await response.json();
      } catch (e) {
        return null as unknown as T;
      }
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * PATCH request
   */
  async patch<D, T>(endpoint: string, data: D, auth: boolean = true, options: RequestOptions = {}): Promise<T> {
    try {
      const url = `${getApiBase()}${endpoint}`;
      const token = auth ? this.loadToken() : null;

      if (auth && !token) {
        console.warn(`API PATCH aborted for '${endpoint}': no authentication token available.`);
        throw new Error('No authentication token available');
      }

      const headers = {
        ...defaultOptions.headers,
        ...(auth && token ? authHeader(token) : {}),
        ...options.headers
      };

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          ...headers,
        },
        mode: 'cors',
        credentials: options.withCredentials ? 'include' : 'omit',
        redirect: 'follow',
        cache: 'no-store',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 419) {
          try { window.dispatchEvent(new Event('app-logout')); } catch (e) { /* noop */ }
        }
        const error = await response.json().catch(() => ({ message: 'Error de servidor' }));
        throw new Error(error.message || `HTTP error ${response.status}`);
      }

      try {
        return await response.json();
      } catch (e) {
        return null as unknown as T;
      }
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, auth: boolean = true): Promise<T> {
    try {
      const url = `${getApiBase()}${endpoint}`;
      const token = auth ? this.loadToken() : null;

      // If this request requires auth but there's no token, do not execute the request
      if (auth && !token) {
        console.warn(`API DELETE aborted for '${endpoint}': no authentication token available.`);
        throw new Error('No authentication token available');
      }

      const headers = {
        ...defaultOptions.headers,
        ...(auth && token ? authHeader(token) : {})
      };

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          ...headers,
        },
        mode: 'cors',
        redirect: 'follow',
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 419) {
          try { window.dispatchEvent(new Event('app-logout')); } catch (e) { /* noop */ }
        }
        const error = await response.json().catch(() => ({ message: 'Error de servidor' }));
        throw new Error(error.message || `HTTP error ${response.status}`);
      }

      try {
        return await response.json();
      } catch (e) {
        return null as unknown as T;
      }
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Error handling for network/fetch errors
   */
  private handleError(error: unknown): void {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Error de conexión a la API:', error);
      // Handle connection errors - could be offline or API server down
    } else if (error instanceof Error) {
      // Generic error handling
      console.error('Error en petición API:', error.message);

      // Handle token expiration/invalid cases
      // Nota: no limpiar el token automáticamente para evitar bucles de 401 en consultas como /navigation.
      // Dejar que el flujo de autenticación maneje la expiración (p.ej. mediante un guard en rutas protegidas).
    }
  }
}

export const apiService = new ApiService();
