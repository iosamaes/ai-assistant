import { Component, ErrorInfo, PropsWithChildren } from 'react';
import {
  I18nManager,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Controls,
  Interaction,
  Palette,
  Radius,
  Spacing,
  Typography,
} from '@/constants/theme';

interface State {
  hasError: boolean;
}

const fallbackCopy = {
  ar: {
    title: 'تعذر عرض هذه الشاشة',
    body: 'حدث خطأ غير متوقع. يمكنك المحاولة مرة أخرى بدون فقد قراراتك.',
    retry: 'إعادة المحاولة',
  },
  en: {
    title: 'This screen could not be displayed',
    body: 'An unexpected error occurred. You can try again without losing your decisions.',
    retry: 'Try again',
  },
} as const;

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const isRtl = I18nManager.isRTL;
  const copy = fallbackCopy[isRtl ? 'ar' : 'en'];
  const textAlign = isRtl ? 'right' : 'left';

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]} accessibilityRole="alert">
      <Text allowFontScaling style={[styles.title, { color: palette.text, textAlign }]}>
        {copy.title}
      </Text>
      <Text allowFontScaling style={[styles.body, { color: palette.textMuted, textAlign }]}>
        {copy.body}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.retry}
        onPress={onRetry}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: palette.accent, opacity: pressed ? Interaction.pressed : 1 },
        ]}>
        <Text allowFontScaling style={[styles.buttonText, { color: palette.onAccent }]}>
          {copy.retry}
        </Text>
      </Pressable>
    </View>
  );
}

export class AppErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (__DEV__) {
      console.error('MIZAN render error', error, info.componentStack);
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return <ErrorFallback onRetry={() => this.setState({ hasError: false })} />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  title: Typography.title,
  body: Typography.body,
  button: {
    minHeight: Controls.standardHeight,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  buttonText: Typography.control,
});
