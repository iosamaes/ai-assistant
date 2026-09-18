import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { MizanText, MizanTextInput, PrimaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Spacing } from '@/constants/theme';
import { updatePassword, type AuthFailureKind } from '@/infrastructure/supabase/auth';
import { useAppState } from '@/state/app-state';

export default function UpdatePasswordScreen() {
  const { onboardingCompleted, sessionStatus, t } = useAppState();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => sessionStatus === 'signed-in' && password.length >= 8 && password === confirmPassword && !busy,
    [busy, confirmPassword, password, sessionStatus],
  );

  const authErrorText = (kind: AuthFailureKind) => {
    switch (kind) {
      case 'rate-limited':
        return t('authErrorRateLimited');
      case 'network':
        return t('authErrorNetwork');
      case 'not-configured':
        return t('authErrorConfig');
      default:
        return t('authErrorGeneric');
    }
  };

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setMessage(null);
    const result = await updatePassword(password);
    if (!result.ok) {
      setMessage(authErrorText(result.error.kind));
      setBusy(false);
      return;
    }

    setMessage(t('passwordUpdated'));
    setBusy(false);
    router.replace(onboardingCompleted ? '/today' : '/onboarding');
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <MizanText variant="label" muted>{t('appName')}</MizanText>
        <MizanText variant="display">{t('updatePasswordTitle')}</MizanText>
        <MizanText muted>{t('updatePasswordBody')}</MizanText>
      </View>

      <View style={styles.form}>
        <MizanText variant="label">{t('newPassword')}</MizanText>
        <MizanTextInput
          accessibilityLabel={t('newPassword')}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <MizanText variant="label">{t('confirmPassword')}</MizanText>
        <MizanTextInput
          accessibilityLabel={t('confirmPassword')}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {password.length > 0 && password.length < 8 ? <MizanText muted>{t('passwordMinimum')}</MizanText> : null}
        {confirmPassword.length > 0 && password !== confirmPassword ? <MizanText muted>{t('passwordMismatch')}</MizanText> : null}
        {message ? <MizanText muted>{message}</MizanText> : null}
      </View>

      <View style={styles.footer}>
        <PrimaryButton label={busy ? t('authWorking') : t('savePassword')} onPress={() => void submit()} disabled={!canSubmit} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.md, paddingTop: Spacing.xl },
  form: { gap: Spacing.sm },
  footer: { marginTop: 'auto', paddingTop: Spacing.xl },
});
