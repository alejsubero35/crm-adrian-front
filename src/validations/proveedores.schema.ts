import { z } from 'zod';

export const proveedoresSchema = z.object({
name: z
    .string()
    .min(2, 'name debe tener al menos 2 caracteres')
    .max(100, 'name no puede exceder 100 caracteres'),
  identity_card: z
    .number({
      required_error: 'identity_card es requerido',
      invalid_type_error: 'identity_card debe ser un número',
    })
    .min(0, 'identity_card no puede ser negativo'),
  address: z
    .string()
    .min(10, 'address debe tener al menos 10 caracteres')
    .max(500, 'address no puede exceder 500 caracteres').optional(),
});

export type proveedoresFormData = z.infer<typeof proveedoresSchema>;
