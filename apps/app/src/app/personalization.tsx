import type { HumanStateVector, PersonalizationMaturity } from '@mizan/core';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import { loadCurrentHumanState } from '@/application/daily-intelligence';
import { AppIcon, type AppIconName } from '@/components/app-icon';
import { Card, MizanText, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Controls, Interaction, Palette, Radius, Spacing } from '@/constants/theme';
import { type DomainId, useAppState } from '@/state/app-state';

type LoadStatus = 'loading' | 'ready' | 'error';

const stageOrder: readonly PersonalizationMaturity[] = ['cold_start', 'learning', 'personalized'];
const domainOrder: readonly DomainId[] = ['recovery', 'connection', 'work', 'margin'];

function domainIcon(domainId: DomainId): AppIconName {
  if (domainId === 'recovery') return 'recovery';
  if (domainId === 'connection') return 'connection';
  if (domainId === 'work') return 'work';
  return 'margin';
}

const copy = {
  ar: {
    eyebrow: 'التخصيص',
    title: 'إلى أي مدى تعلّم ميزان عن نمطك؟',
    body: 'هذه ليست درجة لك. إنها توضح فقط مدى نضج الأدلة الشخصية التي يعتمد عليها ميزان، وقد تتراجع المرحلة إذا أصبحت البيانات قديمة أو قليلة.',
    areasTitle: 'المجالات التي تريدها في ميزانك',
    areasBody: 'فعّل فقط المجالات التي تريد أن تدخل في تجربتك اليومية. يمكنك تغييرها هنا بدون تحويل التخصيص إلى حكم ثابت عليك.',
    enabled: 'مفعّل',
    disabled: 'غير مفعّل',
    keepOne: 'يجب إبقاء مجال واحد على الأقل مفعّلًا.',
    loading: 'جارٍ قراءة حالة التخصيص…',
    error: 'تعذر قراءة حالة التخصيص الآن.',
    empty: 'لا توجد حالة تخصيص متاحة بعد. ابدأ بتسجيل فحص سريع ليبدأ ميزان في التعلّم.',
    current: 'المرحلة الحالية',
    progression: 'مراحل التعلّم',
    progressionBody: 'كل مرحلة تعني أن الأدلة أصبحت أكثر نضجًا، لا أن ميزان أصبح أكثر يقينًا بك كشخص.',
    coldStartTitle: 'بداية التعلّم',
    coldStartBody: 'الأدلة ما زالت محدودة، لذلك يتجنب ميزان ادعاء أن لديه خط أساس شخصيًا ثابتًا.',
    learningTitle: 'يتعلّم نمطك',
    learningBody: 'بدأت تظهر إشارات متكررة، لكن ميزان ما زال يعامل التخصيص على أنه غير ناضج ويعرض الثقة بوضوح.',
    personalizedTitle: 'تخصيص ناضج',
    personalizedBody: 'توجد أدلة حديثة كافية لاستخدام تقديرات شخصية أكثر، مع بقاء الثقة والبيانات الناقصة ظاهرة بدل إخفائها.',
    activeStage: 'المرحلة النشطة',
    futureStage: 'مرحلة لاحقة',
    pastStage: 'تم تجاوزها',
    note: 'كل استنتاج يظل مقيدًا بحداثة الأدلة وجودتها؛ الوصول إلى مرحلة التخصيص لا يعني اليقين ولا يحول البيانات الناقصة إلى أرقام.',
    back: 'العودة للإعدادات',
  },
  en: {
    eyebrow: 'Personalization',
    title: 'How much has MIZAN learned about your pattern?',
    body: 'This is not a score for you. It only describes how mature the personal evidence is, and the stage can move backward when evidence becomes old or sparse.',
    areasTitle: 'Areas you want in your MIZAN',
    areasBody: 'Enable only the areas you want in your daily experience. You can change them here without turning personalization into a fixed judgment about you.',
    enabled: 'Enabled',
    disabled: 'Disabled',
    keepOne: 'At least one area must stay enabled.',
    loading: 'Reading personalization maturity…',
    error: 'Personalization maturity could not be loaded right now.',
    empty: 'No personalization state is available yet. Start with a quick check-in so MIZAN can begin learning.',
    current: 'Current stage',
    progression: 'Learning stages',
    progressionBody: 'Each stage means the evidence is more mature, not that MIZAN is more certain about you as a person.',
    coldStartTitle: 'Starting to learn',
    coldStartBody: 'Evidence is still limited, so MIZAN avoids pretending it has a stable personal baseline.',
    learningTitle: 'Learning your pattern',
    learningBody: 'Repeated signals are beginning to form, but MIZAN still treats personalization as immature and keeps confidence explicit.',
    personalizedTitle: 'Mature personalization',
    personalizedBody: 'There is enough recent evidence to use more personal estimates, while confidence and missing data remain visible rather than hidden.',
    activeStage: 'Active stage',
    futureStage: 'Later stage',
    pastStage: 'Passed stage',
    note: 'Every inference still depends on evidence freshness and quality; reaching the personalized stage is not certainty and never turns missing data into numbers.',
    back: 'Back to settings',
  },
} as const;

