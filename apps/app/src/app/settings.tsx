import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ChoiceChip, MizanText, PrimaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Spacing } from '@/constants/theme';
import { useAppState } from '@/state/app-state';

export default function SettingsScreen() {
  const { enabledDomains, isRtl, locale, resetOnboarding, setLocale, t } = useAppState();

  const editPriorities = () => {
    resetOnboarding();
    router.replace('/onboarding');
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

      <View style={styles.actions}>
        <PrimaryButton label={t('resetOnboarding')} onPress={editPriorities} />
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
