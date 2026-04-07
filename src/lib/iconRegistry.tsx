// Registro de packs de íconos soportados.
// Se pueden añadir más packs aquí sin tocar el resto del código.

import React from 'react';
import * as Lucide from 'lucide-react';
import * as Tabler from '@tabler/icons-react';
import * as Phosphor from 'phosphor-react';
// Iconify ofrece miles de sets, aquí demostramos import básico.
import { Icon as IconifyIcon } from '@iconify/react';

export const iconPacks = {
  lucide: Lucide,
  tabler: Tabler,
  phosphor: Phosphor,
  // iconify es especial: los nombres son dinámicos (prefijo:icon-name)
};

export type IconPackKey = keyof typeof iconPacks | 'iconify';

export function listIcons(pack: IconPackKey): string[] {
  if (pack === 'iconify') {
    // Para iconify podrías implementar una búsqueda remota o lista reducida.
    return [];
  }
  const lib = iconPacks[pack as keyof typeof iconPacks];
  if (!lib) return [];
  return Object.keys(lib).filter(k => /^[A-Z]/.test(k));
}

export interface DynamicIconProps {
  pack?: IconPackKey | null;
  name?: string | null;
  className?: string;
  size?: number;
}

export function DynamicIcon({ pack = 'lucide', name, className, size = 18 }: DynamicIconProps) {
  if (!name) return null;
  if (pack === 'iconify') {
    return (
      <IconifyIcon
        icon={name}
        className={className}
        width={size}
        height={size}
      />
    );
  }
  const lib = iconPacks[pack as keyof typeof iconPacks];
  const Comp = (lib as any)[name];
  return Comp ? <Comp className={className} size={size} /> : null;
}
