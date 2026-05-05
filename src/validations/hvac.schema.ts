import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  tax_id: z.string().optional(),
  email: z.string().email('Email invalido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const planSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  description: z.string().optional(),
  maintenance_frequency_days: z.coerce
    .number({ invalid_type_error: 'Debe ser numerico' })
    .int('Debe ser un numero entero')
    .min(1, 'Debe ser mayor a 0'),
});

export const registerEquipmentSchema = z.object({
  customer_id: z.string().min(1, 'Selecciona un cliente'),
  plan_id: z.string().min(1, 'Selecciona un plan'),
  brand: z.string().min(1, 'Marca requerida'),
  model: z.string().min(1, 'Modelo requerido'),
  serial_number: z.string().min(1, 'Serial requerido'),
  type: z.string().min(1, 'Tipo requerido'),
  capacity: z.string().min(1, 'Capacidad requerida'),
  refrigerant_type: z.string().min(1, 'Tipo de gas requerido'),
  gps_coordinates: z.string().optional(),
});

export const maintenanceLogSchema = z.object({
  service_type: z.string().min(1, 'Tipo de servicio requerido'),
  description: z.string().optional(),
});

export const qrBatchSchema = z.object({
  quantity: z.coerce
    .number({ invalid_type_error: 'Debe ser numerico' })
    .int('Debe ser entero')
    .min(1, 'Minimo 1')
    .max(500, 'Maximo 500'),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
export type PlanFormData = z.infer<typeof planSchema>;
export type RegisterEquipmentFormData = z.infer<typeof registerEquipmentSchema>;
export type MaintenanceLogFormData = z.infer<typeof maintenanceLogSchema>;
export type QrBatchFormData = z.infer<typeof qrBatchSchema>;
