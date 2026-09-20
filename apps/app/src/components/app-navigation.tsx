import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, useColorScheme, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import { focusRingStyle, MizanText } from '@/components/mizan-ui';
import { Controls, Interaction, Layout, Palette, Radius, Spacing } from '@/constants/theme';
import { useAppState } from '@/state/app-state';

type DestinationId = 'home' | 'lifeMap' | 'oneMove' | 'insights' | 'more';

type Destination = {
  id: DestinationId;
  href: '/today' | '/life-map' | '/one-move' | '/insights' | '/settings';
  icon: AppIconName;
};

const destinations: readonly Destination[] = [
  { id: 'home', href: '/today', icon: 'home' },
  { id: 'lifeMap', href: '/life-map', icon: 'lifeMap' },
  { id: 'oneMove', href: '/one-move', icon: 'oneMove' },
  { id: 'insights', href: '/insights', icon: 'insights' },
  { id: 'more', href: '/settings', icon: 'more' },
];

const labels = {
  ar: {
    navigation: 'التنقل الرئيسي',
    home: 'الرئيسية',
    lifeMap: 'خريطة الحياة',
    oneMove: 'خطوتي',
    insights: 'الرؤى',
    more: 'المزيد',
  },
  en: {
    navigation: 'Primary navigation',
    home: 'Home',
    lifeMap: 'Life Map',
    oneMove: 'One Move',
    insights: 'Insights',
    more: 'More',
  },
} as const;

function activeDestination(segment: string | undefined): DestinationId {
  if (segment === 'today' || segment === 'check-in') return 'home';
  if (segment === 'life-map') return 'lifeMap';
  if (segment === 'one-move') return 'oneMove';
  if (segment === 'insights' || segment === 'personal-learning' || segment === 'why') return 'insights';
  return 'more';
}

interface AppNavigationProps {
  activeSegment?: string;
}

export function AppNavigation({ activeSegment }: AppNavigationProps) {
  const { isRtl, locale, t } = useAppState();
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [focusedDestination, setFocusedDestination] = useState<DestinationId | null>(null);
  const wide = width >= Layout.wideBreakpoint;
  const active = activeDestination(activeSegment);
  const copy = labels[locale];

  return (
    <View
      accessibilityLabel={copy.navigation}
      accessibilityRole="tablist"
      style={[
        wide ? styles.rail : styles.bottomBar,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          borderLeftWidth: wide && isRtl ? Controls.borderWidth : 0,
          borderRightWidth: wide && !isRtl ? Controls.borderWidth : 0,
          paddingBottom: wide ? Spacing.lg : Math.max(insets.bottom, Spacing.sm),
          paddingTop: wide ? Math.max(insets.top, Spacing.xl) : Spacing.sm,
        },
      ]}>
      {wide ? (
        <View style={[styles.brandBlock, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
          <View style={[styles.brandMark, { backgroundColor: palette.accentSoft }]}>
            <AppIcon name="oneMove" color={palette.accent} size={24} />
          </View>
          <MizanText variant="title">{t('appName')}</MizanText>
        </View>
      ) : null}

      <View
        style={[
          wide ? styles.railItems : styles.bottomItems,
          !wide && { flexDirection: isRtl ? 'row-reverse' : 'row' },
        ]}>
        {destinations.map((destination) => {
          const selected = active === destination.id;
          const label = copy[destination.id];
          return (
            <Pressable
              key={destination.id}
              accessibilityLabel={label}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onBlur={() => {
                setFocusedDestination((current) => current === destination.id ? null : current);
              }}
              onFocus={() => setFocusedDestination(destination.id)}
              onPress={() => router.replace(destination.href)}
              style={({ pressed }) => [
                wide ? styles.railItem : styles.bottomItem,
                wide && { flexDirection: isRtl ? 'row-reverse' : 'row' },
                {
                  backgroundColor: selected ? palette.accentSoft : 'transparent',
                  opacity: pressed ? Interaction.subtlePressed : 1,
                },
                focusRingStyle(palette.accent, focusedDestination === destination.id),
              ]}>
              <AppIcon
                name={destination.icon}
                color={selected ? palette.accent : palette.textMuted}
                size={wide ? 23 : 21}
              />
              <MizanText
                variant="caption"
                style={{ color: selected ? palette.accent : palette.textMuted, textAlign: 'center' }}>
                {label}
              </MizanText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    borderTopWidth: Controls.borderWidth,
    paddingHorizontal: Spacing.sm,
  },
  bottomItems: {
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  bottomItem: {
    alignItems: 'center',
    borderRadius: Radius.md,
    flex: 1,
    gap: 3,
    justifyContent: 'center',
    minHeight: 58,
    minWidth: Controls.minimumTouchHeight,
    paddingHorizontal: 2,
    paddingVertical: Spacing.xs,
  },
  rail: {
    gap: Spacing.xl,
    minWidth: 188,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  brandBlock: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  brandMark: {
    alignItems: 'center',
    borderRadius: Radius.md,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  railItems: {
    gap: Spacing.sm,
  },
  railItem: {
    alignItems: 'center',
    borderRadius: Radius.md,
    gap: Spacing.md,
    minHeight: Controls.standardHeight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});
