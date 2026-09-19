import type { HumanStateVector, PersonalizationMaturity } from '@mizan/core';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import { loadCurrentHumanState } from '@/application/daily-intelligence';
import { Card, MizanText, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Controls, Palette, Radius, Spacing } from '@/constants/theme';
import { useAppState } from '@/state/app-state';

type LoadStatus = 'loading' | 'ready' | 'error';

const stageOrder: readonly PersonalizationMaturity[] = ['cold_start', 'learning', 'personalized'];

const copy = {
  ar: {
    eyebrow: 'التخصيص',
    title: 'إلى أي مدى تعلّم ميزان عن نمطك؟',
    body: 'هذه ليست درجة لك. إنها توضح فقط مدى نضج الأدلة الشخصية التي يعتمد عليها ميزان، وقد تتراجع المرحلة إذا أصبحت البيانات قديمة أو قليلة.',
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
  const { isRtl, locale, refreshSession, userId } = useAppState();
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
  sectionHeader: { gap: Spacing.sm },
  progression: { flexWrap: 'wrap', alignItems: 'stretch', gap: Spacing.lg },
  stage: { flexGrow: 1, flexShrink: 1, flexBasis: 260, gap: Spacing.md },
  stageHeader: { alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.sm, flexWrap: 'wrap' },
  stagePill: { minHeight: Controls.minimumTouchHeight, justifyContent: 'center', borderRadius: Radius.pill, paddingHorizontal: Spacing.md },
  flexibleText: { flexShrink: 1 },
});
