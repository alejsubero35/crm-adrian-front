// Archivo de verificación para forzar recarga
console.log('Demo mode loaded successfully');

// Verificar que useDemoAuth esté disponible
import { useDemoAuth } from './DemoAuthContext';

export const testDemoAuth = () => {
  try {
    const auth = useDemoAuth();
    console.log('DemoAuth working:', { 
      isDemoMode: auth.isDemoMode,
      isAuthenticated: auth.isAuthenticated,
      user: auth.user 
    });
    return true;
  } catch (error) {
    console.error('DemoAuth error:', error);
    return false;
  }
};
