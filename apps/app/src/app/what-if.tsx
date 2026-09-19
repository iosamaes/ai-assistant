import { simulateScenario, type Confidence, type ScenarioDefinition, type ScenarioProjection } from '@mizan/core';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { loadCurrentHumanState } from '@/application/daily-intelligence';
import {
  loadPersonalScenarioEffects,
  type LearnableScenarioId,
} from '@/application/scenario-learning';
import { Card, ChoiceChip, MizanText, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Spacing } from '@/constants/theme';
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
    uncertainty: 'عدم اليقين',
    uncertaintyLevels: {
      high: 'مرتفع',
      moderate: 'متوسط',
      lower: 'أقل',
    },
    assumptions: 'الافتراضات',
    effects: 'النطاقات المحتملة',
    current: 'الحالي',
    projected: 'النطاق المحتمل',
    unknown: 'غير معروف — يحتاج بيانات فعلية',
    sourcePrior: 'تقدير محافظ عام',
    sourcePersonal: 'تقدير شخصي من أدلتك',
    evidence: 'عدد الأدلة',
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
    uncertainty: 'Uncertainty',
    uncertaintyLevels: {
      high: 'High',
      moderate: 'Moderate',
      lower: 'Lower',
    },
    assumptions: 'Assumptions',
    effects: 'Plausible ranges',
    current: 'Current',
    projected: 'Plausible range',
    unknown: 'Unknown — needs real evidence',
    sourcePrior: 'Conservative general estimate',
    sourcePersonal: 'Personal estimate from your evidence',
    evidence: 'Evidence count',
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

export default function WhatIfScreen() {
  const { isRtl, locale, refreshSession, userId } = useAppState();
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [selected, setSelected] = useState<ScenarioId>('earlier-bedtime');
  const [projection, setProjection] = useState<ScenarioProjection | null>(null);
  const labels = copy[locale];
  const definitions = useMemo(() => scenarioDefinitions(locale), [locale]);

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
      <View style={styles.hero}>
        <MizanText variant="label" muted>{labels.eyebrow}</MizanText>
        <MizanText variant="display">{labels.title}</MizanText>
        <MizanText muted>{labels.body}</MizanText>
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{labels.choose}</MizanText>
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
      </View>

      {status === 'loading' ? (
        <MizanText accessibilityLiveRegion="polite" muted>{labels.loading}</MizanText>
      ) : null}
      {status === 'error' ? (
        <Card>
          <MizanText accessibilityLiveRegion="polite" muted>{labels.error}</MizanText>
        </Card>
      ) : null}

      {status === 'ready' && projection ? (
        <>
          <Card>
            <MizanText variant="title">{labels.scenarios[selected].label}</MizanText>
            <MizanText variant="label">
              {labels.uncertainty}: {labels.uncertaintyLevels[projection.uncertainty]}
            </MizanText>
            <MizanText variant="caption" muted>{labels.assumptions}</MizanText>
            {projection.assumptions.map((assumption) => (
              <MizanText key={assumption} muted>• {assumption}</MizanText>
            ))}
          </Card>

          <View style={styles.section}>
            <MizanText variant="title">{labels.effects}</MizanText>
            {projection.effects.map((effect) => {
              const componentLabel = (labels.components as Record<string, string>)[effect.componentKey] ?? effect.componentKey;
              const sourceLabel = effect.source === 'personal' ? labels.sourcePersonal : labels.sourcePrior;
              return (
                <Card key={effect.componentKey}>
                  <MizanText variant="title">{componentLabel}</MizanText>
                  <MizanText muted>
                    {labels.current}: {effect.currentValue === null
                      ? labels.unknown
                      : formatLocalizedNumber(Math.round(effect.currentValue), locale, 0)}
                  </MizanText>
                  <MizanText muted>
                    {labels.projected}: {effect.projectedMin === null || effect.projectedMax === null
                      ? labels.unknown
                      : formatRange(effect.projectedMin, effect.projectedMax, locale)}
                  </MizanText>
                  <MizanText variant="caption" muted>
                    {sourceLabel} · {labels.evidence}: {formatLocalizedNumber(effect.evidenceCount, locale, 0)}
                  </MizanText>
                </Card>
              );
            })}
          </View>
        </>
      ) : null}

      <MizanText variant="caption" muted>{labels.caveat}</MizanText>
      <SecondaryButton compact label={labels.back} onPress={() => router.replace('/settings')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.md },
  section: { gap: Spacing.md },
  choices: { flexWrap: 'wrap', gap: Spacing.sm },
});
