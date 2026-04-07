import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, TrendingUp, TrendingDown, Warehouse, Truck } from 'lucide-react';

export default function InventoryReport() {
  const inventoryData = [
    { category: 'Electrónica', total: 156, lowStock: 12, outOfStock: 3, value: '$125,000' },
    { category: 'Accesorios', total: 234, lowStock: 28, outOfStock: 5, value: '$45,000' },
    { category: 'Ropa', total: 412, lowStock: 45, outOfStock: 8, value: '$78,000' },
    { category: 'Hogar', total: 189, lowStock: 15, outOfStock: 2, value: '$92,000' },
    { category: 'Deportes', total: 98, lowStock: 8, outOfStock: 1, value: '$34,000' },
  ];

  const criticalItems = [
    { name: 'Laptop Pro X1', category: 'Electrónica', stock: 2, minStock: 10 },
    { name: 'Mouse Gaming RGB', category: 'Accesorios', stock: 0, minStock: 15 },
    { name: 'Camiseta Premium', category: 'Ropa', stock: 3, minStock: 20 },
    { name: 'Silla Ergonómica', category: 'Hogar', stock: 1, minStock: 5 },
    { name: 'Bicicleta Montaña', category: 'Deportes', stock: 0, minStock: 3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reporte de Inventario</h1>
          <p className="text-muted-foreground">
            Estado completo del inventario y productos críticos
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
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryData.reduce((sum, cat) => sum + cat.total, 0)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +5.2% respecto al mes anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {inventoryData.reduce((sum, cat) => sum + cat.lowStock, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Productos necesitan reabastecer
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {inventoryData.reduce((sum, cat) => sum + cat.outOfStock, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Agotados, necesitan reposición urgente
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${inventoryData.reduce((sum, cat) => sum + Number(cat.value.replace('$', '').replace(',', '')), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +8.7% respecto al mes anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inventario por Categoría</CardTitle>
            <CardDescription>
              Desglose del inventario por tipo de producto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventoryData.map((category) => (
                <div key={category.category} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{category.category}</p>
                    <p className="text-sm text-muted-foreground">
                      {category.total} productos, {category.lowStock} bajo stock, {category.outOfStock} sin stock
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{category.value}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${
                          category.outOfStock > 0 ? 'bg-red-500' : 
                          category.lowStock > 10 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, (category.total / 500) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Productos Críticos
            </CardTitle>
            <CardDescription>
              Productos que necesitan atención inmediata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalItems.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <p className="font-medium text-red-900">{item.name}</p>
                    <p className="text-sm text-red-700">
                      {item.category} - Stock mínimo: {item.minStock}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      {item.stock === 0 ? 'AGOTADO' : `Stock: ${item.stock}`}
                    </p>
                    <Button size="sm" className="mt-1">
                      <Truck className="h-3 w-3 mr-1" />
                      Reabastecer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análisis de Rotación</CardTitle>
          <CardDescription>
            Métricas de rotación de inventario por categoría
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Package className="h-16 w-16 mx-auto mb-4" />
              <p className="text-lg font-medium">Gráfico de rotación</p>
              <p className="text-sm">Integración con Chart.js próximamente</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
