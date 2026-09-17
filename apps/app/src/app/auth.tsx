import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, useColorScheme, View } from 'react-native';

import { ChoiceChip, MizanText, PrimaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Palette, Radius, Spacing } from '@/constants/theme';
import {
  requestPasswordReset,
  signInWithPassword,
  signUpWithPassword,
  type AuthFailureKind,
} from '@/infrastructure/supabase/auth';
import { useAppState } from '@/state/app-state';

type AuthMode = 'sign-in' | 'sign-up' | 'reset';

export default function AuthScreen() {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const { isRtl, locale, refreshSession, setLocale, t } = useAppState();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!email.trim() || busy) return false;
    return mode === 'reset' || password.length >= 6;
  }, [busy, email, mode, password.length]);

  const authErrorText = (kind: AuthFailureKind) => {
    switch (kind) {
      case 'invalid-credentials':
        return t('authErrorCredentials');
      case 'email-not-confirmed':
        return t('authErrorEmailNotConfirmed');
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

    if (mode === 'reset') {
      const result = await requestPasswordReset(email);
      setMessage(result.ok ? t('resetSent') : authErrorText(result.error.kind));
      setBusy(false);
      return;
    }

    const result =
      mode === 'sign-in'
        ? await signInWithPassword(email, password)
        : await signUpWithPassword(email, password);

    if (!result.ok) {
      setMessage(authErrorText(result.error.kind));
      setBusy(false);
      return;
    }

    if (!result.value) {
      setMessage(t('checkEmail'));
      setBusy(false);
      return;
    }

    await refreshSession();
    setBusy(false);
    router.replace('/');
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <MizanText variant="label" muted>{t('appName')}</MizanText>
        <MizanText variant="display">{t('authTitle')}</MizanText>
        <MizanText muted>{t('authBody')}</MizanText>
      </View>

      <View style={styles.section}>
        <View style={[styles.row, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <ChoiceChip label={t('arabic')} selected={locale === 'ar'} onPress={() => setLocale('ar')} />
          <ChoiceChip label={t('english')} selected={locale === 'en'} onPress={() => setLocale('en')} />
        </View>
      </View>

      <View style={styles.section}>
        <View style={[styles.row, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <ChoiceChip label={t('signIn')} selected={mode === 'sign-in'} onPress={() => setMode('sign-in')} />
          <ChoiceChip label={t('signUp')} selected={mode === 'sign-up'} onPress={() => setMode('sign-up')} />
          <ChoiceChip label={t('resetPassword')} selected={mode === 'reset'} onPress={() => setMode('reset')} />
        </View>
      </View>

      <View style={styles.form}>
        <MizanText variant="label">{t('email')}</MizanText>
        <TextInput
          accessibilityLabel={t('email')}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="name@example.com"
          placeholderTextColor={palette.textMuted}
          value={email}
          onChangeText={setEmail}
          style={[
            styles.input,
            {
              borderColor: palette.border,
              color: palette.text,
              backgroundColor: palette.surface,
              textAlign: isRtl ? 'right' : 'left',
            },
          ]}
        />

        {mode !== 'reset' ? (
          <>
            <MizanText variant="label">{t('password')}</MizanText>
            <TextInput
              accessibilityLabel={t('password')}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={[
                styles.input,
                {
                  borderColor: palette.border,
                  color: palette.text,
                  backgroundColor: palette.surface,
                  textAlign: isRtl ? 'right' : 'left',
                },
              ]}
            />
          </>
        ) : null}

        {message ? <MizanText muted>{message}</MizanText> : null}
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label={busy ? t('authWorking') : mode === 'reset' ? t('sendReset') : mode === 'sign-in' ? t('signIn') : t('signUp')}
          onPress={() => void submit()}
          disabled={!canSubmit}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.md, paddingTop: Spacing.xl },
  section: { gap: Spacing.md },
  row: { flexWrap: 'wrap', gap: Spacing.sm },
  form: { gap: Spacing.sm },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  footer: { marginTop: 'auto', paddingTop: Spacing.xl },
});
