import { apiService } from './api.service';

interface LoginCredentials {
  username: string; // Puede ser username o email
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface AuthResponse {
  user: {
    id: string | number;
    name: string;
    email: string;
    roles?: string[] | { name: string; slug: string }[];
  };
  token: string;
  token_type: string;
  expires_in: number;
}

export class AuthService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'auth_user';

  /**
   * Login user and store token
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<LoginCredentials, AuthResponse>(
        '/login',
        credentials,
        false
      );

      // Store token
      apiService.setToken(response.token);

      // Store user data
      this.storeUser(response.user);

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<RegisterCredentials, AuthResponse>(
        '/register',
        credentials,
        false
      );

      // Store token
      apiService.setToken(response.token);

      // Store user data
      this.storeUser(response.user);

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Logout user and clear stored data
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint
      await apiService.post('/logout', {}, true);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local data regardless of API call success
      this.clearAuthData();
      apiService.clearToken();
    }
  }

  /**
   * Get current user from API
   */
  async getCurrentUser(): Promise<AuthResponse['user'] | null> {
    try {
      const token = apiService.loadToken();
      if (!token) return null;

      const user = await apiService.get<AuthResponse['user']>('/user');
      this.storeUser(user);
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      // If 401, clear auth data
      if (error instanceof Error && error.message.includes('401')) {
        this.clearAuthData();
        apiService.clearToken();
      }
      return null;
    }
  }

  /**
   * Get stored user from localStorage
   */
  getStoredUser(): AuthResponse['user'] | null {
    try {
      const userStr = localStorage.getItem(AuthService.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!apiService.loadToken() && !!this.getStoredUser();
  }

  /**
   * Check if user has specific role
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
   * Refresh user data from API
   */
  async refreshUser(): Promise<AuthResponse['user'] | null> {
    return await this.getCurrentUser();
  }

  /**
   * Store user data in localStorage
   */
  private storeUser(user: AuthResponse['user']): void {
    try {
      localStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user:', error);
    }
  }

  /**
   * Clear all auth data from localStorage
   */
  private clearAuthData(): void {
    try {
      localStorage.removeItem(AuthService.USER_KEY);
      localStorage.removeItem(AuthService.TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }
}

export const authService = new AuthService();
