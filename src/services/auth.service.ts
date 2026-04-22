import { apiService } from './api.service';
import type { User } from '@/contexts/authContextObj';

const isTenantHost = (): boolean => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  const env = (import.meta as unknown) as { env?: Record<string, string> };
  const centralHosts = (env.env?.VITE_CENTRAL_HOSTS || '')
    .split(',')
    .map(h => h.trim().toLowerCase())
    .filter(Boolean);
  const centralDomain = (env.env?.VITE_CENTRAL_DOMAIN || '').toLowerCase();
  const tenantBase = (env.env?.VITE_TENANT_BASE_DOMAIN || '').toLowerCase();

  // Config-driven detection first
  if (centralHosts.includes(host)) return false;
  if (centralDomain && host === centralDomain) return false;
  if (tenantBase && host.endsWith(tenantBase) && host !== tenantBase) return true;

  // Local dev: any subdomain on sslip.io (except bare 127-0-0-1) is tenant
  if (/\.sslip\.io$/i.test(host) && host !== '127-0-0-1.sslip.io') return true;

  // Fallback: assume central if not matched explicitly (avoid false positives on multi-level central hosts)
  return false;
};

interface LoginCredentials {
  email: string;
  password: string;
}

interface ApiLoginResponse {
  token: string;
  user?: User;
}

interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  STORAGE_USER_KEY: 'auth_user',
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiService.post<LoginCredentials, ApiLoginResponse>(
        '/login',
        credentials,
        false,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      );

      console.log('Token recibido:', response.token);

      // Guardamos el token
      apiService.setToken(response.token);

      console.log('Token almacenado:', apiService.loadToken());

      // Preferimos el usuario devuelto por login y usamos /me como respaldo
      const user = response.user ?? await this.getCurrentUser();

      // Bloquear super-admin en hosts de tenant (login directo no permitido)
      const tenantHost = isTenantHost();
      const rolesVal = (user as any)?.roles ?? (user as any)?.data?.roles ?? null;
      const hasSuperAdmin = (() => {
        if (!rolesVal) return false;
        if (typeof rolesVal === 'string') return rolesVal === 'super-admin';
        if (Array.isArray(rolesVal)) {
          return rolesVal.some((r) => {
            if (typeof r === 'string') return r === 'super-admin';
            if (r && typeof r === 'object') {
              const obj = r as Record<string, unknown>;
              const slug = typeof obj.slug === 'string' ? obj.slug : undefined;
              const name = typeof obj.name === 'string' ? obj.name : undefined;
              return slug === 'super-admin' || name === 'super-admin';
            }
            return false;
          });
        }
        return false;
      })();

      if (tenantHost && hasSuperAdmin) {
        apiService.clearToken();
        try { localStorage.removeItem(this.STORAGE_USER_KEY); } catch (e) { /* noop */ }
        throw new Error('SUPER_ADMIN_TENANT_FORBIDDEN');
      }
      // Guardamos el usuario para disponibilidad inmediata
      try {
        localStorage.setItem(this.STORAGE_USER_KEY, JSON.stringify(user));
        localStorage.setItem('role', JSON.stringify((user as any)?.data?.roles));
      } catch (e) {
        console.warn('No se pudo guardar el usuario en localStorage', e);
      }

      // Obtener estado de caja para el usuario y guardarlo en localStorage
      try {
        if (user && typeof user === 'object' && 'data' in (user as any) && (user as any).data && 'id' in (user as any).data) {
          const userId = (user as any).data.id;
          const cajaStatus = await apiService.get<{ data?: { open?: boolean; id?: number; arqueo?: { id?: number } } }>(`/caja/estado/${userId}`, true, {
            headers: {
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            }
          });
          console.log('Estado de caja obtenido:', cajaStatus);
          try {
            const isOpen = cajaStatus && (cajaStatus as any).data && typeof (cajaStatus as any).data.open !== 'undefined'
              ? (cajaStatus as any).data.open
              : null;
            // Obtener id de la caja (preferir data.arqueo.id, luego data.id)
            const cajaId = (cajaStatus as any)?.data?.arqueo?.id ?? (cajaStatus as any)?.data?.id ?? null;
            
            localStorage.setItem('caja_status', JSON.stringify(isOpen));
            localStorage.setItem('caja_id', JSON.stringify(cajaId));
          } catch (e) {
            // No bloquear el login si falla la consulta del estado de caja
            console.warn('No se pudo obtener el estado de caja:', e);
          }
        }
      } catch (e) {
        // No bloquear el login si falla la consulta del estado de caja
        console.warn('Error al consultar estado de caja:', e);
      }

      return {
        user: user as User,
        token: response.token
      };
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      throw error;
    }
  },

  /**
   * Cerrar sesión: llamar al endpoint de logout y limpiar TODO el localStorage
   */
  async logout(): Promise<void> {
    // Only call the backend logout endpoint. Do not perform client-side cleanup here;
    // the caller (AuthContext) will clear localStorage and handle navigation after response.
    await apiService.post('/logout', {}, true, {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
  },

  /**
   * Obtener el usuario actual
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = apiService.loadToken();
      console.log('Token para getCurrentUser:', token);

      // If there's no token, return null silently (no network request)
      if (!token) {
        return null;
      }

      try {
        const user = await apiService.get<User>('/me', true, {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        return user;
  } catch (error) {
        // Si el error es 401, cerrar sesión automáticamente
        // Si el error es 401, cerrar sesión automáticamente
        if (typeof error === 'object' && error !== null && 'response' in error && (error as any).response?.status === 401) {
          await this.logout();
          return null;
        }
        // Otros errores
        console.error('Error al obtener usuario actual:', error);
        throw error;
      }
    } catch (outerError) {
      // Si ocurre un error fuera del try interno
      console.error('Error inesperado en getCurrentUser:', outerError);
      throw outerError;
    }
  }
};
