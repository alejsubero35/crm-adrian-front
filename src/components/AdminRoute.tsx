import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { LogoOverlay } from '@/components/ui/LogoOverlay';

interface AdminRouteProps {
  children: React.ReactNode;
}

// Protege rutas solo para super administradores.
// Si el usuario no tiene el rol requerido se redirige al dashboard.
export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <LogoOverlay
        open
        title="Validando sesión"
        message="Comprobando privilegios de administrador..."
      />
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Validación por roles[]: permite super-admin
  const hasSuperAdmin = (() => {
    const u = user as any;
    const roles = (u?.roles ?? u?.data?.roles) as string[] | undefined;
    return Array.isArray(roles) && roles.includes('super-admin');
  })();
  if (!hasSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
