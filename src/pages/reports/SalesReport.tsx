import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users } from 'lucide-react';

export default function SalesReport() {
  const salesData = [
    { month: 'Enero', sales: 45000, orders: 120, customers: 89 },
    { month: 'Febrero', sales: 52000, orders: 145, customers: 102 },
    { month: 'Marzo', sales: 48000, orders: 135, customers: 95 },
    { month: 'Abril', sales: 61000, orders: 168, customers: 121 },
    { month: 'Mayo', sales: 58000, orders: 156, customers: 114 },
    { month: 'Junio', sales: 67000, orders: 189, customers: 138 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reporte de Ventas</h1>
          <p className="text-muted-foreground">
            Análisis detallado de las ventas del período
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Exportar Excel
          </Button>
          <Button variant="outline" size="sm">
            Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${salesData.reduce((sum, s) => sum + s.sales, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +12.5% respecto al período anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesData.reduce((sum, s) => sum + s.orders, 0)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +8.3% respecto al período anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesData.reduce((sum, s) => sum + s.customers, 0)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +15.2% respecto al período anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.round(salesData.reduce((sum, s) => sum + s.sales, 0) / salesData.reduce((sum, s) => sum + s.orders, 0))}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
              -2.1% respecto al período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Ventas</CardTitle>
            <CardDescription>
              Evolución mensual de las ventas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Gráfico de tendencia</p>
                <p className="text-sm">Integración con Chart.js próximamente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Desglose Mensual</CardTitle>
            <CardDescription>
              Detalles de ventas por mes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesData.map((data) => (
                <div key={data.month} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{data.month}</p>
                    <p className="text-sm text-muted-foreground">
                      {data.orders} pedidos, {data.customers} clientes
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${data.sales.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      ${Math.round(data.sales / data.orders)} promedio
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
