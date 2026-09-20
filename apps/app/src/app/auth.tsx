import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, useColorScheme, useWindowDimensions, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { BrandedIllustration } from '@/components/branded-illustration';
import { Card, ChoiceChip, MizanText, MizanTextInput, PrimaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Layout, Palette, Radius, Spacing } from '@/constants/theme';
import {
  requestPasswordReset,
  signInWithPassword,
  signUpWithPassword,
  type AuthFailureKind,
} from '@/infrastructure/supabase/auth';
import { useAppState } from '@/state/app-state';

type AuthMode = 'sign-in' | 'sign-up' | 'reset';

const authVisualCopy = {
  ar: {
    heroTitle: 'مساحتك تبدأ من حسابك',
    heroBody: 'سجّل الدخول أو أنشئ حسابًا جديدًا للوصول إلى بياناتك وتعلّمك الشخصي عبر أجهزتك. استعادة كلمة المرور تبقى خطوة منفصلة وواضحة.',
    accessTitle: 'طريقة الدخول',
    languageTitle: 'لغة الواجهة',
    formTitle: 'بيانات الحساب',
    privacyTitle: 'حسابك وحدودك',
    secureNote: 'لن يعرض ميزان أخطاء تقنية خامًا، ولن يستخدم كلمة مرورك خارج مسار المصادقة.',
  },
  en: {
    heroTitle: 'Your space starts with your account',
    heroBody: 'Sign in or create an account to reach your data and personal learning across devices. Password recovery stays a separate, explicit flow.',
    accessTitle: 'Access mode',
    languageTitle: 'Interface language',
    formTitle: 'Account details',
    privacyTitle: 'Your account, your boundaries',
    secureNote: 'MIZAN does not expose raw technical errors and does not use your password outside the authentication flow.',
  },
} as const;

