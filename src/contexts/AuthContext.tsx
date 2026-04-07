// This file intentionally re-exports the project's canonical auth hooks/context.
// The project already defines an `AuthContext`/`useAuth` pair under `authContextObj` and `useAuth.ts`.
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth.service';
import { apiService } from '@/services/api.service';
import { setApiBaseTenant, setApiBaseCentral, setApiBaseFromLocation } from '@/config/api';
import { AuthContext, User, AuthContextType } from './authContextObj';
import { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';

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

	// Fallback: assume central to avoid blocking super-admin on multi-level central hosts
	return false;
};

export function AuthProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	// Detección robusta de super-admin en diferentes formas de payload
	const hasSuperAdminRole = (u: unknown): boolean => {
		try {
			if (!u || typeof u !== 'object') return false;
			const plain = u as { roles?: unknown };
			const wrapper = u as { data?: { roles?: unknown } };
			const rolesVal: unknown = (plain && plain.roles !== undefined)
				? plain.roles
				: (wrapper.data ? wrapper.data.roles : undefined);
			if (!rolesVal) {
				// fallback a localStorage si el backend guardó roles allí
				try {
					const raw = localStorage.getItem('role');
					if (raw) {
						const parsed = JSON.parse(raw);
						if (typeof parsed === 'string') return parsed === 'super-admin';
						if (Array.isArray(parsed)) return parsed.includes('super-admin');
					}
				} catch (e) { /* noop */ }
				return false;
			}
			if (typeof rolesVal === 'string') return rolesVal === 'super-admin';
			if (Array.isArray(rolesVal)) {
				// puede ser array de strings o de objetos {slug|name}
				return (rolesVal as unknown[]).some((r) => {
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
		} catch {
			return false;
		}
	};
	const STORAGE_USER_KEY = authService.STORAGE_USER_KEY || 'auth_user';
	const [user, setUser] = useState<User | null>(() => {
		try {
			const raw = localStorage.getItem(STORAGE_USER_KEY);
			return raw ? (JSON.parse(raw) as User) : null;
		} catch {
			return null;
		}
	});
	const shouldLogout = useRef(false);
	const lastLoginAt = useRef<number>(0);
	const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const navigate = useNavigate();
	const { toast } = useToast();

	useEffect(() => {
		let mounted = true;
		(async () => {
			setIsLoading(true);
			try {
				// Snapshot: was there a token when this request started?
				const startedWithToken = !!apiService.loadToken();
				const current = await authService.getCurrentUser();
				const tenantHost = isTenantHost();
				if (mounted && current) {
					if (tenantHost && hasSuperAdminRole(current)) {
						// No permitir super-admin en host tenant al iniciar app (p.ej. token guardado)
						apiService.clearToken();
						setUser(null);
						toast({ title: 'Acceso denegado', description: 'El super admin no puede usar tenant directo. Usa impersonate.', variant: 'destructive' });
						navigate('/login', { replace: true });
						return;
					}
					setUser(current);
					try { localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(current)); } catch (e) { console.warn('No se pudo guardar usuario en localStorage', e); }
				} else if (mounted && current === null) {
					// Only schedule logout if this call STARTED with a token (avoid race after login)
					if (startedWithToken) {
						shouldLogout.current = true;
					}
				}
			} catch (err) {
				console.warn('No se pudo obtener usuario actual en initAuth', err);
			} finally {
				if (mounted) setIsLoading(false);
			}
		})();
		// Escuchar el evento global de logout por 401
		const handleLogoutEvent = () => {
			shouldLogout.current = false;
			logout();
		};
		window.addEventListener('app-logout', handleLogoutEvent);
		return () => {
			mounted = false;
			window.removeEventListener('app-logout', handleLogoutEvent);
		};
	}, [STORAGE_USER_KEY]);

	useEffect(() => {
		if (shouldLogout.current) {
			// Avoid auto-logout immediately after a recent successful login
			const secondsSinceLogin = (Date.now() - (lastLoginAt.current || 0)) / 1000;
			if (secondsSinceLogin > 5) {
				shouldLogout.current = false;
				logout();
			} else {
				// Defer logout because we just logged in
				shouldLogout.current = false;
			}
		}
	}, [user]);

	const login = async (identifier: string, password: string): Promise<boolean> => {
		setIsLoading(true);
		try {
			shouldLogout.current = false;
			try {
				queryClient.removeQueries({ queryKey: ['user', 'context'] });
			} catch {
				// ignore
			}
			// Siempre recalcular la base desde el host actual (tenant vs central) antes de autenticar
			try { setApiBaseFromLocation(); } catch (e) { /* noop */ }
			// Si el correo incluye dominio de tenant, ajustamos la base API dinámicamente
			try {
				const m = /@([a-zA-Z0-9_-]+)\.127-0-0-1\.sslip\.io$/i.exec(identifier);
				if (m && m[1]) {
					setApiBaseTenant(m[1]);
					console.log('[Auth] Tenant detectado:', m[1]);
				}
			} catch (e) { /* noop */ }
			console.log('[Auth] Base API antes de login (debug):', (window as unknown as { ___debugApiBase?: string }).___debugApiBase ?? 'no-debug-var');
			const response = await authService.login({ email: identifier, password });
			console.log('[Auth] Login OK, usuario id:', (response.user as unknown as { id?: unknown })?.id);
			const tenantHost = isTenantHost();
			if (tenantHost && hasSuperAdminRole(response.user)) {
				// Bloquear login de super-admin directamente en hosts de tenant; se debe usar impersonate.
				apiService.clearToken();
				setUser(null);
				toast({ title: 'Acceso denegado', description: 'El super admin no puede iniciar sesión directo en este tenant. Usa impersonate desde el central.', variant: 'destructive' });
				navigate('/login', { replace: true });
				return false;
			}
			setUser(response.user as User);
			lastLoginAt.current = Date.now();
			try { localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(response.user)); } catch (e) { console.warn('No se pudo guardar usuario en localStorage', e); }
			toast({ title: 'Inicio de sesión', description: 'Autenticación correcta' });
			try {
				queryClient.invalidateQueries({ queryKey: ['user', 'context'] });
			} catch {
				// ignore
			}
			// Redirección basada en entorno: en host de tenant siempre POS; en central, super-admin => /admin
			const destination = tenantHost ? '/pos/products' : (hasSuperAdminRole(response.user) ? '/admin' : '/pos/products');
			// Debug logs para verificar rol y destino
			try {
				console.log('[Auth] Usuario autenticado:', response.user);
				console.log('[Auth] isSuperAdmin:', hasSuperAdminRole(response.user));
				console.log('[Auth] Navegando a:', destination);
			} catch (e) { /* noop */ }
			navigate(destination);
			return true;
		} catch (err) {
			const errorMsg = typeof err === 'object' && err !== null && 'message' in err ? (err as { message?: string }).message : '';
			const friendly = errorMsg === 'SUPER_ADMIN_TENANT_FORBIDDEN'
				? 'El super admin no puede iniciar sesión en este tenant. Usa impersonate desde el central.'
				: (errorMsg || 'No se pudo iniciar sesión');
			toast({ title: 'Error', description: friendly, variant: 'destructive' });
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	const logout = async () => {
		setIsLoading(true);
		try {
			await authService.logout();
		} catch (e) {
			console.warn('Error en logout service', e);
		}
		try {
			queryClient.removeQueries({ queryKey: ['user', 'context'] });
		} catch {
			// ignore
		}
		// Clear all local/session storage to remove any leftover session data
		try { localStorage.clear(); } catch (e) { console.warn('No se pudo limpiar localStorage:', e); }
		try { sessionStorage.clear(); } catch (e) { /* ignore */ }
		// No forzar API central: si estás en un subdominio tenant, la base debe seguir ese host.
		try { setApiBaseFromLocation(); } catch (e) { try { setApiBaseCentral(); } catch (e2) { /* noop */ } }
		// Clear in-memory user state and navigate to login
		setUser(null);
		toast({ title: 'Sesión cerrada', description: 'Has cerrado sesión',variant: 'success' });
		navigate('/login');
		setIsLoading(false);
	};

	useEffect(() => {
		if (!user) {
			if (idleTimerRef.current) {
				clearTimeout(idleTimerRef.current);
				idleTimerRef.current = null;
			}
			return;
		}

		const meta = (import.meta as unknown) as { env?: Record<string, string> };
		const idleMsRaw = meta.env?.VITE_IDLE_LOGOUT_MS;
		const idleMs = (() => {
			const n = Number(idleMsRaw);
			return Number.isFinite(n) && n > 0 ? n : 15 * 60 * 1000;
		})();

		const clearExistingTimer = () => {
			if (idleTimerRef.current) {
				clearTimeout(idleTimerRef.current);
				idleTimerRef.current = null;
			}
		};

		const scheduleCheck = () => {
			clearExistingTimer();
			idleTimerRef.current = setTimeout(() => {
				const hasToken = !!apiService.loadToken();
				let hasStoredUser = false;
				try {
					hasStoredUser = !!localStorage.getItem(STORAGE_USER_KEY);
				} catch (e) {
					hasStoredUser = false;
				}
				if (!hasToken || !hasStoredUser) {
					logout();
					return;
				}
				scheduleCheck();
			}, idleMs);
		};

		const handleActivity = () => {
			scheduleCheck();
		};

		scheduleCheck();

		const opts: AddEventListenerOptions = { passive: true };
		window.addEventListener('mousemove', handleActivity, opts);
		window.addEventListener('mousedown', handleActivity, opts);
		window.addEventListener('keydown', handleActivity, opts);
		window.addEventListener('touchstart', handleActivity, opts);
		window.addEventListener('scroll', handleActivity, opts);
		window.addEventListener('focus', handleActivity, opts);

		return () => {
			clearExistingTimer();
			window.removeEventListener('mousemove', handleActivity);
			window.removeEventListener('mousedown', handleActivity);
			window.removeEventListener('keydown', handleActivity);
			window.removeEventListener('touchstart', handleActivity);
			window.removeEventListener('scroll', handleActivity);
			window.removeEventListener('focus', handleActivity);
		};
	}, [user, STORAGE_USER_KEY]);

	return (
		<AuthContext.Provider value={{ user, login, logout, isLoading }}>
			{children}
		</AuthContext.Provider>
	);
}

export type { User, AuthContextType } from './authContextObj';

