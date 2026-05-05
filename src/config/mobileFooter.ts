export interface MobileFooterItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  isCenter?: boolean;
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
  },
  {
    id: 'planes',
    label: 'Planes',
    icon: 'ClipboardText',
    href: '/planes',
  },
];
