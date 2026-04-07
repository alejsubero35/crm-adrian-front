import { User } from '../features/auth/AuthContext';

interface LoginCredentials {
  username: string; // Puede ser username o email
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
  token_type: string;
  expires_in: number;
}

// Usuarios demo para pruebas
const DEMO_USERS: User[] = [
  {
    id: 1,
    name: 'Administrador',
    email: 'admin@demo.com',
    roles: ['admin', 'user']
  },
  {
    id: 2,
    name: 'Usuario Demo',
    email: 'user@demo.com',
    roles: ['user']
  },
  {
    id: 3,
    name: 'Manager',
    email: 'manager@demo.com',
    roles: ['manager', 'user']
  }
];

export class DemoAuthService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'auth_user';

  /**
   * Login simulado - acepta cualquier credencial
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simular validación - acepta cualquier username/password
    // En producción, aquí validarías contra tu API
    if (!credentials.username || !credentials.password) {
      throw new Error('Usuario y contraseña son requeridos');
    }

    // Seleccionar usuario demo basado en el username
    let demoUser = DEMO_USERS[0]; // Default admin

    if (credentials.username.includes('admin')) {
      demoUser = DEMO_USERS[0];
    } else if (credentials.username.includes('user')) {
      demoUser = DEMO_USERS[1];
    } else if (credentials.username.includes('manager')) {
      demoUser = DEMO_USERS[2];
    }

    // Generar token fake
    const token = `demo_token_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    // Almacenar datos
    this.storeUser(demoUser);
    this.storeToken(token);

    return {
      user: demoUser,
      token,
      token_type: 'Bearer',
      expires_in: 3600
    };
  }

  /**
   * Register simulado
   */
  async register(credentials: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<AuthResponse> {
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (credentials.password !== credentials.password_confirmation) {
      throw new Error('Las contraseñas no coinciden');
    }

    const newUser: User = {
      id: DEMO_USERS.length + 1,
      name: credentials.name,
      email: credentials.email,
      roles: ['user']
    };

    const token = `demo_token_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    this.storeUser(newUser);
    this.storeToken(token);

    return {
      user: newUser,
      token,
      token_type: 'Bearer',
      expires_in: 3600
    };
  }

  /**
   * Logout simulado
   */
  async logout(): Promise<void> {
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Limpiar datos locales
    this.clearAuthData();
  }

  /**
   * Obtener usuario actual
   */
  async getCurrentUser(): Promise<User | null> {
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return this.getStoredUser();
  }

  /**
   * Obtener usuario almacenado
   */
  getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem(DemoAuthService.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }

  /**
   * Verificar roles
   */
  hasRole(role: string): boolean {
    const user = this.getStoredUser();
    if (!user?.roles) return false;

    const roles = Array.isArray(user.roles) 
      ? user.roles 
      : [user.roles];

    return roles.some(r => 
      typeof r === 'string' ? r === role : r.slug === role || r.name === role
    );
  }

  /**
   * Refrescar usuario
   */
  async refreshUser(): Promise<User | null> {
    return await this.getCurrentUser();
  }

  /**
   * Almacenar usuario
   */
  private storeUser(user: User): void {
    try {
      localStorage.setItem(DemoAuthService.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user:', error);
    }
  }

  /**
   * Almacenar token
   */
  private storeToken(token: string): void {
    try {
      localStorage.setItem(DemoAuthService.TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  /**
   * Obtener token almacenado
   */
  private getStoredToken(): string | null {
    try {
      return localStorage.getItem(DemoAuthService.TOKEN_KEY);
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  /**
   * Limpiar datos de autenticación
   */
  private clearAuthData(): void {
    try {
      localStorage.removeItem(DemoAuthService.USER_KEY);
      localStorage.removeItem(DemoAuthService.TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }
}

export const demoAuthService = new DemoAuthService();
