import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/useAuth';
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Fingerprint,
  QrCode,
  Wrench,
  Wind,
} from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import { apiService } from '@/services/api.service';
import { authenticateWithWebAuthn, isWebAuthnAvailable } from '@/services/webauthn.service';

const LOGO_SRC = '/img/logo_solo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const { login, isLoading } = useAuth();
  const token = apiService.loadToken();
  const [webauthnAvailable, setWebauthnAvailable] = useState(false);
  const [webauthnLoading, setWebauthnLoading] = useState(false);

  useEffect(() => {
    setWebauthnAvailable(isWebAuthnAvailable());
  }, []);

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
      const authToken = await authenticateWithWebAuthn(email || undefined);
      if (authToken) {
        apiService.setToken(authToken);
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('WebAuthn login failed', err);
    } finally {
      setWebauthnLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Ambiente: malla + degradados (calor / frío → lectura HVAC) */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,rgba(241,125,30,0.22),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_100%,rgba(56,189,248,0.08),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_40%,black,transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-[hsl(var(--primary)/0.12)] blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-sky-500/10 blur-[90px]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1400px] lg:grid-cols-[1.05fr_0.95fr]">
        {/* Panel marca — desktop */}
        <aside className="relative hidden flex-col justify-between px-10 py-12 lg:flex xl:px-16 xl:py-14">
          <div>
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_24px_48px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md">
                <img src={LOGO_SRC} alt="" className="h-10 w-10 object-contain" width={40} height={40} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--primary))]">
                  IJF CRM
                </p>
                <h1 className="text-2xl font-bold tracking-tight text-white xl:text-3xl">
                  Operaciones HVAC en campo
                </h1>
              </div>
            </div>
            <p className="mt-8 max-w-md text-base leading-relaxed text-zinc-400">
              Control de activos, mantenimiento y etiquetas QR en un solo panel. Pensado para técnicos y
              administración con la misma claridad en móvil y escritorio.
            </p>

            <ul className="mt-10 space-y-4">
              {[
                {
                  icon: QrCode,
                  title: 'Vínculo por primer escaneo',
                  desc: 'QR físicos, registro rápido y ficha técnica siempre a mano.',
                },
                {
                  icon: Wrench,
                  title: 'Historial de mantenimiento',
                  desc: 'Timeline de servicios, estados y próximas visitas programadas.',
                },
                {
                  icon: Wind,
                  title: 'Listo para operar',
                  desc: 'Flujo de acceso seguro y roles alineados a tu equipo en terreno.',
                },
              ].map(({ icon: Icon, title, desc }) => (
                <li
                  key={title}
                  className="group flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 transition-colors hover:border-[hsl(var(--primary)/0.35)] hover:bg-white/[0.05]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] ring-1 ring-[hsl(var(--primary)/0.25)]">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="font-semibold text-white">{title}</p>
                    <p className="mt-0.5 text-sm text-zinc-500">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-zinc-600">
            Acceso restringido. Si no tienes credenciales, contacta al administrador de tu organización.
          </p>
        </aside>

        {/* Formulario */}
        <main className="flex flex-col items-center justify-center px-5 py-10 sm:px-8 lg:px-12 lg:py-12">
          {/* Logo móvil */}
          <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.06] shadow-lg backdrop-blur-md">
              <img src={LOGO_SRC} alt="Logo" className="h-12 w-12 object-contain" width={48} height={48} />
            </div>
            <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--primary))]">
              IJF CRM
            </p>
          </div>

          <Card className="w-full max-w-[420px] border border-white/10 bg-zinc-900/75 p-7 shadow-[0_24px_80px_-16px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-8">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-[1.65rem]">Iniciar sesión</h2>
              <p className="mt-2 text-sm text-zinc-400">Entra con tu correo y contraseña corporativos.</p>
              <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-orange-300 lg:mx-0" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">
                  Correo o usuario
                </Label>
                <div className="relative flex h-12 items-center overflow-hidden rounded-xl border border-white/10 bg-zinc-950/80 shadow-inner transition-[border-color,box-shadow] focus-within:border-[hsl(var(--primary)/0.5)] focus-within:ring-2 focus-within:ring-[hsl(var(--primary)/0.2)]">
                  <span className="flex h-full items-center justify-center border-r border-white/5 bg-white/[0.03] px-3.5">
                    <Mail className="h-5 w-5 text-zinc-500" />
                  </span>
                  <input
                    id="email"
                    type="text"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-full flex-1 border-0 bg-transparent px-3.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-0"
                    placeholder="nombre@empresa.com"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300">
                  Contraseña
                </Label>
                <div className="relative flex h-12 items-center overflow-hidden rounded-xl border border-white/10 bg-zinc-950/80 shadow-inner transition-[border-color,box-shadow] focus-within:border-[hsl(var(--primary)/0.5)] focus-within:ring-2 focus-within:ring-[hsl(var(--primary)/0.2)]">
                  <span className="flex h-full items-center justify-center border-r border-white/5 bg-white/[0.03] px-3.5">
                    <Lock className="h-5 w-5 text-zinc-500" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) =>
                      setCapsOn((e.getModifierState && e.getModifierState('CapsLock')) || false)
                    }
                    className="h-full flex-1 border-0 bg-transparent px-3.5 pr-12 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-0"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-[hsl(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {capsOn ? (
                  <p className="inline-flex w-fit rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs text-amber-200">
                    Bloq Mayús activado
                  </p>
                ) : null}
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_8px_24px_-4px_rgba(241,125,30,0.45)] transition-[transform,box-shadow] hover:bg-[hsl(var(--primary)/0.92)] hover:shadow-[0_12px_28px_-4px_rgba(241,125,30,0.5)] active:scale-[0.99]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión…
                  </>
                ) : (
                  <>
                    Ingresar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {webauthnAvailable ? (
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleWebAuthnLogin}
                  className="h-12 w-full rounded-xl border-white/15 bg-white/[0.04] text-zinc-200 hover:bg-white/[0.08] hover:text-white"
                  disabled={webauthnLoading}
                >
                  {webauthnLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Autenticando…
                    </>
                  ) : (
                    <>
                      <Fingerprint className="mr-2 h-4 w-4" />
                      Acceso con biometría
                    </>
                  )}
                </Button>
              </div>
            ) : null}

            <p className="mt-8 text-center text-xs leading-relaxed text-zinc-500 sm:text-sm">
              ¿Olvidaste tu contraseña?{' '}
              <Link
                to="/forgot-password"
                className="font-medium text-[hsl(var(--primary))] underline-offset-4 hover:underline"
              >
                Restablecer contraseña
              </Link>
            </p>
          </Card>
        </main>
      </div>
    </div>
  );
}
