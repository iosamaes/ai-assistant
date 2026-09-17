import { Platform } from 'react-native';

export const Palette = {
  light: {
    background: '#F7F7F3',
    surface: '#FFFFFF',
    surfaceMuted: '#F0F1EC',
    text: '#18201C',
    textMuted: '#65706A',
    border: '#DDE2DC',
    accent: '#2F6B57',
    accentSoft: '#DDEBE4',
    danger: '#A04444',
  },
  dark: {
    background: '#111613',
    surface: '#19201C',
    surfaceMuted: '#232B26',
    text: '#F3F6F3',
    textMuted: '#AEB9B1',
    border: '#334039',
    accent: '#79B99D',
    accentSoft: '#243B31',
    danger: '#E28C8C',
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = { sm: 10, md: 16, lg: 24, pill: 999 } as const;
export const MaxContentWidth = 760;
export const WideBreakpoint = 960;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', mono: 'ui-monospace' },
  web: { sans: 'system-ui', mono: 'ui-monospace' },
  default: { sans: 'sans-serif', mono: 'monospace' },
});
