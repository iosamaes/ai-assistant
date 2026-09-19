import { StyleSheet, useColorScheme, View } from 'react-native';

import { Palette, Radius } from '@/constants/theme';

type BrandedIllustrationVariant = 'focus' | 'recovery' | 'welcome';

interface BrandedIllustrationProps {
  variant?: BrandedIllustrationVariant;
  size?: number;
}

/**
 * Small app-owned illustration language for calm, branded product moments.
 * Decorative only: meaning must always remain available in adjacent text.
 */
export function BrandedIllustration({ variant = 'focus', size = 160 }: BrandedIllustrationProps) {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';
  const sunScale = variant === 'welcome' ? 1.08 : variant === 'recovery' ? 0.9 : 1;
  const leafOffset = variant === 'recovery' ? 6 : variant === 'welcome' ? -4 : 0;

  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[styles.frame, { width: size, height: size }]}>
      <View
        style={[
          styles.orb,
          {
            width: size * 0.82,
            height: size * 0.82,
            borderRadius: size,
            backgroundColor: palette.surface,
            borderColor: palette.border,
          },
        ]}
      />
      <View
        style={[
          styles.sun,
          {
            width: size * 0.24 * sunScale,
            height: size * 0.24 * sunScale,
            borderRadius: size,
            backgroundColor: palette.accent,
            opacity: isDark ? 0.9 : 0.78,
          },
        ]}
      />
      <View
        style={[
          styles.horizon,
          {
            width: size * 0.62,
            borderColor: palette.accent,
            opacity: isDark ? 0.55 : 0.38,
          },
        ]}
      />
      <View
        style={[
          styles.horizon,
          styles.horizonLower,
          {
            width: size * 0.48,
            borderColor: palette.textMuted,
            opacity: isDark ? 0.42 : 0.3,
          },
        ]}
      />
      <View
        style={[
          styles.stem,
          {
            height: size * 0.42,
            backgroundColor: palette.accent,
            opacity: isDark ? 0.62 : 0.5,
            transform: [{ translateX: leafOffset }],
          },
        ]}
      />
      <View
        style={[
          styles.leaf,
          styles.leafLeft,
          {
            width: size * 0.24,
            height: size * 0.11,
            borderRadius: Radius.pill,
            backgroundColor: palette.accentSoft,
            borderColor: palette.accent,
            transform: [{ translateX: leafOffset }, { rotate: '-28deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.leaf,
          styles.leafRight,
          {
            width: size * 0.28,
            height: size * 0.12,
            borderRadius: Radius.pill,
            backgroundColor: palette.accentSoft,
            borderColor: palette.accent,
            transform: [{ translateX: leafOffset }, { rotate: '26deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.leaf,
          styles.leafTop,
          {
            width: size * 0.2,
            height: size * 0.09,
            borderRadius: Radius.pill,
            backgroundColor: palette.surfaceMuted,
            borderColor: palette.accent,
            transform: [{ translateX: leafOffset }, { rotate: '-8deg' }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderWidth: 1,
  },
  sun: {
    position: 'absolute',
    top: '18%',
    right: '20%',
  },
  horizon: {
    position: 'absolute',
    top: '61%',
    borderTopWidth: 2,
    borderRadius: Radius.pill,
  },
  horizonLower: {
    top: '69%',
    borderTopWidth: 1,
  },
  stem: {
    position: 'absolute',
    bottom: '18%',
    width: 2,
    borderRadius: Radius.pill,
  },
  leaf: {
    position: 'absolute',
    borderWidth: 1,
  },
  leafLeft: {
    left: '19%',
    bottom: '35%',
  },
  leafRight: {
    right: '14%',
    bottom: '28%',
  },
  leafTop: {
    left: '27%',
    top: '31%',
  },
});
