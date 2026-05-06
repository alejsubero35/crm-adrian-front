import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  UserCircle,
  EnvelopeSimple,
  IdentificationCard,
  Phone,
  LockKey,
  Eye,
  EyeSlash,
  CheckCircle,
  XCircle,
} from '@phosphor-icons/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDemoAuth } from '@/features/auth/DemoAuthContext';
import type { User } from '@/contexts/authContextObj';
import { authService } from '@/services/auth.service';

function displayName(u: User | null): string {
  if (!u) return '';
  const parts = [u.first_name, u.last_name].filter(Boolean);
  if (parts.length) return parts.join(' ');
  if (u.name) return u.name;
  return u.username || u.email?.split('@')[0] || '';
}

function displayInitial(u: User | null): string {
  const n = displayName(u);
  if (n) return n.charAt(0).toUpperCase();
  return (u?.email?.charAt(0) || 'U').toUpperCase();
}

function normalizeRoles(roles: User['roles']): string[] {
  if (!roles) return [];
  if (typeof roles === 'string') return [roles];
  if (Array.isArray(roles)) {
    return roles.map((r) => {
      if (typeof r === 'string') return r;
      if (r && typeof r === 'object') {
        const o = r as { slug?: string; name?: string };
        return o.slug || o.name || '';
      }
      return '';
    }).filter(Boolean);
  }
  return [];
}

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Indica tu contraseña actual'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    password_confirmation: z.string().min(1, 'Confirma la nueva contraseña'),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirmation'],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

function ReadonlyRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" weight="duotone" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold text-foreground">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user: ctxUser } = useDemoAuth();
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const { data: freshUser, isLoading: profileLoading } = useQuery({
    queryKey: ['me', 'profile-page'],
    queryFn: () => authService.getCurrentUser(),
    staleTime: 60_000,
  });

  const user = (freshUser ?? ctxUser) as User | null;
  const name = displayName(user);
  const roles = normalizeRoles(user?.roles);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
  });
  const watchedPassword = useWatch({ control, name: 'password' }) ?? '';
  const watchedConfirmation = useWatch({ control, name: 'password_confirmation' }) ?? '';
  const hasTypedBoth = watchedPassword.length > 0 && watchedConfirmation.length > 0;
  const passwordsMatch = hasTypedBoth && watchedPassword === watchedConfirmation;

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      const res = await authService.updatePassword(data);
      toast.success(res.message || 'Contraseña actualizada');
      reset();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo actualizar la contraseña';
      toast.error(msg);
    }
  };

  return (
    <div className="relative mx-auto max-w-5xl space-y-5 px-4 py-5 md:space-y-8 md:px-8 md:py-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.12),transparent_70%)] md:h-72" />
      <header className="rounded-2xl border border-border/50 bg-card/70 p-4 shadow-soft backdrop-blur-sm md:space-y-1 md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-0">
        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-3xl">Mi perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground md:mt-0 md:text-base">
          Consulta tus datos y actualiza tu contraseña de forma segura.
        </p>
      </header>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-2 lg:items-start">
        <Card className="glass-card overflow-hidden rounded-2xl border-border/60 shadow-soft-lg">
          <CardHeader className="space-y-1 border-b border-border/50 bg-muted/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-lg font-bold text-primary-foreground shadow-glow">
                {displayInitial(user)}
              </div>
              <div className="min-w-0">
                <CardTitle className="text-lg font-semibold truncate">{name || 'Usuario'}</CardTitle>
                <CardDescription className="truncate">
                  {profileLoading ? 'Cargando…' : user?.email}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-5 md:pt-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Datos de tu cuenta (solo lectura)
            </p>
            <div className="space-y-2.5 md:space-y-3">
              <ReadonlyRow icon={EnvelopeSimple} label="Correo" value={user?.email ?? ''} />
              <ReadonlyRow icon={IdentificationCard} label="Usuario" value={user?.username ?? ''} />
              <ReadonlyRow icon={UserCircle} label="Nombre" value={name} />
              <ReadonlyRow icon={Phone} label="Teléfono" value={user?.phone ?? ''} />
            </div>
            {roles.length > 0 && (
              <>
                <Separator className="my-2" />
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Roles</p>
                  <div className="flex flex-wrap gap-2">
                    {roles.map((r) => (
                      <Badge key={r} variant="secondary" className="rounded-full bg-primary/10 px-3 py-1 text-primary font-semibold">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card rounded-2xl border-border/60 shadow-soft-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <LockKey className="h-5 w-5 text-primary" weight="duotone" />
              <CardTitle className="text-lg">Seguridad</CardTitle>
            </div>
            <CardDescription>
              Usa una contraseña fuerte que no reutilices en otros sitios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Contraseña actual</Label>
                <div className="relative">
                  <Input
                    id="current_password"
                    type={showCurrent ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="pr-10"
                    {...register('current_password')}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => setShowCurrent((v) => !v)}
                    aria-label={showCurrent ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showCurrent ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.current_password && (
                  <p className="text-xs text-destructive">{errors.current_password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showNew ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="pr-10"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => setShowNew((v) => !v)}
                    aria-label={showNew ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showNew ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Confirmar nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="password_confirmation"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`pr-10 ${
                      hasTypedBoth
                        ? (passwordsMatch ? 'border-emerald-500/70 focus-visible:ring-emerald-500/30' : 'border-destructive/70 focus-visible:ring-destructive/30')
                        : ''
                    }`}
                    {...register('password_confirmation')}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showConfirm ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {hasTypedBoth && !errors.password_confirmation && (
                  <div className={`flex items-center gap-1.5 text-xs ${passwordsMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                    {passwordsMatch ? (
                      <CheckCircle className="h-3.5 w-3.5" weight="fill" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" weight="fill" />
                    )}
                    <span>{passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}</span>
                  </div>
                )}
                {errors.password_confirmation && (
                  <p className="text-xs text-destructive">{errors.password_confirmation.message}</p>
                )}
              </div>
              <Button type="submit" className="h-11 w-full rounded-xl text-sm font-semibold sm:w-auto" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando…' : 'Actualizar contraseña'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
