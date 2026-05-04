import { z } from 'zod';

export const productSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ-]+$/, 'Solo se permiten letras, números y espacios'),
  price: z
    .string()
    .min(1, 'El precio es requerido')
    .regex(/^\$\d+(\.\d{1,2})?$/, 'Formato inválido. Ej: $99.99'),
  stock: z
    .number({
      required_error: 'El stock es requerido',
      invalid_type_error: 'El stock debe ser un número',
    })
    .min(0, 'El stock no puede ser negativo')
    .max(99999, 'El stock no puede exceder 99999'),
  category: z
    .string()
    .min(2, 'La categoría debe tener al menos 2 caracteres')
    .max(50, 'La categoría no puede exceder 50 caracteres'),
  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
  supplier: z
    .string()
    .min(2, 'El proveedor debe tener al menos 2 caracteres')
    .max(100, 'El proveedor no puede exceder 100 caracteres'),
  sku: z
    .string()
    .min(3, 'El SKU debe tener al menos 3 caracteres')
    .max(20, 'El SKU no puede exceder 20 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'Solo mayúsculas, números y guiones'),
  isActive: z
    .boolean()
    .default(true),
  weight: z
    .number({
      required_error: 'El peso es requerido',
      invalid_type_error: 'El peso debe ser un número',
    })
    .min(0.1, 'El peso debe ser al menos 0.1 kg')
    .max(1000, 'El peso no puede exceder 1000 kg'),
});

export type ProductFormData = z.infer<typeof productSchema>;
