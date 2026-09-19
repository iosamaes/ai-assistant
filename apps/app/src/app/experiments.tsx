import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  cancelExperiment,
  completeExperimentWithOutcome,
  experimentTemplates,
  loadExperimentHistory,
  startExperiment,
  type ExperimentTemplateId,
  type ExperimentWithEvaluation,
} from '@/application/experiments';
import {
  Card,
  ChoiceChip,
  MizanText,
  MizanTextInput,
  PrimaryButton,
  SecondaryButton,
} from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Spacing } from '@/constants/theme';
import { useAppState } from '@/state/app-state';

const templateIds = Object.keys(experimentTemplates) as ExperimentTemplateId[];

const copy = {
  ar: {
    eyebrow: 'تجارب شخصية',
    title: 'اختبر فرضية صغيرة على حياتك',
    body: 'تجارب ميزان اختيارية ومحدودة المدة. الهدف هو جمع دليل شخصي متواضع، لا إثبات سبب علمي أو اتخاذ قرار طبي.',
    choose: 'اختر تجربة',
    hypothesis: 'الفرضية',
    consent: 'أوافق على تشغيل هذه التجربة الشخصية طوعًا',
    start: 'بدء التجربة',
    starting: 'جارٍ البدء…',
    active: 'تجربة نشطة',
    history: 'سجل التجارب',
    empty: 'لا توجد تجارب بعد.',
    loading: 'جارٍ تحميل التجارب…',
    loadError: 'تعذر تحميل التجارب الآن.',
    saveError: 'تعذر حفظ التغيير الآن.',
    duration: 'المدة',
    days: 'أيام',
    metric: 'المؤشر المتابع',
    started: 'بدأت',
    status: 'الحالة',
    statuses: { active: 'نشطة', completed: 'مكتملة', cancelled: 'متوقفة', planned: 'مخططة' },
    endPrompt: 'بعد التجربة، كيف كان أثرها عليك؟',
    usefulness: ['أسوأ بوضوح', 'أسوأ قليلًا', 'لا فرق واضح', 'أفضل قليلًا', 'أفضل بوضوح'],
    finish: 'إنهاء التجربة وحفظ الأثر',
    cancel: 'إيقاف التجربة بدون عقوبة',
    outcome: 'النتيجة الشخصية',
    outcomes: {
      improved: 'تحسن شخصي محتمل',
      worsened: 'تراجع شخصي محتمل',
      no_clear_change: 'لا تغير واضح',
      insufficient: 'الأدلة غير كافية',
    },
    evidence: 'الأدلة',
    baseline: 'وسيط ما قبل التجربة',
    followup: 'وسيط أثناء/بعد التجربة',
    confidence: 'الثقة',
    confidenceLevels: {
      known: 'معروفة',
      likely: 'مرجحة',
      possible: 'محتملة',
      insufficient: 'غير كافية',
    },
    limitations: 'هذه مقارنة شخصية فقط؛ قد تكون عوامل أخرى تغيرت في نفس الوقت، ولا تثبت السببية.',
    noScore: 'لا توجد نقاط أو سلاسل استمرار، ويمكنك الإيقاف في أي وقت.',
    back: 'العودة إلى الإعدادات',
    templates: {
      'earlier-bedtime': {
        label: 'نوم أبكر',
        hypothesis: 'تقديم موعد النوم قليلًا قد يحسن التعافي الذي أبلغ عنه بنفسي.',
      },
      'quiet-focus': {
        label: 'تركيز بلا إشعارات',
        hypothesis: 'فترة تركيز بدون إشعارات قد تقلل الضغط الذهني الذي أبلغ عنه بنفسي.',
      },
      'short-walk': {
        label: 'مشي هادئ قصير',
        hypothesis: 'المشي الهادئ القصير قد يحسن الطاقة التي أبلغ عنها بنفسي.',
      },
    },
    metrics: { recovery: 'التعافي', mental_load: 'الضغط الذهني', energy: 'الطاقة' },
  },
  en: {
    eyebrow: 'Personal experiments',
    title: 'Test one small hypothesis in your own life',
    body: 'MIZAN experiments are voluntary and time-bounded. They collect modest personal evidence, not scientific causal proof or medical guidance.',
    choose: 'Choose an experiment',
    hypothesis: 'Hypothesis',
    consent: 'I voluntarily consent to run this personal experiment',
    start: 'Start experiment',
    starting: 'Starting…',
    active: 'Active experiment',
    history: 'Experiment history',
    empty: 'No experiments yet.',
    loading: 'Loading experiments…',
    loadError: 'MIZAN could not load experiments right now.',
    saveError: 'MIZAN could not save this change right now.',
    duration: 'Duration',
    days: 'days',
    metric: 'Observed outcome',
    started: 'Started',
    status: 'Status',
    statuses: { active: 'Active', completed: 'Completed', cancelled: 'Stopped', planned: 'Planned' },
    endPrompt: 'After trying it, what effect did it have for you?',
    usefulness: ['Clearly worse', 'A little worse', 'No clear difference', 'A little better', 'Clearly better'],
    finish: 'End experiment and save impact',
    cancel: 'Stop experiment without penalty',
    outcome: 'Personal result',
    outcomes: {
      improved: 'Possible personal improvement',
      worsened: 'Possible personal worsening',
      no_clear_change: 'No clear change',
      insufficient: 'Insufficient evidence',
    },
    evidence: 'Evidence',
    baseline: 'Pre-experiment median',
    followup: 'During/after median',
    confidence: 'Confidence',
    confidenceLevels: {
      known: 'Known',
      likely: 'Likely',
      possible: 'Possible',
      insufficient: 'Insufficient',
    },
    limitations: 'This is personal comparison evidence only. Other factors may have changed at the same time, so it does not prove causation.',
    noScore: 'There are no points or streaks, and you can stop at any time.',
    back: 'Back to settings',
    templates: {
      'earlier-bedtime': {
        label: 'Earlier bedtime',
        hypothesis: 'Moving bedtime a little earlier may improve my self-reported recovery.',
      },
      'quiet-focus': {
        label: 'Notification-free focus',
        hypothesis: 'A notification-free focus block may reduce my self-reported mental load.',
      },
      'short-walk': {
        label: 'Short calm walk',
        hypothesis: 'A short calm walk may improve my self-reported energy.',
      },
    },
    metrics: { recovery: 'Recovery', mental_load: 'Mental load', energy: 'Energy' },
  },
} as const;

