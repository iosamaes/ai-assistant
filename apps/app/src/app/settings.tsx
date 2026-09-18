import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useSpiritualGroundingPreference } from '@/application/spiritual-grounding';
import { ChoiceChip, MizanText, PrimaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Spacing } from '@/constants/theme';
import { signOut } from '@/infrastructure/supabase/auth';
import { useAppState } from '@/state/app-state';

const spiritualCopy = {
  ar: {
    title: 'السكينة والمعنى',
    body: 'مساحة اختيارية بالكامل. يمكنك تفعيلها أو إيقافها في أي وقت، ولا ينتج عنها أي تقييم للإيمان أو القيمة.',
    enable: 'مفعّلة',
    disable: 'متوقفة',
    error: 'تعذر حفظ هذا الاختيار الآن.',
  },
  en: {
    title: 'Spiritual Grounding',
    body: 'Entirely optional. You can enable or remove it at any time, and it never produces a faith or worth score.',
    enable: 'Enabled',
    disable: 'Off',
    error: 'MIZAN could not save this preference right now.',
  },
} as const;

const insightCopy = {
  ar: {
    lifeMapTitle: 'خريطة الحياة',
    lifeMapBody: 'راجع تاريخ المجالات والأدلة المتاحة بدون تحويل البيانات الناقصة إلى درجات.',
    lifeMapOpen: 'فتح خريطة الحياة',
    whyTitle: 'لماذا قد أشعر أنني لست على ما يرام؟',
    whyBody: 'راجع العوامل المحتملة المدعومة بأدلتك الحالية مع توضيح الثقة، من دون ادعاء السببية أو التشخيص.',
    whyOpen: 'فتح WHY',
    insightsTitle: 'الرؤى والأنماط',
    insightsBody: 'راجع الارتباطات الشخصية التي تكررت في ملاحظاتك المقترنة، مع عدد العينات والثقة ونافذة الأدلة.',
    insightsOpen: 'فتح الرؤى',
  },
  en: {
    lifeMapTitle: 'Life map',
    lifeMapBody: 'Review domain history and available evidence without turning missing data into scores.',
    lifeMapOpen: 'Open Life map',
    whyTitle: 'Why might I feel off?',
    whyBody: 'Review candidate factors supported by your current evidence with confidence, without causal or diagnostic claims.',
    whyOpen: 'Open WHY',
    insightsTitle: 'Insights and patterns',
    insightsBody: 'Review recurring personal associations from paired observations with sample count, confidence, and evidence window.',
    insightsOpen: 'Open insights',
  },
} as const;

export default function SettingsScreen() {
  const {
    enabledDomains,
    isRtl,
    locale,
    refreshSession,
    resetOnboarding,
    setLocale,
    syncStatus,
    t,
    userId,
  } = useAppState();
  const {
    choice: spiritualGroundingEnabled,
    persistChoice: persistSpiritualGroundingChoice,
    status: spiritualStatus,
  } = useSpiritualGroundingPreference(userId);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const syncMessage = syncStatus === 'offline' ? t('syncOffline') : syncStatus === 'error' ? t('syncError') : null;
  const spiritualLabels = spiritualCopy[locale];
  const insightLabels = insightCopy[locale];

  const editPriorities = async () => {
    if (busy) return;
    setBusy(true);
    await resetOnboarding();
    setBusy(false);
    router.replace('/onboarding');
  };

  const changeSpiritualGrounding = async (next: boolean) => {
    if (busy || spiritualStatus === 'loading' || spiritualStatus === 'saving') return;
    setMessage(null);
    const saved = await persistSpiritualGroundingChoice(next);
    if (!saved) setMessage(spiritualLabels.error);
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

      <View style={styles.section}>
        <MizanText variant="title">{insightLabels.lifeMapTitle}</MizanText>
        <MizanText muted>{insightLabels.lifeMapBody}</MizanText>
        <PrimaryButton label={insightLabels.lifeMapOpen} onPress={() => router.push('/life-map')} />
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{insightLabels.whyTitle}</MizanText>
        <MizanText muted>{insightLabels.whyBody}</MizanText>
        <PrimaryButton label={insightLabels.whyOpen} onPress={() => router.push('/why')} />
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{insightLabels.insightsTitle}</MizanText>
        <MizanText muted>{insightLabels.insightsBody}</MizanText>
        <PrimaryButton label={insightLabels.insightsOpen} onPress={() => router.push('/insights')} />
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{spiritualLabels.title}</MizanText>
        <MizanText muted>{spiritualLabels.body}</MizanText>
        <View style={[styles.row, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <ChoiceChip
            label={spiritualLabels.enable}
            selected={spiritualGroundingEnabled === true}
            onPress={() => void changeSpiritualGrounding(true)}
          />
          <ChoiceChip
            label={spiritualLabels.disable}
            selected={spiritualGroundingEnabled === false}
            onPress={() => void changeSpiritualGrounding(false)}
          />
        </View>
      </View>

      {syncMessage ? <MizanText muted>{syncMessage}</MizanText> : null}
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
