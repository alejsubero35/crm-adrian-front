import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus, PencilSimple, Trash } from '@phosphor-icons/react';
import { DataTable, DataTableColumn } from '@/components/DataTable';
import { EditModal } from '@/components/ui/EditModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { productSchema, ProductFormData } from '@/validations/product.schema';
import { ValidatedInput } from '@/components/ui/ValidatedInput';
import { ValidatedSelect } from '@/components/ui/ValidatedSelect';
import { ValidatedTextarea } from '@/components/ui/ValidatedTextarea';
import { ValidatedCheckbox } from '@/components/ui/ValidatedCheckbox';

type Product = {
  id: number;
  name: string;
  price: string;
  stock: number;
  category: string;
  description?: string;
  supplier: string;
  sku: string;
  isActive: boolean;
  weight: number;
};

export default function ProductCRUD() {
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: 'Laptop Pro',          price: '$999', stock: 15, category: 'Electrónica', description: 'Laptop de alta gama', supplier: 'TechCorp', sku: 'LAP-001', isActive: true, weight: 2.5 },
    { id: 2, name: 'Mouse Wireless',      price: '$29',  stock: 50, category: 'Accesorios',  description: 'Mouse inalámbrico ergonómico', supplier: 'Peripherals Inc', sku: 'MOU-002', isActive: true, weight: 0.1 },
    { id: 3, name: 'Keyboard Mechanical', price: '$79',  stock: 25, category: 'Accesorios',  description: 'Teclado mecánico RGB', supplier: 'KeyMaster', sku: 'KEY-003', isActive: true, weight: 0.8 },
    { id: 4, name: 'Monitor 4K',          price: '$499', stock: 8,  category: 'Electrónica', description: 'Monitor 4K UHD', supplier: 'DisplayPro', sku: 'MON-004', isActive: true, weight: 5.2 },
    { id: 5, name: 'USB-C Hub',           price: '$39',  stock: 30, category: 'Accesorios',  description: 'Hub USB-C 7 en 1', supplier: 'ConnectAll', sku: 'HUB-005', isActive: true, weight: 0.15 },
  ]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const createForm = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: '',
      stock: 0,
      category: '',
      description: '',
      supplier: '',
      sku: '',
      isActive: true,
      weight: 0.1,
    },
    mode: 'onSubmit',
  });

  const editForm = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: '',
      stock: 0,
      category: '',
      description: '',
      supplier: '',
      sku: '',
      isActive: true,
      weight: 0.1,
    },
    mode: 'onSubmit',
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    editForm.reset({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category,
      description: product.description || '',
      supplier: product.supplier,
      sku: product.sku,
      isActive: product.isActive,
      weight: product.weight,
    });
    setIsEditModalOpen(true);
  };

  const handleCreate = () => {
    createForm.reset();
    setIsCreateModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleSaveEdit = async (data: ProductFormData) => {
    if (editingProduct) {
      setProducts(products.map(p => 
        p.id === editingProduct.id ? { ...p, ...data } as Product : p
      ));
      setIsEditModalOpen(false);
      setEditingProduct(null);
      editForm.reset();
      
      toast({
        variant: 'success',
        title: 'Producto actualizado',
        description: `"${data.name}" ha sido actualizado exitosamente.`,
      });
    }
  };

  const handleSaveCreate = async (data: ProductFormData) => {
    // Simulación de creación con posibilidad de éxito/fallo (80% éxito)
    const isSuccess = Math.random() > 0.2;
    
    if (isSuccess) {
      const newProduct: Product = {
        id: Math.max(...products.map(p => p.id)) + 1,
        name: data.name,
        price: data.price,
        stock: data.stock,
        category: data.category,
        description: data.description,
        supplier: data.supplier,
        sku: data.sku,
        isActive: data.isActive,
        weight: data.weight,
      };
      setProducts([...products, newProduct]);
      setIsCreateModalOpen(false);
      createForm.reset();
      
      toast({
        variant: 'success',
        title: 'Producto creado exitosamente',
        description: `"${data.name}" ha sido agregado al catálogo.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error al crear producto',
        description: 'Hubo un problema al intentar crear el producto. Por favor, intenta nuevamente.',
      });
    }
  };

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
      cell: ({ item }) => (
        <div className="flex items-center gap-1.5">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => handleEdit(item)}
          >
            <PencilSimple className="h-3.5 w-3.5" weight="duotone" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:border-red-300"
            onClick={() => handleDeleteClick(item)}
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
        <Button onClick={handleCreate}>
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
            <div className="text-2xl font-bold">{products.length}</div>
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
              {products.reduce((sum, p) => sum + p.stock, 0)}
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
              {[...new Set(products.map((p) => p.category))].length}
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
              {products.filter((p) => p.stock < 20).length}
            </div>
            <p className="text-xs text-muted-foreground">Necesitan reabastecer</p>
          </CardContent>
        </Card>
      </div>

      {/* Products table with responsive collapse */}
      <DataTable<Product>
        items={products}
        columns={columns}
        rowKey={({ item }) => String(item.id)}
        wrapInCard
      />

      {/* Edit Modal */}
      <EditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Editar Producto"
        description="Modifica la información del producto seleccionado"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={editForm.handleSubmit(handleSaveEdit)}
              disabled={editForm.formState.isSubmitting}
            >
              Guardar Cambios
            </Button>
          </>
        }
      >
        <form onSubmit={editForm.handleSubmit(handleSaveEdit)} className="space-y-4">
          <ValidatedInput
            label="Nombre del Producto"
            name="name"
            control={editForm.control}
            placeholder="Ej: Laptop Pro"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <ValidatedInput
              label="Precio"
              name="price"
              control={editForm.control}
              placeholder="Ej: $999"
              required
            />
            <ValidatedInput
              label="Stock"
              name="stock"
              control={editForm.control}
              type="number"
              step="1"
              placeholder="Ej: 15"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ValidatedSelect
              label="Categoría"
              name="category"
              control={editForm.control}
              required
              placeholder="Selecciona una categoría"
              options={[
                { value: 'Electrónica', label: 'Electrónica' },
                { value: 'Accesorios', label: 'Accesorios' },
                { value: 'Computación', label: 'Computación' },
                { value: 'Audio', label: 'Audio' },
                { value: 'Gaming', label: 'Gaming' },
                { value: 'Hogar', label: 'Hogar' },
                { value: 'Oficina', label: 'Oficina' },
              ]}
            />
            <ValidatedInput
              label="Peso (kg)"
              name="weight"
              control={editForm.control}
              type="number"
              step="0.1"
              placeholder="Ej: 2.5"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ValidatedInput
              label="Proveedor"
              name="supplier"
              control={editForm.control}
              placeholder="Ej: TechCorp"
              required
            />
            <ValidatedInput
              label="SKU"
              name="sku"
              control={editForm.control}
              placeholder="Ej: LAP-001"
              required
            />
          </div>

          <ValidatedTextarea
            label="Descripción"
            name="description"
            control={editForm.control}
            placeholder="Describe el producto..."
            rows={3}
          />

          <ValidatedCheckbox
            label="Producto activo"
            name="isActive"
            control={editForm.control}
          />
        </form>
      </EditModal>

      {/* Create Modal */}
      <EditModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        title="Nuevo Producto"
        description="Ingresa la información del nuevo producto"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={createForm.handleSubmit(handleSaveCreate)}
              disabled={createForm.formState.isSubmitting}
            >
              Crear Producto
            </Button>
          </>
        }
      >
        <form onSubmit={createForm.handleSubmit(handleSaveCreate)} className="space-y-4">
          <ValidatedInput
            label="Nombre del Producto"
            name="name"
            control={createForm.control}
            placeholder="Ej: Laptop Pro"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <ValidatedInput
              label="Precio"
              name="price"
              control={createForm.control}
              placeholder="Ej: $999"
              required
            />
            <ValidatedInput
              label="Stock"
              name="stock"
              control={createForm.control}
              type="number"
              step="1"
              placeholder="Ej: 15"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ValidatedSelect
              label="Categoría"
              name="category"
              control={createForm.control}
              required
              placeholder="Selecciona una categoría"
              options={[
                { value: 'Electrónica', label: 'Electrónica' },
                { value: 'Accesorios', label: 'Accesorios' },
                { value: 'Computación', label: 'Computación' },
                { value: 'Audio', label: 'Audio' },
                { value: 'Gaming', label: 'Gaming' },
                { value: 'Hogar', label: 'Hogar' },
                { value: 'Oficina', label: 'Oficina' },
              ]}
            />
            <ValidatedInput
              label="Peso (kg)"
              name="weight"
              control={createForm.control}
              type="number"
              step="0.1"
              placeholder="Ej: 2.5"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ValidatedInput
              label="Proveedor"
              name="supplier"
              control={createForm.control}
              placeholder="Ej: TechCorp"
              required
            />
            <ValidatedInput
              label="SKU"
              name="sku"
              control={createForm.control}
              placeholder="Ej: LAP-001"
              required
            />
          </div>

          <ValidatedTextarea
            label="Descripción"
            name="description"
            control={createForm.control}
            placeholder="Describe el producto..."
            rows={3}
          />

          <ValidatedCheckbox
            label="Producto activo"
            name="isActive"
            control={createForm.control}
          />
        </form>
      </EditModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Confirmar Eliminación"
        description={`¿Estás seguro de que deseas eliminar el producto "${productToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setProductToDelete(null);
        }}
      />
    </div>
  );
}
