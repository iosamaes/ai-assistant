import { PropsWithChildren } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  useColorScheme,
  View,
  ViewStyle,
} from 'react-native';

import {
  Controls,
  Interaction,
  Palette,
  Radius,
  Spacing,
  Typography,
} from '@/constants/theme';
import { useAppState } from '@/state/app-state';

interface MizanTextProps extends TextProps {
  variant?: 'display' | 'title' | 'body' | 'label' | 'caption';
  muted?: boolean;
  style?: StyleProp<TextStyle>;
}

interface MizanTextInputProps extends TextInputProps {
  style?: StyleProp<TextStyle>;
}

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

interface ChoiceChipProps {
  label: string;
  accessibilityLabel?: string;
  selected: boolean;
  onPress: () => void;
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
        styles[variant],
        {
          color: muted ? palette.textMuted : palette.text,
          textAlign: isRtl ? 'right' : 'left',
          writingDirection: isRtl ? 'rtl' : 'ltr',
        },
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

export function MizanTextInput({ style, ...props }: MizanTextInputProps) {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const { isRtl } = useAppState();

  return (
    <TextInput
      {...props}
      allowFontScaling
      placeholderTextColor={props.placeholderTextColor ?? palette.textMuted}
      style={[
        styles.input,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          color: palette.text,
          textAlign: isRtl ? 'right' : 'left',
          writingDirection: isRtl ? 'rtl' : 'ltr',
        },
        style,
      ]}
    />
  );
}

export function PrimaryButton({ label, onPress, disabled = false }: ButtonProps) {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const { isRtl } = useAppState();
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: palette.accent,
          opacity: disabled ? Interaction.disabled : pressed ? Interaction.pressed : 1,
        },
      ]}>
      <Text
        allowFontScaling
        style={[
          styles.buttonText,
          { color: palette.onAccent, writingDirection: isRtl ? 'rtl' : 'ltr' },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  disabled = false,
  compact = false,
}: ButtonProps & { compact?: boolean }) {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        compact ? styles.secondaryButtonCompact : null,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          opacity: disabled ? Interaction.disabled : pressed ? Interaction.subtlePressed : 1,
        },
      ]}>
      <MizanText variant="label" style={styles.centeredText}>{label}</MizanText>
    </Pressable>
  );
}

export function ChoiceChip({ label, accessibilityLabel, selected, onPress }: ChoiceChipProps) {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? palette.accentSoft : palette.surface,
          borderColor: selected ? palette.accent : palette.border,
          opacity: pressed ? Interaction.chipPressed : 1,
        },
      ]}>
      <MizanText variant="label" style={styles.centeredText}>{label}</MizanText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  display: Typography.display,
  title: Typography.title,
  body: Typography.body,
  label: Typography.label,
  caption: Typography.caption,
  card: { borderWidth: Controls.borderWidth, borderRadius: Radius.lg, padding: Spacing.xl, gap: Spacing.md },
  input: {
    minHeight: Controls.standardHeight,
    borderWidth: Controls.borderWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.control.lineHeight,
  },
  button: {
    minHeight: Controls.standardHeight,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  buttonText: { ...Typography.control, textAlign: 'center' },
  secondaryButton: {
    minHeight: Controls.standardHeight,
    borderWidth: Controls.borderWidth,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  secondaryButtonCompact: {
    minHeight: Controls.minimumTouchHeight,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.lg,
  },
  centeredText: { textAlign: 'center' },
  chip: {
    minHeight: Controls.minimumTouchHeight,
    borderWidth: Controls.borderWidth,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
});
