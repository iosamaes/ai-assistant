import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import { useSpiritualGroundingPreference } from '@/application/spiritual-grounding';
import { BrandedIllustration } from '@/components/branded-illustration';
import { Card, ChoiceChip, MizanText, PrimaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Controls, Palette, Radius, Spacing } from '@/constants/theme';
import { formatLocalizedNumber } from '@/i18n/number-input';
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
    brand: 'MIZAN',
    heroTitle: 'ابنِ ميزانًا يبدأ من أولوياتك أنت',
    heroBody: 'هذه التهيئة القصيرة تعطي ميزان سياقًا شخصيًا قبل أول يوم: ما الذي يهم الآن، وما الذي تريد حمايته، وما البيانات التي تسمح بها.',
    foundationTitle: 'الأساس',
    foundationBody: 'اختر لغة التجربة والمجالات التي تريد أن تكون حاضرة في ميزانك اليومي. يمكنك تعديلها لاحقًا.',
    domainMinimum: 'يجب إبقاء مجال واحد على الأقل مفعّلًا حتى يظل ميزان قابلًا للاستخدام.',
    prioritiesTitle: 'السياق والأولويات',
    prioritiesBody: 'أخبر ميزان أين تضع تركيزك الآن بدل افتراض أن كل مجالات الحياة يجب أن تتساوى.',
    safeguardsTitle: 'حدودك أولًا',
    safeguardsBody: 'أنت تحدد مستوى الخصوصية وما إذا كانت مساحة السكينة والمعنى مناسبة لك. هذه الاختيارات قابلة للتغيير لاحقًا.',
    domainsSelected: 'مجالات مفعّلة',
    valuesSelected: 'قيم مختارة',
    targetsSet: 'أهداف محددة',
    readyTitle: 'جاهز لبداية شخصية',
    readyBody: 'سيستخدم ميزان هذه الاختيارات كبداية قابلة للتعديل، وليس كحكم ثابت عليك.',
    pendingTitle: 'أكمل الاختيارات الأساسية',
    loadingPreferences: 'جارٍ تجهيز اختياراتك المحفوظة…',
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
    brand: 'MIZAN',
    heroTitle: 'Build a MIZAN that starts with your priorities',
    heroBody: 'This short setup gives MIZAN personal context before day one: what matters now, what you want protected, and what data you allow.',
    foundationTitle: 'Foundation',
    foundationBody: 'Choose the experience language and the areas you want present in your daily MIZAN. You can change them later.',
    domainMinimum: 'At least one area must stay enabled so MIZAN remains usable.',
    prioritiesTitle: 'Context and priorities',
    prioritiesBody: 'Tell MIZAN where your attention belongs right now instead of assuming every life area should be equal.',
    safeguardsTitle: 'Your boundaries first',
    safeguardsBody: 'You choose the privacy level and whether Spiritual Grounding belongs in your experience. These choices remain editable later.',
    domainsSelected: 'Areas enabled',
    valuesSelected: 'Values selected',
    targetsSet: 'Targets set',
    readyTitle: 'Ready for a personal start',
    readyBody: 'MIZAN will use these choices as an editable starting point, not a permanent judgment about you.',
    pendingTitle: 'Complete the essential choices',
    loadingPreferences: 'Preparing your saved preferences…',
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
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const {
    choice: spiritualGroundingEnabled,
    persistChoice: persistSpiritualGroundingChoice,
    setChoice: setSpiritualGroundingChoice,
    status: spiritualStatus,
  } = useSpiritualGroundingPreference(userId);
  const [baselineTargets, setBaselineTargets] = useState<DomainBaselineTargets>({});
  const [baselineStatus, setBaselineStatus] = useState<BaselineStatus>('idle');
  const [saving, setSaving] = useState(false);
  const activeUserRef = useRef(userId);
  const syncMessage = syncStatus === 'offline' ? t('syncOffline') : syncStatus === 'error' ? t('syncError') : null;
  const labels = copy[locale];
  const baselineChoicesLocked = saving || baselineStatus === 'loading';
  const spiritualChoicesLocked = saving || spiritualStatus === 'loading';
  const targetCount = Object.keys(baselineTargets).length;
  const preferencesLoading = baselineStatus === 'loading' || spiritualStatus === 'loading';
  const canFinish =
    focusDomain !== null &&
    lifeSeason !== null &&
    personalValues.length > 0 &&
    privacyMode !== null &&
    spiritualGroundingEnabled !== null;

  useEffect(() => {
    activeUserRef.current = userId;
    let active = true;
    void (async () => {
      await Promise.resolve();
      if (!active) return;
      setSaving(false);
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
    if (baselineChoicesLocked) return;
    setBaselineTargets((current) => {
      const next = { ...current };
      if (rating === null) delete next[domainId];
      else next[domainId] = rating;
      return next;
    });
    if (baselineStatus === 'error') setBaselineStatus('idle');
  };

  const finish = async () => {
    if (
      saving ||
      baselineStatus === 'loading' ||
      spiritualStatus === 'loading' ||
      !canFinish ||
      spiritualGroundingEnabled === null ||
      !userId
    ) return;
    const targetUserId = userId;
    setSaving(true);
    setBaselineStatus('loading');
    const baselineSaved = await saveDomainBaselineTargets(targetUserId, enabledDomains, baselineTargets);
    if (activeUserRef.current !== targetUserId) return;
    if (!baselineSaved.ok) {
      setBaselineStatus('error');
      setSaving(false);
      return;
    }
    setBaselineStatus('idle');

    const spiritualSaved = await persistSpiritualGroundingChoice(spiritualGroundingEnabled);
    if (activeUserRef.current !== targetUserId) return;
    if (!spiritualSaved) {
      setSaving(false);
      return;
    }
    await completeOnboarding();
    if (activeUserRef.current !== targetUserId) return;
    setSaving(false);
    router.replace('/today');
  };

  return (
    <Screen>
      <View style={styles.heading}>
        <MizanText variant="label" muted>{t('onboardingEyebrow')}</MizanText>
        <MizanText variant="display">{t('onboardingTitle')}</MizanText>
      </View>

      <Card style={[styles.heroCard, { backgroundColor: palette.accentSoft, borderColor: palette.accent }]}>
        <View style={[styles.heroLayout, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={styles.heroCopy}>
            <MizanText variant="label" style={{ color: palette.accent }}>{labels.brand}</MizanText>
            <MizanText variant="title">{labels.heroTitle}</MizanText>
            <MizanText>{t('onboardingBody')}</MizanText>
            <MizanText variant="caption" muted>{labels.heroBody}</MizanText>
          </View>
          <View style={styles.heroVisual}>
            <BrandedIllustration variant="welcome" size={174} />
          </View>
        </View>
        <View style={[styles.summaryRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={[styles.summaryTile, { backgroundColor: palette.surface }]}>
            <MizanText variant="title">{formatLocalizedNumber(enabledDomains.length, locale, 0)}</MizanText>
            <MizanText variant="caption" muted>{labels.domainsSelected}</MizanText>
          </View>
          <View style={[styles.summaryTile, { backgroundColor: palette.surface }]}>
            <MizanText variant="title">{formatLocalizedNumber(personalValues.length, locale, 0)}</MizanText>
            <MizanText variant="caption" muted>{labels.valuesSelected}</MizanText>
          </View>
          <View style={[styles.summaryTile, { backgroundColor: palette.surface }]}>
            <MizanText variant="title">{formatLocalizedNumber(targetCount, locale, 0)}</MizanText>
            <MizanText variant="caption" muted>{labels.targetsSet}</MizanText>
          </View>
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MizanText variant="title">{labels.foundationTitle}</MizanText>
          <MizanText muted>{labels.foundationBody}</MizanText>
        </View>

        <View style={styles.controlGroup}>
          <MizanText variant="label" muted>{t('language')}</MizanText>
          <View style={[styles.wrap, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <ChoiceChip label={t('arabic')} selected={locale === 'ar'} onPress={() => setLocale('ar')} disabled={saving} />
            <ChoiceChip label={t('english')} selected={locale === 'en'} onPress={() => setLocale('en')} disabled={saving} />
          </View>
        </View>

        <View style={styles.controlGroup}>
          <MizanText variant="label" muted>{t('domains')}</MizanText>
          <View style={[styles.wrap, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            {domainOrder.map((domainId) => {
              const selected = enabledDomains.includes(domainId);
              const isLastEnabled = selected && enabledDomains.length === 1;
              return (
                <ChoiceChip
                  key={domainId}
                  accessibilityLabel={isLastEnabled ? `${t(domainId)}. ${labels.domainMinimum}` : t(domainId)}
                  label={t(domainId)}
                  selected={selected}
                  onPress={() => toggleDomain(domainId)}
                  disabled={saving || isLastEnabled}
                />
              );
            })}
          </View>
          <MizanText variant="caption" muted>{labels.domainMinimum}</MizanText>
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MizanText variant="title">{labels.prioritiesTitle}</MizanText>
          <MizanText muted>{labels.prioritiesBody}</MizanText>
        </View>

        <View style={styles.controlGroup}>
          <MizanText variant="label">{labels.focusTitle}</MizanText>
          <View style={[styles.wrap, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            {domainOrder.filter((domainId) => enabledDomains.includes(domainId)).map((domainId) => (
              <ChoiceChip
                key={domainId}
                label={t(domainId)}
                selected={focusDomain === domainId}
                onPress={() => setFocusDomain(domainId)}
                disabled={saving}
              />
            ))}
          </View>
        </View>

        <View style={styles.controlGroup}>
          <MizanText variant="label">{labels.seasonTitle}</MizanText>
          <View style={[styles.wrap, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            {seasonOrder.map((season) => (
              <ChoiceChip
                key={season}
                label={labels.seasons[season]}
                selected={lifeSeason === season}
                onPress={() => setLifeSeason(season)}
                disabled={saving}
              />
            ))}
          </View>
        </View>

        <View style={styles.controlGroup}>
          <MizanText variant="label">{labels.valuesTitle}</MizanText>
          <View style={[styles.wrap, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            {valueOrder.map((value) => (
              <ChoiceChip
                key={value}
                label={labels.values[value]}
                selected={personalValues.includes(value)}
                onPress={() => togglePersonalValue(value)}
                disabled={saving}
              />
            ))}
          </View>
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MizanText variant="title">{labels.baselineTitle}</MizanText>
          <MizanText muted>{labels.baselineBody}</MizanText>
        </View>
        <View style={[styles.baselineGrid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          {domainOrder.filter((domainId) => enabledDomains.includes(domainId)).map((domainId) => (
            <View
              key={domainId}
              style={[
                styles.targetGroup,
                { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
              ]}>
              <MizanText variant="label">{t(domainId)}</MizanText>
              <View style={[styles.wrap, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <ChoiceChip
                  label={labels.baselineUnset}
                  selected={baselineTargets[domainId] === undefined}
                  onPress={() => setBaselineTarget(domainId, null)}
                  disabled={baselineChoicesLocked}
                />
                {baselineLevels.map((level) => (
                  <ChoiceChip
                    key={level}
                    label={formatLocalizedNumber(level, locale, 0)}
                    selected={baselineTargets[domainId] === level}
                    onPress={() => setBaselineTarget(domainId, level)}
                    disabled={baselineChoicesLocked}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MizanText variant="title">{labels.safeguardsTitle}</MizanText>
          <MizanText muted>{labels.safeguardsBody}</MizanText>
        </View>

        <View style={[styles.safeguardGrid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={styles.safeguardGroup}>
            <MizanText variant="label">{labels.privacyTitle}</MizanText>
            <View style={styles.choiceStack}>
              {privacyOrder.map((mode) => (
                <ChoiceChip
                  key={mode}
                  label={labels.privacy[mode]}
                  selected={privacyMode === mode}
                  onPress={() => setPrivacyMode(mode)}
                  disabled={saving}
                />
              ))}
            </View>
          </View>

          <View style={styles.safeguardGroup}>
            <MizanText variant="label">{labels.spiritualTitle}</MizanText>
            <MizanText variant="caption" muted>{labels.spiritualBody}</MizanText>
            <View style={styles.choiceStack}>
              <ChoiceChip
                label={labels.spiritualEnable}
                selected={spiritualGroundingEnabled === true}
                onPress={() => setSpiritualGroundingChoice(true)}
                disabled={spiritualChoicesLocked}
              />
              <ChoiceChip
                label={labels.spiritualDisable}
                selected={spiritualGroundingEnabled === false}
                onPress={() => setSpiritualGroundingChoice(false)}
                disabled={spiritualChoicesLocked}
              />
            </View>
          </View>
        </View>
      </Card>

      {!canFinish || preferencesLoading || baselineStatus === 'error' || spiritualStatus === 'error' || syncMessage ? (
        <View style={[styles.statusPanel, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}>
          {!canFinish ? <MizanText variant="label">{labels.pendingTitle}</MizanText> : null}
          {!canFinish ? <MizanText muted>{labels.requirement}</MizanText> : null}
          {preferencesLoading && !saving ? (
            <MizanText accessibilityLiveRegion="polite" muted>{labels.loadingPreferences}</MizanText>
          ) : null}
          {baselineStatus === 'error' ? (
            <MizanText accessibilityLiveRegion="polite" muted>{labels.baselineError}</MizanText>
          ) : null}
          {spiritualStatus === 'error' ? (
            <MizanText accessibilityLiveRegion="polite" muted>{labels.spiritualError}</MizanText>
          ) : null}
          {syncMessage ? <MizanText accessibilityLiveRegion="polite" muted>{syncMessage}</MizanText> : null}
        </View>
      ) : null}

      <Card style={[styles.readyCard, { borderColor: canFinish ? palette.accent : palette.border }]}>
        <View style={styles.sectionHeader}>
          <MizanText variant="title">{labels.readyTitle}</MizanText>
          <MizanText muted>{labels.readyBody}</MizanText>
        </View>
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
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { gap: Spacing.xs },
  heroCard: { gap: Spacing.xl },
  heroLayout: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  heroCopy: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 360,
    minWidth: 0,
    gap: Spacing.sm,
  },
  heroVisual: {
    flexGrow: 0,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRow: { flexWrap: 'wrap', gap: Spacing.md },
  summaryTile: {
    flexGrow: 1,
    flexBasis: 160,
    minWidth: 0,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  sectionCard: { gap: Spacing.xl },
  sectionHeader: { gap: Spacing.xs },
  controlGroup: { gap: Spacing.sm },
  wrap: { flexWrap: 'wrap', gap: Spacing.sm },
  baselineGrid: { flexWrap: 'wrap', gap: Spacing.md },
  targetGroup: {
    flexGrow: 1,
    flexBasis: 280,
    minWidth: 0,
    borderWidth: Controls.borderWidth,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  safeguardGrid: { flexWrap: 'wrap', gap: Spacing.xl },
  safeguardGroup: { flexGrow: 1, flexBasis: 300, minWidth: 0, gap: Spacing.md },
  choiceStack: { gap: Spacing.sm },
  statusPanel: {
    borderWidth: Controls.borderWidth,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  readyCard: { gap: Spacing.xl },
});