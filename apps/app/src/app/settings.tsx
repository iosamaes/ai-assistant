import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChoiceChip, MizanText, PrimaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Spacing } from '@/constants/theme';
import { signOut } from '@/infrastructure/supabase/auth';
import { useAppState } from '@/state/app-state';

export default function SettingsScreen() {
  const { enabledDomains, isRtl, locale, refreshSession, resetOnboarding, setLocale, t } = useAppState();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const editPriorities = async () => {
    if (busy) return;
    setBusy(true);
    await resetOnboarding();
    setBusy(false);
    router.replace('/onboarding');
  };

  const logout = async () => {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    const result = await signOut();
    if (!result.ok) {
      setMessage(t('authErrorGeneric'));
      setBusy(false);
      return;
    }
    await refreshSession();
    setBusy(false);
    router.replace('/auth');
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <MizanText variant="label" muted>{t('appName')}</MizanText>
        <MizanText variant="display">{t('settingsTitle')}</MizanText>
        <MizanText muted>{t('settingsBody')}</MizanText>
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{t('language')}</MizanText>
        <View style={[styles.row, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <ChoiceChip label={t('arabic')} selected={locale === 'ar'} onPress={() => setLocale('ar')} />
          <ChoiceChip label={t('english')} selected={locale === 'en'} onPress={() => setLocale('en')} />
        </View>
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{t('priorities')}</MizanText>
        <MizanText muted>{enabledDomains.map((domainId) => t(domainId)).join(' · ')}</MizanText>
      </View>

      {message ? <MizanText muted>{message}</MizanText> : null}

      <View style={styles.actions}>
        <PrimaryButton label={busy ? t('saving') : t('resetOnboarding')} onPress={() => void editPriorities()} disabled={busy} />
        <PrimaryButton label={t('signOut')} onPress={() => void logout()} disabled={busy} />
        <MizanText
          variant="label"
          style={styles.backLink}
          onPress={() => router.replace('/today')}>
          {t('backToday')}
        </MizanText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.md, paddingTop: Spacing.xl },
  section: { gap: Spacing.lg },
  row: { flexWrap: 'wrap', gap: Spacing.sm },
  actions: { marginTop: 'auto', gap: Spacing.lg, paddingTop: Spacing.xl },
  backLink: { textAlign: 'center', paddingVertical: Spacing.md },
});
