import { PropsWithChildren } from 'react';
import {
  Platform,
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
  SurfaceTreatment,
  Typography,
} from '@/constants/theme';
import { normalizeLocalizedNumberInput } from '@/i18n/number-input';
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

interface PrimaryButtonProps extends ButtonProps {
  tone?: 'accent' | 'danger';
}

interface ChoiceChipProps {
  label: string;
  accessibilityLabel?: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

function shadowStyle(opacity: number, radius: number, offsetY: number, elevation: number): ViewStyle {
  if (Platform.OS === 'web') {
    return { boxShadow: `0px ${offsetY}px ${radius}px rgba(0, 0, 0, ${opacity})` };
  }
  return {
    shadowColor: '#000000',
    shadowOpacity: opacity,
    shadowRadius: radius,
    shadowOffset: { width: 0, height: offsetY },
    elevation,
  };
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
  const isDark = scheme === 'dark';
  const shadowOpacity = isDark ? SurfaceTreatment.cardShadowOpacity * 0.7 : SurfaceTreatment.cardShadowOpacity;
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
        },
        shadowStyle(
          shadowOpacity,
          SurfaceTreatment.cardShadowRadius,
          SurfaceTreatment.cardShadowOffsetY,
          SurfaceTreatment.cardElevation,
        ),
        style,
      ]}>
      {children}
    </View>
  );
}

export function MizanTextInput({ style, ...props }: MizanTextInputProps) {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const { isRtl } = useAppState();
  const disabled = props.editable === false || props.accessibilityState?.disabled === true;
  const isNumericInput =
    props.keyboardType === 'decimal-pad' ||
    props.keyboardType === 'number-pad' ||
    props.keyboardType === 'numeric';
  const isLtrIdentityInput =
    props.secureTextEntry === true ||
    props.keyboardType === 'email-address';
  const forceLtrInput = isNumericInput || isLtrIdentityInput;

  return (
    <TextInput
      {...props}
      accessibilityState={{ ...props.accessibilityState, disabled }}
      allowFontScaling
      onChangeText={
        props.onChangeText
          ? (value) => props.onChangeText?.(isNumericInput ? normalizeLocalizedNumberInput(value) : value)
          : undefined
      }
      placeholderTextColor={props.placeholderTextColor ?? palette.textMuted}
      selectionColor={props.selectionColor ?? palette.accent}
      style={[
        styles.input,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          color: palette.text,
          textAlign: isLtrIdentityInput ? 'left' : isRtl ? 'right' : 'left',
        },
        style,
        { writingDirection: forceLtrInput ? 'ltr' : isRtl ? 'rtl' : 'ltr' },
      ]}
    />
  );
}

export function PrimaryButton({ label, onPress, disabled = false, tone = 'accent' }: PrimaryButtonProps) {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const { isRtl } = useAppState();
  const isDark = scheme === 'dark';
  const shadowOpacity = isDark ? SurfaceTreatment.controlShadowOpacity * 0.65 : SurfaceTreatment.controlShadowOpacity;
  const backgroundColor = tone === 'danger' ? palette.danger : palette.accent;
  const foregroundColor = tone === 'danger' ? palette.onDanger : palette.onAccent;
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
          backgroundColor,
          opacity: disabled ? Interaction.disabled : pressed ? Interaction.pressed : 1,
        },
        shadowStyle(
          shadowOpacity,
          SurfaceTreatment.controlShadowRadius,
          SurfaceTreatment.controlShadowOffsetY,
          SurfaceTreatment.controlElevation,
        ),
      ]}>
      <Text
        allowFontScaling
        style={[
          styles.buttonText,
          { color: foregroundColor, writingDirection: isRtl ? 'rtl' : 'ltr' },
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
          backgroundColor: compact ? palette.surface : palette.surfaceMuted,
          borderColor: palette.border,
          opacity: disabled ? Interaction.disabled : pressed ? Interaction.subtlePressed : 1,
        },
      ]}>
      <MizanText variant="label" style={styles.centeredText}>{label}</MizanText>
    </Pressable>
  );
}

export function ChoiceChip({ label, accessibilityLabel, selected, onPress, disabled = false }: ChoiceChipProps) {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? palette.accentSoft : palette.surface,
          borderColor: selected ? palette.accent : palette.border,
          opacity: disabled ? Interaction.disabled : pressed ? Interaction.chipPressed : 1,
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
  card: {
    borderWidth: Controls.borderWidth,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
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
    borderRadius: Radius.pill,
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
