export interface MobileFooterItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  isCenter?: boolean;
  /** Si se define, solo usuarios con alguno de estos roles ven el ítem (el rol `admin` siempre pasa en el filtro del nav). */
  requiredRoles?: string[];
}

// Las opciones visibles en el footer móvil se controlan únicamente aquí.
export const MOBILE_FOOTER_ITEMS: MobileFooterItem[] = [
  {
    id: 'home',
    label: 'Inicio',
    icon: 'Home',
    href: '/dashboard',
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: 'Users',
    href: '/clientes',
  },
  {
    id: 'scan',
    label: 'Escanear',
    icon: 'QrCode',
    href: '/scan',
    isCenter: true,
  },
  {
    id: 'etiquetas',
    label: 'Etiquetas',
    icon: 'QrCode',
    href: '/qrs',
    requiredRoles: ['admin'],
  },
  {
    id: 'planes',
    label: 'Planes',
    icon: 'ClipboardText',
    href: '/planes',
    requiredRoles: ['admin'],
  },
];
