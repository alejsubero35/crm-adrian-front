// Helpers para cantidades a granel (peso/volumen) sin exponer términos técnicos.
// Se mantiene compatibilidad con backend: minQty y step.

export type BulkUnit = 'kg' | 'l';

export interface BulkRules {
  minQty: number; // min_qty backend
  step: number;   // step backend
  unit: BulkUnit;
  max?: number;   // inventario si aplica
}

export interface NormalizedQty {
  value: number;
  error?: string;
}

export function formatQty(value: number, unit: BulkUnit) {
  if (!Number.isFinite(value)) return '';
  if (unit === 'kg') return value >= 1 ? `${trimZeros(value)} kg` : `${Math.round(value * 1000)} g`;
  return value >= 1 ? `${trimZeros(value)} L` : `${Math.round(value * 1000)} ml`;
}

export function normalizeQty(raw: number, rules: BulkRules): NormalizedQty {
  const { minQty, step, unit, max = Infinity } = rules;
  if (!Number.isFinite(raw)) return { value: 0, error: 'Ingresa una cantidad válida.' };
  const bounded = clamp(raw, minQty, max);
  const rounded = roundToStep(bounded, step);
  if (rounded < minQty - 1e-6) {
    return { value: rounded, error: `La cantidad mínima es ${formatQty(minQty, unit)}` };
  }
  if (!isMultipleOf(rounded, step)) {
    return { value: rounded, error: `Debe venderse en múltiplos de ${formatQty(step, unit)}` };
  }
  return { value: rounded };
}

export function isMultipleOf(value: number, step: number) {
  if (!(step > 0)) return true;
  const factor = Math.pow(10, 6);
  const mod = Math.abs(Math.round(value * factor) % Math.round(step * factor));
  return mod === 0 || mod === Math.round(step * factor);
}

export function roundToStep(value: number, step: number) {
  if (!(step > 0)) return value;
  const factor = Math.pow(10, decimals(step) + 3);
  const next = Math.round((value / step) * factor) / factor;
  return Math.round(next * step * factor) / factor;
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function decimals(n: number) {
  const s = n.toString();
  const idx = s.indexOf('.');
  return idx >= 0 ? s.length - idx - 1 : 0;
}

export function trimZeros(n: number) {
  const s = n.toFixed(3);
  return s.replace(/\.0+$/, '').replace(/(\.[0-9]*[1-9])0+$/, '$1');
}
