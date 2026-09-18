import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useSpiritualGroundingPreference } from '@/application/spiritual-grounding';
import { ChoiceChip, MizanText, PrimaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Spacing } from '@/constants/theme';
import {
  BaselineTargetRating,
  DomainBaselineTargets,
  loadDomainBaselineTargets,
  saveDomainBaselineTargets,
} from '@/infrastructure/supabase/baseline-targets';
import {
  DomainId,
  LifeSeason,
  PersonalValue,
  PrivacyMode,
  useAppState,
} from '@/state/app-state';

const domainOrder: readonly DomainId[] = ['recovery', 'connection', 'work', 'margin'];
const seasonOrder: readonly LifeSeason[] = ['balanced', 'build', 'recovery', 'parenting', 'study', 'travel'];
const valueOrder: readonly PersonalValue[] = ['stability', 'family', 'growth', 'meaning'];
const privacyOrder: readonly PrivacyMode[] = ['minimal', 'balanced'];
const baselineLevels: readonly BaselineTargetRating[] = [1, 2, 3, 4, 5];

type BaselineStatus = 'idle' | 'loading' | 'error';

const copy = {
  ar: {
    focusTitle: 'ما المجال الذي يحتاج مساحة أكبر الآن؟',
    seasonTitle: 'ما الموسم الذي تعيشه الآن؟',
    valuesTitle: 'ما القيم التي تريد أن يحميها ميزان؟',
    privacyTitle: 'كيف تريد أن يبدأ التتبع؟',
    baselineTitle: 'ما المستوى الكافي والمستدام لكل مجال؟',
    baselineBody: 'اختياري. استخدم نفس مقياس التحقق اليومي من 1 إلى 5. أي مجال تتركه غير محدد سيبقى مجهول الهدف ولن يضع ميزان قيمة بدلًا منك.',
    baselineUnset: 'غير محدد',
    baselineError: 'تعذر حفظ مستوياتك المستهدفة الآن. حاول مرة أخرى عند توفر الاتصال.',
    spiritualTitle: 'هل تريد تفعيل مساحة السكينة والمعنى؟',
    spiritualBody: 'اختياري بالكامل. يتابع فقط الممارسات التي تختارها أنت لاحقًا، ولا يحسب أي درجة للإيمان أو القيمة.',
    spiritualEnable: 'نعم، فعّلها',
    spiritualDisable: 'ليس الآن',
    spiritualError: 'تعذر حفظ اختيار السكينة والمعنى الآن. حاول مرة أخرى عند توفر الاتصال.',
    requirement: 'اختر مجال تركيز، وموسمًا، وقيمة واحدة على الأقل، وطريقة الخصوصية، وحدد اختيارك لمساحة السكينة والمعنى للمتابعة.',
    seasons: {
      balanced: 'مرحلة متوازنة',
      build: 'بناء أو مشروع مكثف',
      recovery: 'تعافٍ واستعادة',
      parenting: 'تربية وأسرة',
      study: 'دراسة أو اختبارات',
      travel: 'سفر أو انتقال',
    },
    values: {
      stability: 'الاستقرار',
      family: 'الأسرة',
      growth: 'النمو',
      meaning: 'المعنى',
    },
    privacy: {
      minimal: 'الحد الأدنى — أسجل فقط ما أختاره صراحةً',
      balanced: 'متوازن — اسمح بالمزايا التي أفعّلها لاحقًا',
    },
  },
  en: {
    focusTitle: 'Which area deserves more space right now?',
    seasonTitle: 'What season are you in right now?',
    valuesTitle: 'Which values should MIZAN help protect?',
    privacyTitle: 'How should tracking begin?',
    baselineTitle: 'What level feels sustainably good enough for each area?',
    baselineBody: 'Optional. Use the same 1–5 scale as the daily check-in. Any area you leave unset stays unknown; MIZAN will not invent a target for you.',
    baselineUnset: 'Not set',
    baselineError: 'MIZAN could not save your baseline targets right now. Try again when the connection is available.',
    spiritualTitle: 'Enable Spiritual Grounding?',
    spiritualBody: 'Entirely optional. It only tracks practices you explicitly choose later and never creates a faith or worth score.',
    spiritualEnable: 'Yes, enable it',
    spiritualDisable: 'Not now',
    spiritualError: 'MIZAN could not save this preference right now. Try again when the connection is available.',
    requirement: 'Choose a focus area, a season, at least one value, a privacy mode, and your Spiritual Grounding preference to continue.',
    seasons: {
      balanced: 'Balanced season',
      build: 'Building or intense work',
      recovery: 'Recovery',
      parenting: 'Parenting & family',
      study: 'Study or exams',
      travel: 'Travel or transition',
    },
    values: {
      stability: 'Stability',
      family: 'Family',
      growth: 'Growth',
      meaning: 'Meaning',
    },
    privacy: {
      minimal: 'Minimal — only what I explicitly choose',
      balanced: 'Balanced — allow features I enable later',
    },
  },
} as const;

