import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-primary/10 via-white to-soft-purple/30 p-6">
      <div className="max-w-xl w-full text-center bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="mb-4">
          <h1 className="text-6xl font-extrabold tracking-tight text-blue-primary">404</h1>
          <p className="mt-2 text-lg text-gray-600">La página "{location.pathname}" no existe.</p>
        </div>
        <p className="text-sm text-gray-500 mb-6">Puede que el enlace esté roto o haya sido movido.</p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>Regresar</Button>
          <Button onClick={() => navigate('/dashboard')}>Ir al Inicio</Button>
          <Button variant="secondary" onClick={() => navigate('/login')}>Ir al Login</Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
