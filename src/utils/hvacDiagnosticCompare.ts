import type { HvacMeasuredFieldKey, HvacPlateFieldKey } from '@/utils/hvacDiagnosticFields';
import {
  HVAC_MEASURED_FIELD_KEYS,
  HVAC_PLATE_FIELD_KEYS,
  isEquipmentPlateFieldReadOnly,
} from '@/utils/hvacDiagnosticFields';

export const HVAC_TOLERANCE_PERCENT = 10;

/** Extrae un número técnico tolerante a comas y unidades (ej. "12,5 A" → 12.5). */
export function parseTechnicalNumber(value: string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!s) return null;
  const normalized = s.replace(/\s/g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  if (normalized === '' || normalized === '-' || normalized === '.') return null;
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}

export type HvacCompareStatus = 'neutral' | 'ok' | 'out';

/**
 * Diferencia % = |Medido - Placa| / |Placa| × 100.
 * Si placa ≤ 0 o no numérica → neutral (sin comparativa).
 */
export function comparePlateMeasured(
  plate: string | null | undefined,
  measured: string | null | undefined
): HvacCompareStatus {
  const p = parseTechnicalNumber(plate);
  const m = parseTechnicalNumber(measured);
  if (p === null || m === null || p === 0) return 'neutral';
  const diffPct = Math.abs((m - p) / p) * 100;
  if (diffPct <= HVAC_TOLERANCE_PERCENT) return 'ok';
  return 'out';
}

/** true si medido > placa y fuera de tolerancia (sobreamperaje / sobrevoltaje). */
export function isOverNominalOutOfTolerance(
  plate: string | null | undefined,
  measured: string | null | undefined
): boolean {
  const p = parseTechnicalNumber(plate);
  const m = parseTechnicalNumber(measured);
  if (p === null || m === null || p === 0) return false;
  const diffPct = Math.abs((m - p) / p) * 100;
  if (diffPct <= HVAC_TOLERANCE_PERCENT) return false;
  return m > p;
}

export function buildPlatePayload(values: Record<string, unknown>): Partial<Record<HvacPlateFieldKey, string>> {
  const out: Partial<Record<HvacPlateFieldKey, string>> = {};
  for (const key of HVAC_PLATE_FIELD_KEYS) {
    const v = values[key];
    if (typeof v === 'string' && v.trim() !== '') {
      out[key] = v.trim();
    }
  }
  return out;
}

/** Técnicos solo envían campos de placa que aún no están en el equipo. */
export function filterPlatePayloadForRole(
  payload: Partial<Record<HvacPlateFieldKey, string>>,
  equipment: Record<string, unknown> | null | undefined,
  isAdmin: boolean
): Partial<Record<HvacPlateFieldKey, string>> {
  if (isAdmin) return payload;
  const out: Partial<Record<HvacPlateFieldKey, string>> = {};
  for (const key of HVAC_PLATE_FIELD_KEYS) {
    const value = payload[key];
    if (value === undefined) continue;
    if (!isEquipmentPlateFieldReadOnly(equipment, key, false)) {
      out[key] = value;
    }
  }
  return out;
}

export function buildDiagnosticPayload(
  values: Record<string, unknown>
): Partial<Record<HvacMeasuredFieldKey, string | boolean>> {
  const out: Partial<Record<HvacMeasuredFieldKey, string | boolean>> = {};
  for (const key of HVAC_MEASURED_FIELD_KEYS) {
    const v = values[key];
    if (key === 'measured_voltage_protector_ok') {
      if (v === 'true' || v === true) out[key] = true;
      else if (v === 'false' || v === false) out[key] = false;
      continue;
    }
    if (typeof v === 'string' && v.trim() !== '') {
      out[key] = v.trim();
    }
  }
  return out;
}
