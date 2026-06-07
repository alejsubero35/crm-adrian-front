import { z } from 'zod';
import { exceedsFctAvailable, formatMoneyUsd, parseMoneyAmount, roundMoney } from '@/lib/moneyAmount';
import { HVAC_MEASURED_FIELD_KEYS, HVAC_PLATE_FIELD_KEYS } from '@/utils/hvacDiagnosticFields';

export const customerSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  tax_id: z.string().optional(),
  email: z.string().email('Email invalido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  como_nos_conocio: z.string().optional(),
  gps_coordinates: z.string().optional(),
});

export const planSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  description: z.string().optional(),
  maintenance_frequency_days: z.coerce
    .number({ invalid_type_error: 'Debe ser numerico' })
    .int('Debe ser un numero entero')
    .min(1, 'Debe ser mayor a 0'),
  monthly_amount: z.coerce
    .number({ invalid_type_error: 'Debe ser numerico' })
    .min(0, 'No puede ser negativo')
    .optional(),
  fondo_de_cobertura: z.coerce
    .number({ invalid_type_error: 'Debe ser numerico' })
    .min(0, 'No puede ser negativo')
    .optional(),
});

export const registerEquipmentSchema = z.object({
  customer_id: z.string().min(1, 'Selecciona un cliente'),
  plan_id: z.string().min(1, 'Selecciona un plan'),
  brand: z.string().min(1, 'Marca requerida'),
  model: z.string().min(1, 'Modelo requerido'),
  serial_number: z
    .string()
    .trim()
    .min(1, 'Serial requerido')
    .max(120, 'El serial admite hasta 120 caracteres'),
  type: z.string().min(1, 'Tipo requerido'),
  capacity: z.string().min(1, 'Capacidad requerida'),
  refrigerant_type: z.string().min(1, 'Tipo de gas requerido'),
  installation_location: z.string().min(1, 'Indica dónde está instalado el equipo'),
});

export const maintenanceLogSchema = z.object({
  maintenance_type_id: z.string().min(1, 'Selecciona el tipo de mantenimiento'),
  service_type: z.string().min(1, 'Tipo de servicio requerido'),
  description: z.string().optional(),
  spare_parts_cost: z.preprocess(
    (value) => {
      if (value === undefined || value === null || value === '') return undefined;
      const raw = typeof value === 'number' ? value : String(value).trim().replace(',', '.');
      const num = Number(raw);
      if (!Number.isFinite(num)) return value;
      return roundMoney(num);
    },
    z
      .number({ invalid_type_error: 'Debe ser numerico' })
      .min(0, 'No puede ser negativo')
      .optional()
  ),
});

const hvacOptionalString = z.union([z.string(), z.literal('')]).optional();
const hvacOptionalBooleanChoice = z
  .union([z.literal(''), z.literal('true'), z.literal('false')])
  .optional();

const plateFieldsShape = Object.fromEntries(
  HVAC_PLATE_FIELD_KEYS.map((k) => [k, hvacOptionalString])
) as Record<(typeof HVAC_PLATE_FIELD_KEYS)[number], z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodLiteral<''>]>>>;

const measuredFieldsShape = Object.fromEntries(
  HVAC_MEASURED_FIELD_KEYS.map((k) => [
    k,
    k === 'measured_voltage_protector_ok' ? hvacOptionalBooleanChoice : hvacOptionalString,
  ])
) as Record<(typeof HVAC_MEASURED_FIELD_KEYS)[number], z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodLiteral<''>]>>>;

/** Formulario completo: servicio + placa + mediciones (misma forma plana que el payload armado al enviar). */
export const hvacMaintenanceRegisterSchema = maintenanceLogSchema.merge(z.object(plateFieldsShape)).merge(z.object(measuredFieldsShape));

/** Incluye tope FCT según saldo disponible del equipo escaneado. */
export function buildHvacMaintenanceRegisterSchema(fctAvailable?: number | null) {
  return hvacMaintenanceRegisterSchema.superRefine((data, ctx) => {
    const amount = parseMoneyAmount(data.spare_parts_cost);
    if (amount == null || fctAvailable == null) {
      return;
    }

    if (fctAvailable <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'No hay saldo FCT disponible para descontar.',
        path: ['spare_parts_cost'],
      });
      return;
    }

    if (exceedsFctAvailable(amount, fctAvailable)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `El monto (${formatMoneyUsd(amount)} USD) supera el FCT disponible (${formatMoneyUsd(fctAvailable)} USD).`,
        path: ['spare_parts_cost'],
      });
    }
  });
}

export type HvacMaintenanceRegisterFormData = z.infer<typeof hvacMaintenanceRegisterSchema>;

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
