import type { MaintenanceLog } from '@/types/hvac';

/** Normaliza el historial de mantenimiento devuelto por el API (array plano o wrapper Laravel). */
export function normalizeMaintenanceLogs(raw: unknown): MaintenanceLog[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as MaintenanceLog[];
  if (typeof raw === 'object' && raw !== null && 'data' in raw) {
    const data = (raw as { data: unknown }).data;
    if (Array.isArray(data)) return data as MaintenanceLog[];
  }
  return [];
}
