import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChoiceChip, MizanText, PrimaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Spacing } from '@/constants/theme';
import { DomainId, useAppState } from '@/state/app-state';

const domainOrder: readonly DomainId[] = ['recovery', 'connection', 'work', 'margin'];

export default function OnboardingScreen() {
  const { completeOnboarding, enabledDomains, isRtl, locale, setLocale, t, toggleDomain } = useAppState();
  const [saving, setSaving] = useState(false);

  const finish = async () => {
    if (saving) return;
    setSaving(true);
    await completeOnboarding();
    router.replace('/today');
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <MizanText variant="label" muted>{t('onboardingEyebrow')}</MizanText>
        <MizanText variant="display">{t('onboardingTitle')}</MizanText>
        <MizanText muted>{t('onboardingBody')}</MizanText>
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{t('language')}</MizanText>
        <View style={[styles.wrap, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <ChoiceChip label={t('arabic')} selected={locale === 'ar'} onPress={() => setLocale('ar')} />
          <ChoiceChip label={t('english')} selected={locale === 'en'} onPress={() => setLocale('en')} />
        </View>
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{t('domains')}</MizanText>
        <View style={styles.domainList}>
          {domainOrder.map((domainId) => (
            <ChoiceChip
              key={domainId}
              label={t(domainId)}
              selected={enabledDomains.includes(domainId)}
              onPress={() => toggleDomain(domainId)}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label={saving ? t('saving') : t('continue')} onPress={() => void finish()} disabled={saving} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.md, paddingTop: Spacing.xl },
  section: { gap: Spacing.lg },
  wrap: { flexWrap: 'wrap', gap: Spacing.sm },
  domainList: { gap: Spacing.sm, alignItems: 'stretch' },
  footer: { marginTop: 'auto', paddingTop: Spacing.xl },
});
