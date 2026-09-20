import { Platform } from 'react-native';

export const Palette = {
  light: {
    background: '#F4F2EC',
    surface: '#FFFEFB',
    surfaceMuted: '#ECEFEA',
    text: '#142019',
    textMuted: '#627067',
    border: '#D7DED7',
    accent: '#245E4A',
    onAccent: '#F9FCFA',
    accentSoft: '#DCE9E2',
    danger: '#A84444',
    onDanger: '#FFF8F8',
  },
  dark: {
    background: '#0C1210',
    surface: '#151D19',
    surfaceMuted: '#1E2923',
    text: '#F4F6F2',
    textMuted: '#A9B6AE',
    border: '#2D3A33',
    accent: '#83C7A8',
    onAccent: '#0A1A13',
    accentSoft: '#20382D',
    danger: '#E59696',
    onDanger: '#241010',
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

export const Radius = { sm: 12, md: 18, lg: 28, pill: 999 } as const;

export const Typography = {
  display: { fontSize: 40, lineHeight: 48, fontWeight: '700', letterSpacing: -0.9 },
  title: { fontSize: 23, lineHeight: 31, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 26, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '700' },
  caption: { fontSize: 13, lineHeight: 19, fontWeight: '500' },
  control: { fontSize: 16, lineHeight: 22, fontWeight: '700' },
} as const;

export const Controls = {
  minimumTouchHeight: 44,
  actionHeight: 50,
  standardHeight: 54,
  borderWidth: 1,
} as const;

export const Interaction = {
  pressed: 0.88,
  subtlePressed: 0.78,
  chipPressed: 0.8,
  disabled: 0.45,
} as const;

export const SurfaceTreatment = {
  cardShadowOpacity: 0.08,
  cardShadowRadius: 18,
  cardShadowOffsetY: 8,
  cardElevation: 3,
  controlShadowOpacity: 0.1,
  controlShadowRadius: 10,
  controlShadowOffsetY: 4,
  controlElevation: 2,
} as const;

export const Layout = {
  maxContentWidth: 880,
  compactWidth: 380,
  wideBreakpoint: 1024,
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
