import { simulateScenario, type Confidence, type ScenarioDefinition, type ScenarioProjection } from '@mizan/core';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import { loadCurrentHumanState } from '@/application/daily-intelligence';
import {
  loadPersonalScenarioEffects,
  type LearnableScenarioId,
} from '@/application/scenario-learning';
import { AppIcon, type AppIconName } from '@/components/app-icon';
import { Card, ChoiceChip, MizanText, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Controls, Palette, Radius, Spacing } from '@/constants/theme';
import { formatLocalizedNumber } from '@/i18n/number-input';
import { useAppState } from '@/state/app-state';

type LoadStatus = 'loading' | 'ready' | 'error';
type ScenarioId = LearnableScenarioId;

const priorConfidence: Confidence = {
  level: 'possible',
  score: 0.3,
  evidenceCount: 0,
  freshnessDays: null,
};

const copy = {
  ar: {
    eyebrow: 'ماذا لو؟',
    title: 'جرّب قرارًا قبل أن تتعامل معه كتوقع',
    body: 'هذه محاكاة تفسيرية محافظة وليست تنبؤًا بالمستقبل. تعرض اتجاهًا ونطاقًا محتملًا فقط، وتترك أي حالة حالية غير معروفة كما هي.',
    loading: 'جارٍ قراءة حالتك الحالية…',
    error: 'تعذر تحميل الحالة الحالية الآن. لم يتم إنشاء توقع بديل.',
    choose: 'اختر سيناريو قابلًا للعكس',
    chooseHint: 'غيّر السيناريو في أي وقت. كل نتيجة أدناه تبقى فرضية قابلة للمراجعة وليست وعدًا.',
    uncertainty: 'عدم اليقين',
    uncertaintyLevels: {
      high: 'مرتفع',
      moderate: 'متوسط',
      lower: 'أقل',
    },
    assumptions: 'ما الذي تفترضه المحاكاة؟',
    effects: 'النطاقات المحتملة',
    current: 'الحالي',
    projected: 'النطاق المحتمل',
    visualScale: 'مقياس بصري من 0 إلى 100؛ الشريط يوضح النطاق المحتمل والمؤشر يوضح القيمة الحالية.',
    unknown: 'غير معروف — يحتاج بيانات فعلية',
    source: 'مصدر التقدير',
    sourcePrior: 'تقدير محافظ عام',
    sourcePersonal: 'تقدير شخصي من أدلتك',
    evidence: 'عدد الأدلة',
    componentOther: 'مؤشر آخر',
    caveatTitle: 'حدود هذه المحاكاة',
    caveat: 'النطاقات لا تثبت أن التغيير سيسبب النتيجة. يتعلم ميزان تقديرًا شخصيًا فقط عند وجود تقييم أثر صريح ثم ملاحظة لاحقة متوافقة؛ مجرد إكمال الخطوة لا يُعد فائدة.',
    back: 'العودة للإعدادات',
    scenarios: {
      'earlier-bedtime': {
        label: 'تقديم موعد النوم',
        assumptions: ['تقديم النوم بنحو 30 دقيقة لمدة عدة أيام', 'لا يوجد تغيير كبير آخر متزامن في روتين التعافي'],
      },
      'quiet-focus': {
        label: 'فترة تركيز بلا إشعارات',
        assumptions: ['إيقاف الإشعارات لمدة 45 دقيقة خلال مهمة مهمة', 'السيناريو لا يفترض زيادة ساعات العمل'],
      },
      'short-walk': {
        label: 'مشي هادئ قصير',
        assumptions: ['مشي مريح لمدة نحو 20 دقيقة', 'لا يفترض شدة رياضية أو فائدة صحية علاجية'],
      },
    },
    components: {
      energy: 'الطاقة',
      recovery: 'التعافي',
      mental_load: 'الضغط الذهني',
      clarity: 'الوضوح',
    },
  },
  en: {
    eyebrow: 'What If',
    title: 'Explore a choice without treating it as a prediction',
    body: 'This is a conservative explanatory simulation, not a forecast. It shows only a plausible direction and range, and it keeps any unknown current state unknown.',
    loading: 'Reading your current state…',
    error: 'Your current state could not be loaded. MIZAN did not invent a substitute projection.',
    choose: 'Choose a reversible scenario',
    chooseHint: 'Switch scenarios at any time. Every result below remains a revisable hypothesis, not a promise.',
    uncertainty: 'Uncertainty',
    uncertaintyLevels: {
      high: 'High',
      moderate: 'Moderate',
      lower: 'Lower',
    },
    assumptions: 'What does the simulation assume?',
    effects: 'Plausible ranges',
    current: 'Current',
    projected: 'Plausible range',
    visualScale: 'Visual 0–100 scale; the band shows the plausible range and the marker shows the current value.',
    unknown: 'Unknown — needs real evidence',
    source: 'Estimate source',
    sourcePrior: 'Conservative general estimate',
    sourcePersonal: 'Personal estimate from your evidence',
    evidence: 'Evidence count',
    componentOther: 'Another signal',
    caveatTitle: 'Limits of this simulation',
    caveat: 'These ranges do not prove causation. MIZAN only learns a personal estimate when explicit outcome feedback is followed by a compatible later observation; completion alone is not benefit evidence.',
    back: 'Back to settings',
    scenarios: {
      'earlier-bedtime': {
        label: 'Earlier bedtime',
        assumptions: ['Move bedtime roughly 30 minutes earlier for several days', 'No other major recovery-routine change happens at the same time'],
      },
      'quiet-focus': {
        label: 'Notification-free focus block',
        assumptions: ['Silence notifications for about 45 minutes during an important task', 'The scenario does not assume longer working hours'],
      },
      'short-walk': {
        label: 'Short calm walk',
        assumptions: ['Take an easy walk for about 20 minutes', 'No exercise intensity or medical benefit is assumed'],
      },
    },
    components: {
      energy: 'Energy',
      recovery: 'Recovery',
      mental_load: 'Mental load',
      clarity: 'Clarity',
    },
  },
} as const;

