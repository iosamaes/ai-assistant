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
    onAccent: '#FFFFFF',
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
    onAccent: '#102018',
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

export const Typography = {
  display: { fontSize: 36, lineHeight: 44, fontWeight: '700', letterSpacing: -0.7 },
  title: { fontSize: 22, lineHeight: 30, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 25, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 19, fontWeight: '500' },
  control: { fontSize: 16, lineHeight: 22, fontWeight: '700' },
} as const;

export const Controls = {
  minimumTouchHeight: 44,
  actionHeight: 48,
  standardHeight: 52,
  borderWidth: 1,
} as const;

export const Interaction = {
  pressed: 0.82,
  subtlePressed: 0.72,
  chipPressed: 0.75,
  disabled: 0.45,
} as const;

export const Layout = {
  maxContentWidth: 760,
  compactWidth: 380,
  wideBreakpoint: 960,
  horizontalPadding: {
    compact: Spacing.lg,
    regular: Spacing.xl,
    wide: Spacing.xxxl,
  },
} as const;

// Compatibility aliases while CP9 incrementally moves existing screens to semantic layout tokens.
export const MaxContentWidth = Layout.maxContentWidth;
export const WideBreakpoint = Layout.wideBreakpoint;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', mono: 'ui-monospace' },
  web: { sans: 'system-ui', mono: 'ui-monospace' },
  default: { sans: 'sans-serif', mono: 'monospace' },
});
