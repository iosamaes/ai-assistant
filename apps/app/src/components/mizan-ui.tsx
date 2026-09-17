import { PropsWithChildren } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
  useColorScheme,
  View,
  ViewStyle,
} from 'react-native';

import { Palette, Radius, Spacing } from '@/constants/theme';
import { useAppState } from '@/state/app-state';

interface MizanTextProps extends TextProps {
  variant?: 'display' | 'title' | 'body' | 'label' | 'caption';
  muted?: boolean;
  style?: StyleProp<TextStyle>;
}

export function MizanText({ children, variant = 'body', muted = false, style, ...props }: MizanTextProps) {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const { isRtl } = useAppState();

  return (
    <Text
      {...props}
      allowFontScaling
      style={[
        styles.text,
        styles[variant],
        { color: muted ? palette.textMuted : palette.text, textAlign: isRtl ? 'right' : 'left' },
        style,
      ]}>
      {children}
    </Text>
  );
}

export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  return (
    <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }, style]}>
      {children}
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.accent, opacity: disabled ? 0.45 : pressed ? 0.82 : 1 },
      ]}>
      <Text style={[styles.buttonText, { color: scheme === 'dark' ? '#102018' : '#FFFFFF' }]}>{label}</Text>
    </Pressable>
  );
}

export function ChoiceChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? palette.accentSoft : palette.surface,
          borderColor: selected ? palette.accent : palette.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}>
      <MizanText variant="label">{label}</MizanText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: 16, lineHeight: 25 },
  display: { fontSize: 36, lineHeight: 44, fontWeight: '700', letterSpacing: -0.7 },
  title: { fontSize: 22, lineHeight: 30, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 25, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 19, fontWeight: '500' },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.lg, padding: Spacing.xl, gap: Spacing.md },
  button: { minHeight: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  buttonText: { fontSize: 16, lineHeight: 22, fontWeight: '700' },
  chip: { minHeight: 44, borderWidth: 1, borderRadius: Radius.pill, paddingHorizontal: Spacing.lg, justifyContent: 'center' },
});
