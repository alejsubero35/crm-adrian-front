import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus, PencilSimple, Trash } from '@phosphor-icons/react';
import { DataTable, DataTableColumn } from '@/components/DataTable';

type Product = {
  id: number;
  name: string;
  price: string;
  stock: number;
  category: string;
};

export default function ProductCRUD() {
  const mockProducts: Product[] = [
    { id: 1, name: 'Laptop Pro',          price: '$999', stock: 15, category: 'Electrónica' },
    { id: 2, name: 'Mouse Wireless',      price: '$29',  stock: 50, category: 'Accesorios'  },
    { id: 3, name: 'Keyboard Mechanical', price: '$79',  stock: 25, category: 'Accesorios'  },
    { id: 4, name: 'Monitor 4K',          price: '$499', stock: 8,  category: 'Electrónica' },
    { id: 5, name: 'USB-C Hub',           price: '$39',  stock: 30, category: 'Accesorios'  },
  ];

  const columns: DataTableColumn<Product>[] = [
    {
      id: 'index',
      header: '#',
      headerClassName: 'w-10',
      cellClassName: 'w-10',
      cell: ({ index }) => (
        <span className="text-slate-400 text-xs font-medium">{index + 1}</span>
      ),
    },
    {
      id: 'name',
      header: 'Producto',
      cell: ({ item }) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Package className="h-4 w-4 text-primary" weight="duotone" />
          </div>
          <span className="font-medium text-slate-800">{item.name}</span>
        </div>
      ),
    },
    {
      id: 'category',
      header: 'Categoría',
      hideBelow: 'sm',
      mobileLabel: 'Categoría',
      cell: ({ item }) => (
        <span className="text-slate-600">{item.category}</span>
      ),
    },
    {
      id: 'price',
      header: 'Precio',
      hideBelow: 'md',
      mobileLabel: 'Precio',
      cell: ({ item }) => (
        <span className="font-semibold text-slate-800">{item.price}</span>
      ),
    },
    {
      id: 'stock',
      header: 'Stock',
      hideBelow: 'lg',
      mobileLabel: 'Stock',
      cell: ({ item }) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.stock < 20
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {item.stock} uds.
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      hideBelow: 'xl',
      mobileLabel: 'Acciones',
      headerClassName: 'w-24',
      cellClassName: 'w-24',
      cell: () => (
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <PencilSimple className="h-3.5 w-3.5" weight="duotone" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:border-red-300"
          >
            <Trash className="h-3.5 w-3.5" weight="duotone" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">Gestiona el catálogo de productos</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" weight="bold" />
          Nuevo Producto
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" weight="duotone" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProducts.length}</div>
            <p className="text-xs text-muted-foreground">+2 respecto al mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" weight="duotone" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockProducts.reduce((sum, p) => sum + p.stock, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Unidades disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" weight="duotone" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...new Set(mockProducts.map((p) => p.category))].length}
            </div>
            <p className="text-xs text-muted-foreground">Tipos de productos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bajo Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" weight="duotone" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockProducts.filter((p) => p.stock < 20).length}
            </div>
            <p className="text-xs text-muted-foreground">Necesitan reabastecer</p>
          </CardContent>
        </Card>
      </div>

      {/* Products table with responsive collapse */}
      <DataTable<Product>
        items={mockProducts}
        columns={columns}
        rowKey={({ item }) => String(item.id)}
        wrapInCard
      />
    </div>
  );
}
