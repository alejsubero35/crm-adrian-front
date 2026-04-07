
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/useAuth";
import { Loader2, Mail, Lock, Eye, EyeOff, ShoppingCart, ArrowRight, Fingerprint } from "lucide-react";
import { Navigate, Link } from "react-router-dom";
import { apiService } from "@/services/api.service";
import { authenticateWithWebAuthn, isWebAuthnAvailable } from '@/services/webauthn.service';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const { login, isLoading } = useAuth();
  const token = apiService.loadToken();
  const [webauthnAvailable, setWebauthnAvailable] = useState(false);
  const [webauthnLoading, setWebauthnLoading] = useState(false);

  useEffect(() => {
    setWebauthnAvailable(isWebAuthnAvailable());
  }, []);

  // Si existe un token, redirigir al dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };


  const handleWebAuthnLogin = async () => {
    try {
      setWebauthnLoading(true);
      const token = await authenticateWithWebAuthn(email || undefined);
      if (token) {
        apiService.setToken(token);
        // reload or navigate to dashboard - the auth context should detect token
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('WebAuthn login failed', err);
      // Optionally show a toast here
    } finally {
      setWebauthnLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-blue-primary/10 via-white to-soft-purple/30">
      {/* Brand / Left panel */}
      <div className="hidden md:flex items-center justify-center p-10">
        <div className="w-full max-w-lg rounded-2xl overflow-hidden ring-1 ring-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="bg-gradient-to-br from-blue-primary to-blue-secondary text-white p-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center overflow-hidden">
                <img src="/img/ms-icon-310x310.png" alt="Logo Venta Simplyfy" className="h-6 w-6 object-contain" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">Venta Simplyfy</h2>
            </div>
            <p className="mt-3 text-white/90">Punto de venta rápido, moderno y pensado para operadores.</p>
          </div>
          <div className="bg-white p-8">
            <ul className="space-y-3 text-gray-700 text-sm">
              <li className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Atajos de teclado para máxima velocidad</li>
              <li className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-blue-primary" /> Flujo de cobro claro y sin fricción</li>
              <li className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-amber-400" /> Resumen y registro integrado</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form / Right panel */}
  <div className="flex flex-col items-center justify-center p-6 md:p-10 md:flex-row md:items-center">
        {/* Mobile header with brand logo - visible only on small screens */}
        <div className="flex flex-col items-center gap-3 mb-6 md:hidden">
            <div className="bg-transparent rounded-2xl p-2">
            
            </div>
        </div>

          {/* Card: mobile-first modern look, desktop preserved with md: classes */}
          <Card className="w-full max-w-sm p-6 sm:p-8 bg-white/95 backdrop-blur-md md:bg-white ring-0 md:ring-1 md:ring-gray-100 rounded-3xl md:rounded-2xl shadow-xl md:shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="rounded-xl p-1 flex items-center justify-center">
                <div className="rounded-lg bg-white p-1 flex items-center justify-center">
                  <img src="/img/ms-icon-310x310.png" alt="Logo Venta Simplyfy" className="h-12 w-12 sm:h-36 sm:w-36 rounded-md" />
                </div>
              </div>
          <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center">Iniciar sesión</h1>
              <p className="mt-1 text-sm text-gray-500 text-center">Accede con tus credenciales</p>
              <div className="mt-3 mx-auto w-60 h-0.5 bg-gradient-to-r from-blue-primary to-blue-secondary rounded-full" />
          </div>

            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo o usuario</Label>
              <div className="relative">
                <div className="flex items-center h-12 bg-white border border-gray-300  rounded-xl shadow-sm transition-all duration-150">
                  <span className="flex items-center justify-center h-full px-4 bg-transparent">
                    <Mail className="h-7 w-7 text-gray-400 bg-transparent" />
                  </span>
                  <input
                    id="email"
                    type="text"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=""
                    className="flex-1 h-full border-none outline-none text-gray-700 placeholder-gray-400 bg-transparent w-full"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <div className="flex items-center h-12 bg-white border border-gray-300  rounded-xl shadow-sm transition-all duration-150">
                  <span className="flex items-center justify-center h-full px-4 bg-transparent">
                    <Lock className="h-7 w-7 text-gray-400 bg-transparent" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => setCapsOn((e.getModifierState && e.getModifierState('CapsLock')) || false)}
                    placeholder=""
                    className="flex-1 h-full border-none outline-none text-gray-700 placeholder-gray-400 pr-12 bg-transparent w-full"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 rounded-full p-1 transition-all duration-150"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    style={{ right: '1rem' }}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {capsOn && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 inline-flex items-center w-fit">Bloq Mayús activado</p>
              )}
            </div>

            <Button
                type="submit"
                className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-primary to-blue-secondary text-white shadow-md hover:opacity-95 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Ingresar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {webauthnAvailable && (
            <div className="mt-4 md:hidden">
              <Button
                type="button"
                onClick={handleWebAuthnLogin}
                className="w-full h-12 rounded-lg bg-gradient-to-r from-[#FF7A1A] to-[#FFB047] text-white flex items-center justify-center shadow-md hover:opacity-95"
                disabled={webauthnLoading}
              >
                {webauthnLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  <>
                    <Fingerprint className="mr-2 h-4 w-4" />
                    Acceso con Biometría
                  </>
                )}
              </Button>
            </div>
            
          )}
    

          <div className="mt-6 text-center text-xs sm:text-sm text-gray-500">
            <p>¿Olvidaste tu contraseña? <Link to="/forgot-password" className="text-blue-500 hover:underline">Restablecer contraseña</Link></p>
           
          </div>
        </Card>
      </div>
    </div>
  );
}
