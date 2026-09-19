import { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, useColorScheme, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Layout, Palette, Spacing } from '@/constants/theme';

interface ScreenProps extends PropsWithChildren {
  header?: ReactNode;
  scroll?: boolean;
}

export function Screen({ children, header, scroll = true }: ScreenProps) {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const { width } = useWindowDimensions();
  const horizontalPadding =
    width < Layout.compactWidth
      ? Layout.horizontalPadding.compact
      : width >= Layout.wideBreakpoint
        ? Layout.horizontalPadding.wide
        : Layout.horizontalPadding.regular;

  const content = (
    <View
      style={[
        styles.content,
        {
          maxWidth: Layout.maxContentWidth,
          paddingHorizontal: horizontalPadding,
          alignSelf: 'center',
          width: '100%',
        },
      ]}>
      {header}
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <View style={[styles.ambientTop, { backgroundColor: palette.accentSoft }]} />
      <View style={[styles.ambientBottom, { backgroundColor: palette.surfaceMuted }]} />
      {scroll ? (
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          style={styles.scroll}
          contentInsetAdjustmentBehavior="automatic">
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, overflow: 'hidden' },
  ambientTop: {
    pointerEvents: 'none',
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    top: -250,
    right: -170,
    opacity: 0.55,
  },
  ambientBottom: {
    pointerEvents: 'none',
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    bottom: -210,
    left: -140,
    opacity: 0.4,
  },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: {
    flexGrow: 1,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xl,
  },
});
