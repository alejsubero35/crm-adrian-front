export function formatMaintenanceShort(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

export function splitInstallationLocation(location?: string | null) {
  const trimmed = location?.trim();
  if (!trimmed) {
    return { primary: 'Sin ubicación', secondary: '' };
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { primary: parts[0], secondary: '' };
  }
  return { primary: parts[0], secondary: parts.slice(1).join(' ') };
}