function scenarioDefinitions(locale: 'ar' | 'en'): Record<ScenarioId, ScenarioDefinition> {
  const labels = copy[locale].scenarios;
  return {
    'earlier-bedtime': {
      id: 'earlier-bedtime',
      labelKey: 'earlier-bedtime',
      assumptions: labels['earlier-bedtime'].assumptions,
      priorEffects: [
        { componentKey: 'recovery', deltaMin: 3, deltaMax: 10, confidence: priorConfidence },
        { componentKey: 'energy', deltaMin: 1, deltaMax: 7, confidence: priorConfidence },
      ],
    },
    'quiet-focus': {
      id: 'quiet-focus',
      labelKey: 'quiet-focus',
      assumptions: labels['quiet-focus'].assumptions,
      priorEffects: [
        { componentKey: 'mental_load', deltaMin: -8, deltaMax: -2, confidence: priorConfidence },
        { componentKey: 'clarity', deltaMin: 3, deltaMax: 9, confidence: priorConfidence },
      ],
    },
    'short-walk': {
      id: 'short-walk',
      labelKey: 'short-walk',
      assumptions: labels['short-walk'].assumptions,
      priorEffects: [
        { componentKey: 'energy', deltaMin: 1, deltaMax: 6, confidence: priorConfidence },
        { componentKey: 'mental_load', deltaMin: -6, deltaMax: -1, confidence: priorConfidence },
      ],
    },
  };
}

function formatRange(min: number, max: number, locale: 'ar' | 'en'): string {
  return `${formatLocalizedNumber(Math.round(min), locale, 0)}–${formatLocalizedNumber(Math.round(max), locale, 0)}`;
}