function stageTitle(stage: PersonalizationMaturity, locale: 'ar' | 'en'): string {
  const labels = copy[locale];
  if (stage === 'cold_start') return labels.coldStartTitle;
  if (stage === 'learning') return labels.learningTitle;
  return labels.personalizedTitle;
}

function stageBody(stage: PersonalizationMaturity, locale: 'ar' | 'en'): string {
  const labels = copy[locale];
  if (stage === 'cold_start') return labels.coldStartBody;
  if (stage === 'learning') return labels.learningBody;
  return labels.personalizedBody;
}

export default function PersonalizationScreen() {
  const { enabledDomains, isRtl, locale, refreshSession, t, toggleDomain, userId } = useAppState();
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [state, setState] = useState<HumanStateVector | null>(null);
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const labels = copy[locale];

  useEffect(() => {
    let active = true;
    void (async () => {
      await Promise.resolve();
      if (!active) return;
      if (!userId) {
        setState(null);
        setStatus('ready');
        return;
      }

      setState(null);
      setStatus('loading');
      const result = await loadCurrentHumanState(userId);
      if (!active) return;
      if (!result.ok) {
        if (result.error.kind === 'session-expired') await refreshSession();
        if (active) setStatus('error');
        return;
      }
      setState(result.value);
      setStatus('ready');
    })();

    return () => {
      active = false;
    };
  }, [refreshSession, userId]);

  const currentStageIndex = state ? stageOrder.indexOf(state.maturity) : -1;

  return (
    <Screen>
      <View style={[styles.topRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        <View style={styles.heading}>
          <MizanText variant="label" muted>{labels.eyebrow}</MizanText>
          <MizanText variant="display">{labels.title}</MizanText>
        </View>
        <SecondaryButton compact label={labels.back} onPress={() => router.replace('/settings')} />
      </View>

      <Card style={[styles.heroCard, { backgroundColor: palette.accentSoft, borderColor: palette.accent }]}>
        <MizanText variant="title">{state ? stageTitle(state.maturity, locale) : labels.current}</MizanText>
        <MizanText>{labels.body}</MizanText>
        {status === 'ready' && state ? (
          <View style={[styles.currentPill, { backgroundColor: palette.surface, alignSelf: isRtl ? 'flex-end' : 'flex-start' }]}>
            <MizanText variant="caption">{labels.activeStage}</MizanText>
          </View>
        ) : null}
      </Card>

      <Card style={styles.areasCard}>
        <View style={styles.sectionHeader}>
          <MizanText variant="title">{labels.areasTitle}</MizanText>
          <MizanText muted>{labels.areasBody}</MizanText>
        </View>
        <View style={styles.areaList}>
          {domainOrder.map((domainId) => {
            const enabled = enabledDomains.includes(domainId);
            const isLastEnabled = enabled && enabledDomains.length === 1;
            return (
              <Pressable
                key={domainId}
                accessibilityRole="switch"
                accessibilityLabel={t(domainId)}
                accessibilityState={{ checked: enabled, disabled: isLastEnabled }}
                accessibilityHint={isLastEnabled ? labels.keepOne : undefined}
                disabled={isLastEnabled}
                onPress={() => toggleDomain(domainId)}
                style={({ pressed }) => [
                  styles.areaRow,
                  {
                    backgroundColor: enabled ? palette.accentSoft : palette.surfaceMuted,
                    borderColor: enabled ? palette.accent : palette.border,
                    flexDirection: isRtl ? 'row-reverse' : 'row',
                    opacity: pressed ? Interaction.subtlePressed : isLastEnabled ? Interaction.disabled : 1,
                  },
                ]}
              >
                <View style={[styles.areaIdentity, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.domainIcon, { backgroundColor: palette.surface }]}>
                    <AppIcon name={domainIcon(domainId)} color={enabled ? palette.accent : palette.textMuted} size={22} />
                  </View>
                  <View style={styles.flexibleText}>
                    <MizanText variant="label">{t(domainId)}</MizanText>
                    {isLastEnabled ? <MizanText variant="caption" muted>{labels.keepOne}</MizanText> : null}
                  </View>
                </View>
                <View style={[styles.statePill, { backgroundColor: palette.surface }]}>
                  <View style={[styles.stateDot, { backgroundColor: enabled ? palette.accent : palette.textMuted }]} />
                  <MizanText variant="caption">{enabled ? labels.enabled : labels.disabled}</MizanText>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {status === 'loading' ? (
        <Card style={{ backgroundColor: palette.surfaceMuted }}>
          <MizanText accessibilityLiveRegion="polite" muted>{labels.loading}</MizanText>
        </Card>
      ) : null}
      {status === 'error' ? (
        <Card style={{ backgroundColor: palette.surfaceMuted }}>
          <MizanText accessibilityLiveRegion="polite" muted>{labels.error}</MizanText>
        </Card>
      ) : null}
      {status === 'ready' && !state ? (
        <Card style={{ backgroundColor: palette.surfaceMuted }}>
          <MizanText accessibilityLiveRegion="polite" muted>{labels.empty}</MizanText>
        </Card>
      ) : null}

      {status === 'ready' && state ? (
        <>
          <View style={styles.sectionHeader}>
            <MizanText variant="title">{labels.progression}</MizanText>
            <MizanText muted>{labels.progressionBody}</MizanText>
          </View>

          <View style={[styles.progression, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            {stageOrder.map((stage, index) => {
              const active = stage === state.maturity;
              const passed = index < currentStageIndex;
              const stageStateLabel = active ? labels.activeStage : passed ? labels.pastStage : labels.futureStage;
              return (
                <Card
                  key={stage}
                  style={[
                    styles.stage,
                    {
                      borderColor: active ? palette.accent : palette.border,
                      backgroundColor: active ? palette.accentSoft : palette.surface,
                    },
                  ]}>
                  <View style={[styles.stageHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <MizanText variant="title" style={styles.flexibleText}>{stageTitle(stage, locale)}</MizanText>
                    <View style={[styles.stagePill, { backgroundColor: palette.surfaceMuted }]}>
                      <MizanText variant="caption">{stageStateLabel}</MizanText>
                    </View>
                  </View>
                  <MizanText muted>{stageBody(stage, locale)}</MizanText>
                </Card>
              );
            })}
          </View>

          <Card style={{ backgroundColor: palette.surfaceMuted }}>
            <MizanText variant="caption" muted>{labels.note}</MizanText>
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.lg, flexWrap: 'wrap' },
  heading: { flex: 1, minWidth: 0, gap: Spacing.xs },
  heroCard: { gap: Spacing.md },
  currentPill: { borderRadius: Radius.pill, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, maxWidth: '100%' },
  areasCard: { gap: Spacing.lg },
  areaList: { gap: Spacing.sm },
  areaRow: {
    minHeight: 70,
    borderWidth: Controls.borderWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  areaIdentity: { flex: 1, minWidth: 0, alignItems: 'center', gap: Spacing.md },
  domainIcon: { width: 42, height: 42, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statePill: { minHeight: 34, borderRadius: Radius.pill, paddingHorizontal: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  stateDot: { width: 8, height: 8, borderRadius: Radius.pill },
  sectionHeader: { gap: Spacing.sm },
  progression: { flexWrap: 'wrap', alignItems: 'stretch', gap: Spacing.lg },
  stage: { flexGrow: 1, flexShrink: 1, flexBasis: 260, gap: Spacing.md },
  stageHeader: { alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.sm, flexWrap: 'wrap' },
  stagePill: { minHeight: Controls.minimumTouchHeight, justifyContent: 'center', borderRadius: Radius.pill, paddingHorizontal: Spacing.md },
  flexibleText: { flex: 1, minWidth: 0, flexShrink: 1 },
});
