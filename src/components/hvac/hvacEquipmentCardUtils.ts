export function formatMaintenanceShort(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

/** Saludo del portal cliente: BIENVENIDO (A) [nombre]. */
export function formatClientWelcome(customerName: string): string {
  const name = customerName.trim();
  if (!name) return 'BIENVENIDO (A)';
  return `BIENVENIDO (A) ${name.toUpperCase()}`;
}

type ClientNameSource = {
  name?: string | null;
  customer_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  email?: string | null;
};

/** Nombre visible del cliente (ficha CRM > usuario portal > partes del nombre). */
export function resolveClientDisplayName(
  customerFromApi?: { name?: string | null } | null,
  user?: ClientNameSource | null
): string {
  const fromCustomer = customerFromApi?.name?.trim();
  if (fromCustomer) return fromCustomer;

  const fromUserCustomer = user?.customer_name?.trim();
  if (fromUserCustomer) return fromUserCustomer;

  const fromUserName = user?.name?.trim();
  if (fromUserName) return fromUserName;

  const built = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();
  if (built) return built;

  return user?.username?.trim() || user?.email?.trim() || '';
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
