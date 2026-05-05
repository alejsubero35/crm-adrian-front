import { z } from 'zod';

export const clientesSchema = z.object({
name: z
    .string()
    .min(2, 'name debe tener al menos 2 caracteres')
    .max(100, 'name no puede exceder 100 caracteres'),
  identity_Card: z
    .number({
      required_error: 'identity_Card es requerido',
      invalid_type_error: 'identity_Card debe ser un número',
    })
    .min(0, 'identity_Card no puede ser negativo'),
  phone: z
    .number({
      required_error: 'phone es requerido',
      invalid_type_error: 'phone debe ser un número',
    })
    .min(0, 'phone no puede ser negativo').optional(),
  address: z
    .string()
    .min(10, 'address debe tener al menos 10 caracteres')
    .max(500, 'address no puede exceder 500 caracteres').optional(),
});

export type clientesFormData = z.infer<typeof clientesSchema>;