export default function OnboardingScreen() {
  const {
    completeOnboarding,
    enabledDomains,
    focusDomain,
    isRtl,
    lifeSeason,
    locale,
    personalValues,
    privacyMode,
    setFocusDomain,
    setLifeSeason,
    setLocale,
    setPrivacyMode,
    syncStatus,
    t,
    toggleDomain,
    togglePersonalValue,
    userId,
  } = useAppState();
  const {
    choice: spiritualGroundingEnabled,
    persistChoice: persistSpiritualGroundingChoice,
    setChoice: setSpiritualGroundingChoice,
    status: spiritualStatus,
  } = useSpiritualGroundingPreference(userId);
  const [baselineTargets, setBaselineTargets] = useState<DomainBaselineTargets>({});
  const [baselineStatus, setBaselineStatus] = useState<BaselineStatus>('idle');
  const [saving, setSaving] = useState(false);
  const syncMessage = syncStatus === 'offline' ? t('syncOffline') : syncStatus === 'error' ? t('syncError') : null;
  const labels = copy[locale];
  const canFinish =
    focusDomain !== null &&
    lifeSeason !== null &&
    personalValues.length > 0 &&
    privacyMode !== null &&
    spiritualGroundingEnabled !== null;

  useEffect(() => {
    let active = true;
    void (async () => {
      await Promise.resolve();
      if (!active) return;
      if (!userId) {
        setBaselineTargets({});
        setBaselineStatus('idle');
        return;
      }

      setBaselineStatus('loading');
      const result = await loadDomainBaselineTargets(userId);
      if (!active) return;
      if (result.ok) {
        setBaselineTargets(result.value);
        setBaselineStatus('idle');
      } else {
        setBaselineStatus('error');
      }
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  const setBaselineTarget = (domainId: DomainId, rating: BaselineTargetRating | null) => {
    setBaselineTargets((current) => {
      const next = { ...current };
      if (rating === null) delete next[domainId];
      else next[domainId] = rating;
      return next;
    });
    if (baselineStatus === 'error') setBaselineStatus('idle');
  };

  const finish = async () => {
    if (saving || !canFinish || spiritualGroundingEnabled === null || !userId) return;
    setSaving(true);
    setBaselineStatus('loading');
    const baselineSaved = await saveDomainBaselineTargets(userId, enabledDomains, baselineTargets);
    if (!baselineSaved.ok) {
      setBaselineStatus('error');
      setSaving(false);
      return;
    }
    setBaselineStatus('idle');

    const spiritualSaved = await persistSpiritualGroundingChoice(spiritualGroundingEnabled);
    if (!spiritualSaved) {
      setSaving(false);
      return;
    }
    await completeOnboarding();
    setSaving(false);
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

      <View style={styles.section}>
        <MizanText variant="title">{labels.focusTitle}</MizanText>
        <View style={styles.domainList}>
          {domainOrder.filter((domainId) => enabledDomains.includes(domainId)).map((domainId) => (
            <ChoiceChip
              key={domainId}
              label={t(domainId)}
              selected={focusDomain === domainId}
              onPress={() => setFocusDomain(domainId)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{labels.seasonTitle}</MizanText>
        <View style={styles.domainList}>
          {seasonOrder.map((season) => (
            <ChoiceChip
              key={season}
              label={labels.seasons[season]}
              selected={lifeSeason === season}
              onPress={() => setLifeSeason(season)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{labels.baselineTitle}</MizanText>
        <MizanText muted>{labels.baselineBody}</MizanText>
        <View style={styles.domainList}>
          {domainOrder.filter((domainId) => enabledDomains.includes(domainId)).map((domainId) => (
            <View key={domainId} style={styles.targetGroup}>
              <MizanText variant="label">{t(domainId)}</MizanText>
              <View style={[styles.wrap, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <ChoiceChip
                  label={labels.baselineUnset}
                  selected={baselineTargets[domainId] === undefined}
                  onPress={() => setBaselineTarget(domainId, null)}
                />
                {baselineLevels.map((level) => (
                  <ChoiceChip
                    key={level}
                    label={String(level)}
                    selected={baselineTargets[domainId] === level}
                    onPress={() => setBaselineTarget(domainId, level)}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{labels.valuesTitle}</MizanText>
        <View style={[styles.wrap, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          {valueOrder.map((value) => (
            <ChoiceChip
              key={value}
              label={labels.values[value]}
              selected={personalValues.includes(value)}
              onPress={() => togglePersonalValue(value)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{labels.privacyTitle}</MizanText>
        <View style={styles.domainList}>
          {privacyOrder.map((mode) => (
            <ChoiceChip
              key={mode}
              label={labels.privacy[mode]}
              selected={privacyMode === mode}
              onPress={() => setPrivacyMode(mode)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{labels.spiritualTitle}</MizanText>
        <MizanText muted>{labels.spiritualBody}</MizanText>
        <View style={styles.domainList}>
          <ChoiceChip
            label={labels.spiritualEnable}
            selected={spiritualGroundingEnabled === true}
            onPress={() => setSpiritualGroundingChoice(true)}
          />
          <ChoiceChip
            label={labels.spiritualDisable}
            selected={spiritualGroundingEnabled === false}
            onPress={() => setSpiritualGroundingChoice(false)}
          />
        </View>
      </View>

      {!canFinish ? <MizanText muted>{labels.requirement}</MizanText> : null}
      {baselineStatus === 'error' ? <MizanText muted>{labels.baselineError}</MizanText> : null}
      {spiritualStatus === 'error' ? <MizanText muted>{labels.spiritualError}</MizanText> : null}
      {syncMessage ? <MizanText muted>{syncMessage}</MizanText> : null}

      <View style={styles.footer}>
        <PrimaryButton
          label={saving ? t('saving') : t('continue')}
          onPress={() => void finish()}
          disabled={
            saving ||
            baselineStatus === 'loading' ||
            spiritualStatus === 'loading' ||
            !canFinish ||
            !userId
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.md, paddingTop: Spacing.xl },
  section: { gap: Spacing.lg },
  wrap: { flexWrap: 'wrap', gap: Spacing.sm },
  domainList: { gap: Spacing.sm, alignItems: 'stretch' },
  targetGroup: { gap: Spacing.sm },
  footer: { marginTop: 'auto', paddingTop: Spacing.xl },
});
