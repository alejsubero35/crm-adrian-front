export type ThemeConfig = {
  sidebarColor: string;
  sidebarTextColor: string;
  primaryColor: string;
};

const STORAGE_KEY = 'theme_config_v1';

const DEFAULT_THEME: ThemeConfig = {
  sidebarColor: '#000000',
  sidebarTextColor: '#ffffff',
  primaryColor: '#000BC2',
};

/** Colores primarios legacy (naranja) que se migran al azul de marca. */
const LEGACY_PRIMARY_COLORS = new Set(['#f17d1e', '#ff7a1a', '#ff6620']);

function normalizePrimaryColor(hex: string): string {
  const key = hex.trim().toLowerCase();
  return LEGACY_PRIMARY_COLORS.has(key) ? DEFAULT_THEME.primaryColor : hex;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace('#', '').trim();
  const full = normalized.length === 3
    ? normalized.split('').map((c) => `${c}${c}`).join('')
    : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;

  const num = Number.parseInt(full, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => clamp(v, 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function adjustHex(hex: string, delta: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(rgb.r + delta, rgb.g + delta, rgb.b + delta);
}

function hexToHslChannels(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '0 0% 0%';

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }

  const hue = Math.round(h * 360);
  const sat = Math.round(s * 100);
  const lig = Math.round(l * 100);

  return `${hue} ${sat}% ${lig}%`;
}

export function getThemeConfig(): ThemeConfig {
  if (typeof window === 'undefined') return DEFAULT_THEME;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_THEME;

  try {
    const parsed = JSON.parse(raw) as Partial<ThemeConfig>;
    const primaryColor = normalizePrimaryColor(
      parsed.primaryColor || DEFAULT_THEME.primaryColor,
    );
    return {
      sidebarColor: parsed.sidebarColor || DEFAULT_THEME.sidebarColor,
      sidebarTextColor: parsed.sidebarTextColor || DEFAULT_THEME.sidebarTextColor,
      primaryColor,
    };
  } catch {
    return DEFAULT_THEME;
  }
}

export function saveThemeConfig(config: ThemeConfig): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function applyThemeConfig(config: ThemeConfig): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  const sidebarAccent = adjustHex(config.sidebarColor, 22);
  const sidebarBorder = adjustHex(config.sidebarColor, 44);
  const secondary = adjustHex(config.primaryColor, -24);
  const topbarTo = adjustHex(config.primaryColor, 34);

  root.style.setProperty('--sidebar-background', hexToHslChannels(config.sidebarColor));
  root.style.setProperty('--sidebar-foreground', hexToHslChannels(config.sidebarTextColor));
  root.style.setProperty('--sidebar-primary', hexToHslChannels(config.primaryColor));
  root.style.setProperty('--sidebar-accent', hexToHslChannels(sidebarAccent));
  root.style.setProperty('--sidebar-accent-foreground', hexToHslChannels(config.primaryColor));
  root.style.setProperty('--sidebar-border', hexToHslChannels(sidebarBorder));
  root.style.setProperty('--sidebar-ring', hexToHslChannels(config.primaryColor));

  root.style.setProperty('--primary', hexToHslChannels(config.primaryColor));
  root.style.setProperty('--accent', hexToHslChannels(config.primaryColor));
  root.style.setProperty('--ring', hexToHslChannels(config.primaryColor));
  root.style.setProperty('--secondary', hexToHslChannels(secondary));

  root.style.setProperty('--topbar-from', config.primaryColor);
  root.style.setProperty('--topbar-to', topbarTo);
}

export function resetThemeConfig(): ThemeConfig {
  saveThemeConfig(DEFAULT_THEME);
  applyThemeConfig(DEFAULT_THEME);
  return DEFAULT_THEME;
}