function formatValue(value: number | null): string {
  return value === null ? '—' : String(Math.round(value * 10) / 10);
}

export default function ExperimentsScreen() {
  const { isRtl, locale, refreshSession, userId } = useAppState();
  const labels = copy[locale];
  const [selected, setSelected] = useState<ExperimentTemplateId>('earlier-bedtime');
  const [hypothesis, setHypothesis] = useState<string>(labels.templates['earlier-bedtime'].hypothesis);
  const [consented, setConsented] = useState(false);
  const [history, setHistory] = useState<ExperimentWithEvaluation[]>([]);
  const [ratingById, setRatingById] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await loadExperimentHistory(userId);
    if (!result.ok) {
      if (result.error.kind === 'session-expired') await refreshSession();
      setMessage(labels.loadError);
    } else {
      setHistory(result.value);
    }
    setLoading(false);
  }, [labels.loadError, refreshSession, userId]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return load();
      return undefined;
    });
    return () => {
      active = false;
    };
  }, [load]);

  const activeExperiment = useMemo(
    () => history.find((item) => item.experiment.status === 'active') ?? null,
    [history],
  );

  const start = async () => {
    if (!userId || loading || busy || activeExperiment || !consented || hypothesis.trim().length < 8) return;
    setBusy(true);
    setMessage(null);
    const result = await startExperiment({ userId, templateId: selected, hypothesis, consented });
    if (!result.ok) {
      if (result.error.kind === 'session-expired') await refreshSession();
      setMessage(labels.saveError);
    } else {
      setConsented(false);
      await load();
    }
    setBusy(false);
  };

  const stop = async (experimentId: string) => {
    if (!userId || busy) return;
    setBusy(true);
    setMessage(null);
    const result = await cancelExperiment(userId, experimentId);
    if (!result.ok) {
      if (result.error.kind === 'session-expired') await refreshSession();
      setMessage(labels.saveError);
    } else {
      await load();
    }
    setBusy(false);
  };

  const finish = async (item: ExperimentWithEvaluation) => {
    if (!userId || busy) return;
    const usefulness = ratingById[item.experiment.id];
    if (!usefulness) return;
    setBusy(true);
    setMessage(null);
    const result = await completeExperimentWithOutcome({
      userId,
      experiment: item.experiment,
      usefulness,
    });
    if (!result.ok) {
      if (result.error.kind === 'session-expired') await refreshSession();
      setMessage(labels.saveError);
    } else {
      setRatingById((current) => {
        const next = { ...current };
        delete next[item.experiment.id];
        return next;
      });
      await load();
    }
    setBusy(false);
  };

  const renderExperiment = (item: ExperimentWithEvaluation) => {
    const experiment = item.experiment;
    const evaluation = item.evaluation;
    const templateId = experiment.template_id as ExperimentTemplateId | null;
    const templateLabel = templateId && templateId in labels.templates
      ? labels.templates[templateId].label
      : experiment.metric;
    const selectedRating = ratingById[experiment.id] ?? 0;

    return (
      <Card key={experiment.id}>
        <MizanText variant="title">{templateLabel}</MizanText>
        <MizanText>{experiment.hypothesis}</MizanText>
        <MizanText muted>{labels.duration}: {experiment.duration_days} {labels.days}</MizanText>
        <MizanText muted>{labels.metric}: {(labels.metrics as Record<string, string>)[experiment.metric] ?? experiment.metric}</MizanText>
        <MizanText muted>{labels.status}: {labels.statuses[experiment.status]}</MizanText>
        <MizanText variant="caption" muted>
          {labels.started}: {new Date(experiment.started_at ?? experiment.created_at).toLocaleDateString(locale === 'ar' ? 'ar-QA' : 'en-QA')}
        </MizanText>

        {experiment.status === 'active' ? (
          <View style={styles.actionGroup}>
            <MizanText variant="label">{labels.endPrompt}</MizanText>
            <View style={[styles.chips, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              {labels.usefulness.map((label, index) => {
                const value = index + 1;
                return (
                  <ChoiceChip
                    key={value}
                    label={label}
                    selected={selectedRating === value}
                    onPress={() => setRatingById((current) => ({ ...current, [experiment.id]: value }))}
                    disabled={busy}
                  />
                );
              })}
            </View>
            <PrimaryButton
              label={labels.finish}
              onPress={() => void finish(item)}
              disabled={busy || selectedRating === 0}
            />
            <SecondaryButton
              label={labels.cancel}
              onPress={() => void stop(experiment.id)}
              disabled={busy}
            />
          </View>
        ) : (
          <View style={styles.resultGroup}>
            <MizanText variant="label">{labels.outcome}: {labels.outcomes[evaluation.outcome]}</MizanText>
            <MizanText muted>{labels.baseline}: {formatValue(evaluation.baselineMedian)}</MizanText>
            <MizanText muted>{labels.followup}: {formatValue(evaluation.followupMedian)}</MizanText>
            <MizanText variant="caption" muted>
              {labels.evidence}: {evaluation.baselineEvidenceCount + evaluation.followupEvidenceCount} · {labels.confidence}: {labels.confidenceLevels[evaluation.confidence.level]}
            </MizanText>
          </View>
        )}
      </Card>
    );
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <MizanText variant="label" muted>{labels.eyebrow}</MizanText>
        <MizanText variant="display">{labels.title}</MizanText>
        <MizanText muted>{labels.body}</MizanText>
        <MizanText variant="caption" muted>{labels.noScore}</MizanText>
      </View>

      {!activeExperiment ? (
        <Card>
          <MizanText variant="title">{labels.choose}</MizanText>
          <View style={[styles.chips, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            {templateIds.map((id) => (
              <ChoiceChip
                key={id}
                label={labels.templates[id].label}
                selected={selected === id}
                onPress={() => {
                  setSelected(id);
                  setHypothesis(labels.templates[id].hypothesis);
                  setConsented(false);
                }}
                disabled={loading || busy}
              />
            ))}
          </View>
          <MizanText variant="label">{labels.hypothesis}</MizanText>
          <MizanTextInput
            accessibilityLabel={labels.hypothesis}
            editable={!loading && !busy}
            multiline
            maxLength={500}
            value={hypothesis}
            onChangeText={setHypothesis}
            style={[styles.input, { writingDirection: isRtl ? 'rtl' : 'ltr' }]}
          />
          <MizanText muted>
            {labels.duration}: {experimentTemplates[selected].durationDays} {labels.days} · {labels.metric}: {labels.metrics[experimentTemplates[selected].metric]}
          </MizanText>
          <ChoiceChip
            label={labels.consent}
            selected={consented}
            onPress={() => setConsented((value) => !value)}
            disabled={loading || busy}
          />
          <PrimaryButton
            label={busy ? labels.starting : labels.start}
            onPress={() => void start()}
            disabled={loading || busy || !consented || hypothesis.trim().length < 8 || !userId}
          />
        </Card>
      ) : null}

      {message ? <MizanText accessibilityLiveRegion="polite" muted>{message}</MizanText> : null}

      <View style={styles.section}>
        <MizanText variant="title">{activeExperiment ? labels.active : labels.history}</MizanText>
        {loading ? <MizanText accessibilityLiveRegion="polite" muted>{labels.loading}</MizanText> : null}
        {!loading && history.length === 0 ? <MizanText accessibilityLiveRegion="polite" muted>{labels.empty}</MizanText> : null}
        {history.map(renderExperiment)}
      </View>

      <MizanText variant="caption" muted>{labels.limitations}</MizanText>
      <SecondaryButton compact label={labels.back} onPress={() => router.replace('/settings')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.md },
  section: { gap: Spacing.lg },
  chips: { flexWrap: 'wrap', gap: Spacing.sm },
  actionGroup: { gap: Spacing.md, paddingTop: Spacing.sm },
  resultGroup: { gap: Spacing.sm, paddingTop: Spacing.sm },
  input: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
