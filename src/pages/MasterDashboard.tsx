import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CustomButton } from '@/components/ui/custom-button';
import { useDemoAuth } from '@/features/auth/DemoAuthContext';
import { useUI } from '@/contexts/UIContext';
import {
  Users,
  Package,
  ShoppingCart,
  TrendUp,
  Pulse,
  CurrencyDollar,
  Eye,
  ArrowClockwise
} from '@phosphor-icons/react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

export default function MasterDashboard() {
  const { user, isDemoMode } = useDemoAuth();
  const { isMobile, isTablet } = useUI();

  // Mock data for dashboard
  const stats = [
    {
      title: 'Usuarios',
      value: '1,234',
      change: '+12%',
      icon: Users,
      color: 'text-[hsl(var(--chart-1))]',
      bgColor: 'bg-[hsl(var(--chart-1))]/10',
    },
    {
      title: 'Productos',
      value: '456',
      change: '+8%',
      icon: Package,
      color: 'text-[hsl(var(--chart-2))]',
      bgColor: 'bg-[hsl(var(--chart-2))]/10',
    },
    {
      title: 'Ventas',
      value: '89',
      change: '+23%',
      icon: ShoppingCart,
      color: 'text-[hsl(var(--chart-3))]',
      bgColor: 'bg-[hsl(var(--chart-3))]/10',
    },
    {
      title: 'Ingresos',
      value: '$12,345',
      change: '+15%',
      icon: CurrencyDollar,
      color: 'text-[hsl(var(--chart-4))]',
      bgColor: 'bg-[hsl(var(--chart-4))]/10',
    },
  ];

  const recentActivity = [
    { id: 1, user: 'John Doe', action: 'creó un nuevo usuario', time: 'Hace 5 minutos' },
    { id: 2, user: 'Jane Smith', action: 'actualizó el producto #123', time: 'Hace 15 minutos' },
    { id: 3, user: 'Bob Johnson', action: 'eliminó el pedido #456', time: 'Hace 30 minutos' },
    { id: 4, user: 'Alice Brown', action: 'completó la venta #789', time: 'Hace 1 hora' },
  ];

  const quickActions = [
    { title: 'Nuevo Usuario', icon: Users, href: '/users', color: 'bg-[hsl(var(--chart-1))]' },
    { title: 'Nuevo Producto', icon: Package, href: '/products', color: 'bg-[hsl(var(--chart-2))]' },
    { title: 'Ver Reportes', icon: TrendUp, href: '/reports', color: 'bg-[hsl(var(--chart-3))]' },
    { title: 'Configuración', icon: Pulse, href: '/settings', color: 'bg-[hsl(var(--chart-4))]' },
  ];

  // Chart data
  const monthlySalesData = [
    { month: 'Ene', ventas: 4500, pedidos: 45 },
    { month: 'Feb', ventas: 5200, pedidos: 52 },
    { month: 'Mar', ventas: 4800, pedidos: 48 },
    { month: 'Abr', ventas: 6100, pedidos: 61 },
    { month: 'May', ventas: 5900, pedidos: 59 },
    { month: 'Jun', ventas: 7200, pedidos: 72 },
  ];

  const categoryData = [
    { category: 'Electrónica', value: 35 },
    { category: 'Ropa', value: 28 },
    { category: 'Hogar', value: 20 },
    { category: 'Alimentos', value: 17 },
  ];

  const chartConfig = {
    ventas: {
      label: 'Ventas',
      color: 'hsl(var(--chart-1))',
    },
    pedidos: {
      label: 'Pedidos',
      color: 'hsl(var(--chart-2))',
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido de nuevo, {user?.name}! Aquí está el resumen de tu actividad.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CustomButton
            variant="outline"
            size="sm"
            leftIcon={<ArrowClockwise className="h-4 w-4" weight="bold" />}
          >
            Actualizar
          </CustomButton>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`rounded-full p-2 ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} weight="duotone" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> respecto al mes pasado
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Accesos directos a las funciones más comunes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <CustomButton
                    key={action.title}
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    leftIcon={<div className={`rounded-full p-2 ${action.color}`}>
                      <Icon className="h-4 w-4 text-white" weight="bold" />
                    </div>}
                  >
                    <span className="text-sm">{action.title}</span>
                  </CustomButton>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Las últimas acciones en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="rounded-full bg-muted p-2">
                    <Users className="h-4 w-4 text-muted-foreground" weight="duotone" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.user} {activity.action}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-2" weight="duotone" />
                Ver toda la actividad
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas Mensuales</CardTitle>
            <CardDescription>
              Resumen de ventas de los últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <AreaChart data={monthlySalesData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="ventas"
                  type="monotone"
                  fill="var(--color-ventas)"
                  stroke="var(--color-ventas)"
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Categoría</CardTitle>
            <CardDescription>
              Productos por categoría
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={categoryData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--chart-3))" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Sistema</CardTitle>
          <CardDescription>
            Detalles sobre tu sesión y el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Usuario</p>
              <p className="text-sm text-muted-foreground">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Roles</p>
              <div className="flex flex-wrap gap-1">
                {user?.roles?.map((role, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {typeof role === 'string' ? role : role.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Dispositivo</p>
              <p className="text-sm text-muted-foreground">
                {isMobile ? 'Móvil' : isTablet ? 'Tablet' : 'Escritorio'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