function clampScale(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function percent(value: number): `${number}%` {
  return `${clampScale(value)}%` as `${number}%`;
}

function componentIcon(componentKey: string): AppIconName {
  if (componentKey === 'recovery') return 'recovery';
  if (componentKey === 'energy') return 'energy';
  if (componentKey === 'mental_load') return 'mentalLoad';
  return 'insights';
}

function RangeMeter({
  currentValue,
  projectedMin,
  projectedMax,
  locale,
}: {
  currentValue: number | null;
  projectedMin: number | null;
  projectedMax: number | null;
  locale: 'ar' | 'en';
}) {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const labels = copy[locale];
  if (currentValue === null || projectedMin === null || projectedMax === null) return null;

  const bandStart = Math.min(clampScale(projectedMin), clampScale(projectedMax));
  const bandEnd = Math.max(clampScale(projectedMin), clampScale(projectedMax));
  const bandWidth = Math.max(2, bandEnd - bandStart);
  const current = clampScale(currentValue);
  const accessibilityLabel = `${labels.current}: ${formatLocalizedNumber(Math.round(currentValue), locale, 0)}. ${labels.projected}: ${formatRange(projectedMin, projectedMax, locale)}. ${labels.visualScale}`;

  return (
    <View style={styles.rangeMeter} accessible accessibilityLabel={accessibilityLabel}>
      <View style={[styles.rangeTrack, { backgroundColor: palette.surfaceMuted }]}>
        <View
          style={[
            styles.rangeBand,
            {
              backgroundColor: palette.accentSoft,
              borderColor: palette.accent,
              left: percent(bandStart),
              width: percent(bandWidth),
            },
          ]}
        />
        <View style={[styles.currentMarker, { backgroundColor: palette.accent, left: percent(current) }]} />
      </View>
      <View style={styles.scaleRow}>
        <MizanText variant="caption" muted>{formatLocalizedNumber(0, locale, 0)}</MizanText>
        <MizanText variant="caption" muted>{formatLocalizedNumber(100, locale, 0)}</MizanText>
      </View>
      <MizanText variant="caption" muted>{labels.visualScale}</MizanText>
    </View>
  );
}

export default function WhatIfScreen() {
  const { isRtl, locale, refreshSession, userId } = useAppState();
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [selected, setSelected] = useState<ScenarioId>('earlier-bedtime');
  const [projection, setProjection] = useState<ScenarioProjection | null>(null);
  const labels = copy[locale];
  const definitions = useMemo(() => scenarioDefinitions(locale), [locale]);
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];

  useEffect(() => {
    let active = true;
    void (async () => {
      await Promise.resolve();
      if (!active) return;
      if (!userId) {
        setStatus('error');
        setProjection(null);
        return;
      }

      setStatus('loading');
      const [stateResult, personalResult] = await Promise.all([
        loadCurrentHumanState(userId),
        loadPersonalScenarioEffects(userId, selected),
      ]);
      if (!active) return;
      if (!stateResult.ok) {
        if (stateResult.error.kind === 'session-expired') await refreshSession();
        if (active) {
          setStatus('error');
          setProjection(null);
        }
        return;
      }

      if (!personalResult.ok && personalResult.error.kind === 'session-expired') {
        await refreshSession();
      }
      if (!active) return;
      setProjection(simulateScenario({
        definition: definitions[selected],
        currentState: stateResult.value,
        personalEffects: personalResult.ok ? personalResult.value : [],
      }));
      setStatus('ready');
    })();

    return () => {
      active = false;
    };
  }, [definitions, refreshSession, selected, userId]);

  const chooseScenario = (id: ScenarioId) => {
    if (status === 'loading') return;
    setStatus('loading');
    setProjection(null);
    setSelected(id);
  };

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
        <View style={[styles.heroTitleRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={[styles.heroIcon, { backgroundColor: palette.surface }]}>
            <AppIcon name="hypothesis" color={palette.accent} size={28} />
          </View>
          <View style={styles.flexibleText}>
            <MizanText variant="title">{labels.eyebrow}</MizanText>
            <MizanText muted>{labels.body}</MizanText>
          </View>
        </View>
      </Card>

      <Card style={styles.scenarioCard}>
        <View style={styles.sectionHeading}>
          <MizanText variant="title">{labels.choose}</MizanText>
          <MizanText variant="caption" muted>{labels.chooseHint}</MizanText>
        </View>
        <View style={[styles.choices, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          {(Object.keys(definitions) as ScenarioId[]).map((id) => (
            <ChoiceChip
              key={id}
              label={labels.scenarios[id].label}
              selected={selected === id}
              onPress={() => chooseScenario(id)}
              disabled={status === 'loading'}
            />
          ))}
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

      {status === 'ready' && projection ? (
        <>
          <Card style={styles.projectionCard}>
            <View style={[styles.projectionHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={styles.flexibleText}>
                <MizanText variant="label" muted>{labels.eyebrow}</MizanText>
                <MizanText variant="title">{labels.scenarios[selected].label}</MizanText>
              </View>
              <View style={[styles.uncertaintyPill, { backgroundColor: palette.accentSoft, flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <AppIcon name="hypothesis" color={palette.accent} size={16} />
                <MizanText variant="caption">
                  {labels.uncertainty}: {labels.uncertaintyLevels[projection.uncertainty]}
                </MizanText>
              </View>
            </View>

            <View style={[styles.assumptions, { borderTopColor: palette.border }]}>
              <MizanText variant="label">{labels.assumptions}</MizanText>
              {projection.assumptions.map((assumption) => (
                <MizanText key={assumption} muted>• {assumption}</MizanText>
              ))}
            </View>
          </Card>

          <View style={styles.section}>
            <MizanText variant="title">{labels.effects}</MizanText>
            <View style={[styles.effectsGrid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              {projection.effects.map((effect) => {
                const componentLabel = (labels.components as Record<string, string>)[effect.componentKey] ?? labels.componentOther;
                const sourceLabel = effect.source === 'personal' ? labels.sourcePersonal : labels.sourcePrior;
                return (
                  <Card key={effect.componentKey} style={styles.effectCard}>
                    <View style={[styles.effectHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                      <View style={[styles.effectIdentity, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                        <View style={[styles.effectIcon, { backgroundColor: palette.accentSoft }]}>
                          <AppIcon name={componentIcon(effect.componentKey)} color={palette.accent} size={22} />
                        </View>
                        <MizanText variant="title" style={styles.flexibleText}>{componentLabel}</MizanText>
                      </View>
                      <View style={[styles.sourcePill, { backgroundColor: palette.surfaceMuted }]}>
                        <MizanText variant="caption">{sourceLabel}</MizanText>
                      </View>
                    </View>

                    <View style={[styles.valueGroup, { borderTopColor: palette.border }]}>
                      <View style={styles.valueBlock}>
                        <MizanText variant="caption" muted>{labels.current}</MizanText>
                        <MizanText variant="title">
                          {effect.currentValue === null
                            ? labels.unknown
                            : formatLocalizedNumber(Math.round(effect.currentValue), locale, 0)}
                        </MizanText>
                      </View>
                      <View style={styles.valueBlock}>
                        <MizanText variant="caption" muted>{labels.projected}</MizanText>
                        <MizanText variant="title">
                          {effect.projectedMin === null || effect.projectedMax === null
                            ? labels.unknown
                            : formatRange(effect.projectedMin, effect.projectedMax, locale)}
                        </MizanText>
                      </View>
                    </View>

                    <RangeMeter
                      currentValue={effect.currentValue}
                      projectedMin={effect.projectedMin}
                      projectedMax={effect.projectedMax}
                      locale={locale}
                    />

                    <View style={[styles.evidenceRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                      <AppIcon name="evidence" color={palette.accent} size={16} />
                      <MizanText variant="caption" muted style={styles.flexibleText}>
                        {labels.source}: {sourceLabel} · {labels.evidence}: {formatLocalizedNumber(effect.evidenceCount, locale, 0)}
                      </MizanText>
                    </View>
                  </Card>
                );
              })}
            </View>
          </View>
        </>
      ) : null}

      <Card style={[styles.caveatCard, { backgroundColor: palette.surfaceMuted }]}>
        <View style={[styles.caveatTitleRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <AppIcon name="evidence" color={palette.accent} size={18} />
          <MizanText variant="label">{labels.caveatTitle}</MizanText>
        </View>
        <MizanText variant="caption" muted>{labels.caveat}</MizanText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.lg,
    flexWrap: 'wrap',
  },
  heading: { flex: 1, minWidth: 0, gap: Spacing.xs },
  heroCard: { gap: Spacing.md },
  heroTitleRow: { alignItems: 'flex-start', gap: Spacing.lg },
  heroIcon: { width: 52, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  scenarioCard: { gap: Spacing.lg },
  sectionHeading: { gap: Spacing.xs },
  section: { gap: Spacing.lg },
  choices: { flexWrap: 'wrap', gap: Spacing.sm },
  projectionCard: { gap: Spacing.lg },
  projectionHeader: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  flexibleText: { flex: 1, minWidth: 0 },
  uncertaintyPill: {
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  assumptions: {
    borderTopWidth: Controls.borderWidth,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },
  effectsGrid: {
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  effectCard: {
    flexGrow: 1,
    flexBasis: 300,
    minWidth: 0,
  },
  effectHeader: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  effectIdentity: { flexGrow: 1, flexShrink: 1, flexBasis: 190, alignItems: 'center', gap: Spacing.sm },
  effectIcon: { width: 42, height: 42, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sourcePill: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    maxWidth: '100%',
  },
  valueGroup: {
    borderTopWidth: Controls.borderWidth,
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
  },
  valueBlock: { gap: Spacing.xs },
  rangeMeter: { gap: Spacing.xs },
  rangeTrack: { height: 20, borderRadius: Radius.pill, position: 'relative', overflow: 'hidden' },
  rangeBand: { position: 'absolute', top: 4, bottom: 4, borderWidth: Controls.borderWidth, borderRadius: Radius.pill },
  currentMarker: { position: 'absolute', top: 1, bottom: 1, width: 3, borderRadius: Radius.pill, marginLeft: -1.5 },
  scaleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  evidenceRow: { alignItems: 'center', gap: Spacing.xs },
  caveatCard: { gap: Spacing.sm },
  caveatTitleRow: { alignItems: 'center', gap: Spacing.sm },
});