export default function AuthScreen() {
  const { isRtl, locale, refreshSession, sessionStatus, setLocale, t } = useAppState();
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const { width } = useWindowDimensions();
  const isWide = width >= Layout.wideBreakpoint;
  const labels = authVisualCopy[locale];
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!email.trim() || busy) return false;
    if (mode === 'reset') return true;
    if (mode === 'sign-up') return password.length >= 8;
    return password.length >= 6;
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
        : await signUpWithPassword(email, password, locale);

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
      <View style={styles.heading}>
        <MizanText variant="label" muted>{t('appName')}</MizanText>
        <MizanText variant="display">{t('authTitle')}</MizanText>
      </View>

      <View
        style={[
          styles.pageLayout,
          { flexDirection: isWide ? (isRtl ? 'row-reverse' : 'row') : 'column' },
        ]}>
        <Card style={[styles.heroCard, { backgroundColor: palette.accentSoft, borderColor: palette.accent }]}>
          <View style={styles.heroCopy}>
            <MizanText variant="label" style={{ color: palette.accent }}>MIZAN</MizanText>
            <MizanText variant="title">{labels.heroTitle}</MizanText>
            <MizanText>{t('authBody')}</MizanText>
            <MizanText variant="caption" muted>{labels.heroBody}</MizanText>
          </View>

          <View style={styles.heroVisual}>
            <BrandedIllustration variant="welcome" size={isWide ? 190 : 156} />
          </View>

          {sessionStatus === 'expired' ? (
            <View style={[styles.messagePanel, { backgroundColor: palette.surface }]}>
              <MizanText accessibilityLiveRegion="polite" variant="label">{t('authSessionExpired')}</MizanText>
            </View>
          ) : null}

          <View
            style={[
              styles.privacyPanel,
              {
                backgroundColor: palette.surface,
                flexDirection: isRtl ? 'row-reverse' : 'row',
              },
            ]}>
            <View style={[styles.iconBadge, { backgroundColor: palette.accentSoft }]}>
              <AppIcon name="privacy" color={palette.accent} size={20} />
            </View>
            <View style={styles.privacyCopy}>
              <MizanText variant="label">{labels.privacyTitle}</MizanText>
              <MizanText variant="caption" muted>{labels.secureNote}</MizanText>
            </View>
          </View>
        </Card>

        <Card style={styles.authCard}>
          <View style={[styles.controlPanel, { backgroundColor: palette.surfaceMuted }]}>
            <View style={styles.controlGroup}>
              <MizanText variant="label" muted>{labels.languageTitle}</MizanText>
              <View style={[styles.row, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <ChoiceChip label={t('arabic')} selected={locale === 'ar'} onPress={() => setLocale('ar')} disabled={busy} />
                <ChoiceChip label={t('english')} selected={locale === 'en'} onPress={() => setLocale('en')} disabled={busy} />
              </View>
            </View>

            <View style={styles.controlGroup}>
              <MizanText variant="label" muted>{labels.accessTitle}</MizanText>
              <View style={[styles.row, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <ChoiceChip label={t('signIn')} selected={mode === 'sign-in'} onPress={() => setMode('sign-in')} disabled={busy} />
                <ChoiceChip label={t('signUp')} selected={mode === 'sign-up'} onPress={() => setMode('sign-up')} disabled={busy} />
                <ChoiceChip label={t('resetPassword')} selected={mode === 'reset'} onPress={() => setMode('reset')} disabled={busy} />
              </View>
            </View>
          </View>

          <View style={styles.form}>
            <MizanText variant="label" muted>{labels.formTitle}</MizanText>
            <View style={styles.field}>
              <MizanText variant="label">{t('email')}</MizanText>
              <MizanTextInput
                accessibilityLabel={t('email')}
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                editable={!busy}
                keyboardType="email-address"
                placeholder="name@example.com"
                style={styles.ltrInput}
                textContentType="emailAddress"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {mode !== 'reset' ? (
              <View style={styles.field}>
                <MizanText variant="label">{t('password')}</MizanText>
                <MizanTextInput
                  accessibilityLabel={t('password')}
                  autoCapitalize="none"
                  autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
                  autoCorrect={false}
                  editable={!busy}
                  secureTextEntry
                  style={styles.ltrInput}
                  textContentType={mode === 'sign-up' ? 'newPassword' : 'password'}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            ) : null}

            {mode === 'sign-up' && password.length > 0 && password.length < 8 ? (
              <View style={[styles.messagePanel, { backgroundColor: palette.surfaceMuted }]}>
                <MizanText accessibilityLiveRegion="polite" variant="caption" muted>{t('passwordMinimum')}</MizanText>
              </View>
            ) : null}

            {message ? (
              <View style={[styles.messagePanel, { backgroundColor: palette.surfaceMuted }]}>
                <MizanText accessibilityLiveRegion="polite">{message}</MizanText>
              </View>
            ) : null}
          </View>

          <PrimaryButton
            label={busy ? t('authWorking') : mode === 'reset' ? t('sendReset') : mode === 'sign-in' ? t('signIn') : t('signUp')}
            onPress={() => void submit()}
            disabled={!canSubmit}
          />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { gap: Spacing.xs },
  pageLayout: { gap: Spacing.xl, alignItems: 'stretch' },
  heroCard: { flex: 1, minWidth: 0, gap: Spacing.lg },
  heroCopy: { gap: Spacing.sm },
  heroVisual: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.sm },
  authCard: { flex: 1.12, minWidth: 0, gap: Spacing.xl },
  controlPanel: { borderRadius: Radius.lg, gap: Spacing.lg, padding: Spacing.lg },
  controlGroup: { gap: Spacing.sm },
  row: { flexWrap: 'wrap', gap: Spacing.sm },
  form: { gap: Spacing.lg },
  field: { gap: Spacing.sm },
  ltrInput: { textAlign: 'left', writingDirection: 'ltr' },
  messagePanel: { borderRadius: Radius.md, padding: Spacing.md },
  privacyPanel: { alignItems: 'flex-start', borderRadius: Radius.lg, gap: Spacing.md, padding: Spacing.md },
  privacyCopy: { flex: 1, minWidth: 0, gap: Spacing.xs },
  iconBadge: {
    alignItems: 'center',
    borderRadius: Radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});
