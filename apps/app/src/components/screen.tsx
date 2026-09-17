import { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, useColorScheme, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Palette, Spacing, WideBreakpoint } from '@/constants/theme';

interface ScreenProps extends PropsWithChildren {
  header?: ReactNode;
  scroll?: boolean;
}

export function Screen({ children, header, scroll = true }: ScreenProps) {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const { width } = useWindowDimensions();
  const horizontalPadding = width < 380 ? Spacing.lg : width >= WideBreakpoint ? Spacing.xxxl : Spacing.xl;

  const content = (
    <View
      style={[
        styles.content,
        {
          maxWidth: MaxContentWidth,
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
      {scroll ? (
        <ScrollView
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
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: {
    flexGrow: 1,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xl,
  },
});
