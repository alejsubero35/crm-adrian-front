
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { usePosT } from "@/i18n/pos";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const t = usePosT();

  // Show loading state when authentication is being checked
  if (isLoading) {
    // Pausa overlay global durante el chequeo para no tapar la vista
    return null;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }


  return children;
}
