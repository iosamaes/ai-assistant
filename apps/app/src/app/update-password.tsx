import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import { Card, MizanText, MizanTextInput, PrimaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { updatePassword, type AuthFailureKind } from '@/infrastructure/supabase/auth';
import { useAppState } from '@/state/app-state';

const updatePasswordVisualCopy = {
  ar: {
    heroTitle: 'استعادة هادئة وآمنة',
    heroNote: 'رابط الاستعادة يثبت هويتك مؤقتًا فقط. اختر كلمة مرور جديدة لا تستخدمها في مكان آخر ولا تشاركها مع أي شخص.',
    formTitle: 'تعيين كلمة المرور',
    formBody: 'استخدم 8 أحرف على الأقل، ثم اكتب كلمة المرور نفسها مرة ثانية للتأكيد.',
    ready: 'كلمة المرور تستوفي المتطلبات والحقلان متطابقان.',
    sessionMissing: 'جلسة الاستعادة غير متاحة الآن. افتح رابط الاستعادة من بريدك الإلكتروني مرة أخرى للمتابعة بأمان.',
    nextStep: 'بعد الحفظ ستعود مباشرة إلى مساحتك في ميزان.',
  },
  en: {
    heroTitle: 'A calm, secure recovery step',
    heroNote: 'The recovery link verifies you temporarily. Choose a new password you do not reuse elsewhere and never share it with anyone.',
    formTitle: 'Set your password',
    formBody: 'Use at least 8 characters, then enter the same password again to confirm it.',
    ready: 'The password meets the requirements and both fields match.',
    sessionMissing: 'Your recovery session is not available right now. Open the recovery link from your email again to continue securely.',
    nextStep: 'After saving, you will return directly to your MIZAN space.',
  },
} as const;

export default function UpdatePasswordScreen() {
  const { locale, onboardingCompleted, sessionStatus, t } = useAppState();
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const labels = updatePasswordVisualCopy[locale];
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const passwordLongEnough = password.length >= 8;
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const canEdit = sessionStatus === 'signed-in' && !busy;
  const canSubmit = useMemo(
    () => sessionStatus === 'signed-in' && passwordLongEnough && passwordsMatch && !busy,
    [busy, passwordLongEnough, passwordsMatch, sessionStatus],
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
      <View style={styles.heading}>
        <MizanText variant="label" muted>{t('appName')}</MizanText>
        <MizanText variant="display">{t('updatePasswordTitle')}</MizanText>
      </View>

      <Card style={[styles.heroCard, { backgroundColor: palette.accentSoft, borderColor: palette.accent }]}>
        <MizanText variant="title">{labels.heroTitle}</MizanText>
        <MizanText>{t('updatePasswordBody')}</MizanText>
        <MizanText variant="caption" muted>{labels.heroNote}</MizanText>
      </Card>

      <Card style={styles.formCard}>
        <View style={styles.sectionHeading}>
          <MizanText variant="title">{labels.formTitle}</MizanText>
          <MizanText muted>{labels.formBody}</MizanText>
        </View>

        {sessionStatus !== 'signed-in' ? (
          <View style={[styles.messagePanel, styles.messagePanelBorder, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}>
            <MizanText accessibilityLiveRegion="polite">{labels.sessionMissing}</MizanText>
          </View>
        ) : null}

        <View style={styles.field}>
          <MizanText variant="label">{t('newPassword')}</MizanText>
          <MizanTextInput
            accessibilityLabel={t('newPassword')}
            autoCapitalize="none"
            autoComplete="new-password"
            autoCorrect={false}
            editable={canEdit}
            secureTextEntry
            textContentType="newPassword"
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.field}>
          <MizanText variant="label">{t('confirmPassword')}</MizanText>
          <MizanTextInput
            accessibilityLabel={t('confirmPassword')}
            autoCapitalize="none"
            autoComplete="new-password"
            autoCorrect={false}
            editable={canEdit}
            secureTextEntry
            textContentType="newPassword"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        {password.length > 0 && !passwordLongEnough ? (
          <View style={[styles.messagePanel, { backgroundColor: palette.surfaceMuted }]}>
            <MizanText accessibilityLiveRegion="polite" variant="caption" muted>{t('passwordMinimum')}</MizanText>
          </View>
        ) : null}
        {confirmPassword.length > 0 && !passwordsMatch ? (
          <View style={[styles.messagePanel, { backgroundColor: palette.surfaceMuted }]}>
            <MizanText accessibilityLiveRegion="polite" variant="caption" muted>{t('passwordMismatch')}</MizanText>
          </View>
        ) : null}
        {passwordLongEnough && passwordsMatch ? (
          <View style={[styles.messagePanel, styles.messagePanelBorder, { backgroundColor: palette.accentSoft, borderColor: palette.accent }]}>
            <MizanText accessibilityLiveRegion="polite" variant="caption">{labels.ready}</MizanText>
          </View>
        ) : null}
        {message ? (
          <View style={[styles.messagePanel, { backgroundColor: palette.surfaceMuted }]}>
            <MizanText accessibilityLiveRegion="polite">{message}</MizanText>
          </View>
        ) : null}

        <View style={styles.actionGroup}>
          <PrimaryButton
            label={busy ? t('authWorking') : t('savePassword')}
            onPress={() => void submit()}
            disabled={!canSubmit}
          />
          <MizanText variant="caption" muted>{labels.nextStep}</MizanText>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { gap: Spacing.xs },
  heroCard: { gap: Spacing.md },
  formCard: { gap: Spacing.xl },
  sectionHeading: { gap: Spacing.sm },
  field: { gap: Spacing.sm },
  messagePanel: { borderRadius: Radius.md, padding: Spacing.md },
  messagePanelBorder: { borderWidth: 1 },
  actionGroup: { gap: Spacing.md, paddingTop: Spacing.sm },
});
