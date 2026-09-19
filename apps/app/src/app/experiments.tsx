import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

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
import { Controls, Palette, Radius, Spacing } from '@/constants/theme';
import { formatLocalizedNumber } from '@/i18n/number-input';
import { useAppState } from '@/state/app-state';

const templateIds = Object.keys(experimentTemplates) as ExperimentTemplateId[];

const copy = {
  ar: {
    eyebrow: 'تجارب شخصية',
    title: 'اختبر فرضية صغيرة على حياتك',
    body: 'تجارب ميزان اختيارية ومحدودة المدة. الهدف هو جمع دليل شخصي متواضع، لا إثبات سبب علمي أو اتخاذ قرار طبي.',
    choose: 'اختر تجربة',
    chooseBody: 'ابدأ بتغيير واحد صغير وحدد ما الذي تريد ملاحظته خلال فترة قصيرة وواضحة.',
    hypothesis: 'الفرضية',
    consent: 'أوافق على تشغيل هذه التجربة الشخصية طوعًا',
    consentTitle: 'المشاركة اختيارية',
    consentBody: 'يمكنك إيقاف التجربة في أي وقت بدون عقوبة أو خسارة سلسلة.',
    start: 'بدء التجربة',
    starting: 'جارٍ البدء…',
    active: 'تجربة نشطة',
    history: 'سجل التجارب',
    historyBody: 'نتائجك تبقى دليلًا شخصيًا محدودًا وليست إثباتًا سببيًا.',
    empty: 'لا توجد تجارب بعد.',
    emptyBody: 'عندما تبدأ تجربة ستظهر هنا مع الفرضية والأدلة والنتيجة الشخصية.',
    loading: 'جارٍ تحميل التجارب…',
    loadError: 'تعذر تحميل التجارب الآن.',
    saveError: 'تعذر حفظ التغيير الآن.',
    duration: 'المدة',
    days: 'أيام',
    metric: 'المؤشر المتابع',
    started: 'بدأت',
    status: 'الحالة',
    resultReading: 'قراءة النتيجة',
    comparison: 'المقارنة الشخصية',
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
    limitationsTitle: 'حدود التفسير',
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
    chooseBody: 'Start with one small change and define what you want to observe over a short, clear window.',
    hypothesis: 'Hypothesis',
    consent: 'I voluntarily consent to run this personal experiment',
    consentTitle: 'Participation is voluntary',
    consentBody: 'You can stop at any time without penalty or losing a streak.',
    start: 'Start experiment',
    starting: 'Starting…',
    active: 'Active experiment',
    history: 'Experiment history',
    historyBody: 'Your results remain limited personal evidence, not causal proof.',
    empty: 'No experiments yet.',
    emptyBody: 'When you start an experiment, its hypothesis, evidence, and personal result will appear here.',
    loading: 'Loading experiments…',
    loadError: 'MIZAN could not load experiments right now.',
    saveError: 'MIZAN could not save this change right now.',
    duration: 'Duration',
    days: 'days',
    metric: 'Observed outcome',
    started: 'Started',
    status: 'Status',
    resultReading: 'Result reading',
    comparison: 'Personal comparison',
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
    limitationsTitle: 'Interpretation limits',
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

function formatValue(value: number | null, locale: 'ar' | 'en'): string {
  return value === null ? '—' : formatLocalizedNumber(value, locale, 1);
}

export default function ExperimentsScreen() {
  const { isRtl, locale, refreshSession, userId } = useAppState();
  const labels = copy[locale];
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
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
    const metricLabel = (labels.metrics as Record<string, string>)[experiment.metric] ?? experiment.metric;
    const selectedRating = ratingById[experiment.id] ?? 0;
    const startedAt = new Date(experiment.started_at ?? experiment.created_at).toLocaleDateString(
      locale === 'ar' ? 'ar-QA-u-nu-latn' : 'en-QA-u-nu-latn',
    );
    const isActive = experiment.status === 'active';

    return (
      <Card key={experiment.id} style={isActive ? { borderColor: palette.accent } : undefined}>
        <View style={[styles.experimentHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={styles.flexibleText}>
            <MizanText variant="label" muted>{isActive ? labels.active : labels.resultReading}</MizanText>
            <MizanText variant="title">{templateLabel}</MizanText>
          </View>
          <View style={[styles.statusPill, { backgroundColor: isActive ? palette.accentSoft : palette.surfaceMuted }]}>
            <MizanText variant="caption">{labels.statuses[experiment.status]}</MizanText>
          </View>
        </View>

        <MizanText>{experiment.hypothesis}</MizanText>

        <View style={styles.metadataGrid}>
          <View style={[styles.metadataTile, { backgroundColor: palette.surfaceMuted }]}>
            <MizanText variant="caption" muted>{labels.duration}</MizanText>
            <MizanText variant="label">
              {formatLocalizedNumber(experiment.duration_days, locale, 0)} {labels.days}
            </MizanText>
          </View>
          <View style={[styles.metadataTile, { backgroundColor: palette.surfaceMuted }]}>
            <MizanText variant="caption" muted>{labels.metric}</MizanText>
            <MizanText variant="label">{metricLabel}</MizanText>
          </View>
          <View style={[styles.metadataTile, { backgroundColor: palette.surfaceMuted }]}>
            <MizanText variant="caption" muted>{labels.started}</MizanText>
            <MizanText variant="label">{startedAt}</MizanText>
          </View>
        </View>

        {isActive ? (
          <View style={[styles.actionGroup, { borderTopColor: palette.border }]}>
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
            <View style={styles.actionButtons}>
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
          </View>
        ) : (
          <View style={[styles.resultGroup, { borderTopColor: palette.border }]}>
            <View style={[styles.outcomeCallout, { backgroundColor: palette.accentSoft }]}>
              <MizanText variant="caption" muted>{labels.outcome}</MizanText>
              <MizanText variant="title">{labels.outcomes[evaluation.outcome]}</MizanText>
            </View>

            <MizanText variant="label">{labels.comparison}</MizanText>
            <View style={styles.comparisonGrid}>
              <View style={styles.comparisonBlock}>
                <MizanText variant="caption" muted>{labels.baseline}</MizanText>
                <MizanText variant="title">{formatValue(evaluation.baselineMedian, locale)}</MizanText>
              </View>
              <View style={styles.comparisonBlock}>
                <MizanText variant="caption" muted>{labels.followup}</MizanText>
                <MizanText variant="title">{formatValue(evaluation.followupMedian, locale)}</MizanText>
              </View>
            </View>

            <View style={[styles.evidenceRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={styles.evidenceBlock}>
                <MizanText variant="caption" muted>{labels.evidence}</MizanText>
                <MizanText variant="label">
                  {formatLocalizedNumber(
                    evaluation.baselineEvidenceCount + evaluation.followupEvidenceCount,
                    locale,
                    0,
                  )}
                </MizanText>
              </View>
              <View style={styles.evidenceBlock}>
                <MizanText variant="caption" muted>{labels.confidence}</MizanText>
                <MizanText variant="label">{labels.confidenceLevels[evaluation.confidence.level]}</MizanText>
              </View>
            </View>
          </View>
        )}
      </Card>
    );
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
        <MizanText variant="title">{labels.eyebrow}</MizanText>
        <MizanText>{labels.body}</MizanText>
        <MizanText variant="caption" muted>{labels.noScore}</MizanText>
      </Card>

      {!activeExperiment ? (
        <Card style={styles.plannerCard}>
          <View style={styles.sectionIntro}>
            <MizanText variant="title">{labels.choose}</MizanText>
            <MizanText muted>{labels.chooseBody}</MizanText>
          </View>

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

          <View style={styles.planStats}>
            <View style={[styles.planStat, { backgroundColor: palette.surfaceMuted }]}>
              <MizanText variant="caption" muted>{labels.duration}</MizanText>
              <MizanText variant="title">
                {formatLocalizedNumber(experimentTemplates[selected].durationDays, locale, 0)} {labels.days}
              </MizanText>
            </View>
            <View style={[styles.planStat, { backgroundColor: palette.surfaceMuted }]}>
              <MizanText variant="caption" muted>{labels.metric}</MizanText>
              <MizanText variant="title">{labels.metrics[experimentTemplates[selected].metric]}</MizanText>
            </View>
          </View>

          <View style={styles.hypothesisGroup}>
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
          </View>

          <View style={[styles.consentPanel, { backgroundColor: palette.accentSoft }] }>
            <MizanText variant="label">{labels.consentTitle}</MizanText>
            <MizanText variant="caption" muted>{labels.consentBody}</MizanText>
            <ChoiceChip
              label={labels.consent}
              selected={consented}
              onPress={() => setConsented((value) => !value)}
              disabled={loading || busy}
            />
          </View>

          <PrimaryButton
            label={busy ? labels.starting : labels.start}
            onPress={() => void start()}
            disabled={loading || busy || !consented || hypothesis.trim().length < 8 || !userId}
          />
        </Card>
      ) : null}

      {message ? (
        <Card style={{ backgroundColor: palette.surfaceMuted }}>
          <MizanText accessibilityLiveRegion="polite" muted>{message}</MizanText>
        </Card>
      ) : null}

      <View style={styles.section}>
        <View style={styles.sectionIntro}>
          <MizanText variant="title">{labels.history}</MizanText>
          <MizanText muted>{labels.historyBody}</MizanText>
        </View>

        {loading ? (
          <Card style={{ backgroundColor: palette.surfaceMuted }}>
            <MizanText accessibilityLiveRegion="polite" muted>{labels.loading}</MizanText>
          </Card>
        ) : null}

        {!loading && history.length === 0 ? (
          <Card style={{ backgroundColor: palette.surfaceMuted }}>
            <MizanText accessibilityLiveRegion="polite" variant="title">{labels.empty}</MizanText>
            <MizanText muted>{labels.emptyBody}</MizanText>
          </Card>
        ) : null}

        {history.map(renderExperiment)}
      </View>

      <Card style={[styles.limitationsCard, { backgroundColor: palette.surfaceMuted }]}>
        <MizanText variant="label">{labels.limitationsTitle}</MizanText>
        <MizanText variant="caption" muted>{labels.limitations}</MizanText>
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
  flexibleText: { flex: 1, minWidth: 0 },
  heroCard: { gap: Spacing.md },
  plannerCard: { gap: Spacing.xl },
  section: { gap: Spacing.lg },
  sectionIntro: { gap: Spacing.xs },
  chips: { flexWrap: 'wrap', gap: Spacing.sm },
  planStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  planStat: {
    flexGrow: 1,
    flexBasis: 220,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  hypothesisGroup: { gap: Spacing.sm },
  consentPanel: {
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  experimentHeader: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  statusPill: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metadataTile: {
    flexGrow: 1,
    flexBasis: 150,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  actionGroup: {
    borderTopWidth: Controls.borderWidth,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  actionButtons: { gap: Spacing.sm },
  resultGroup: {
    borderTopWidth: Controls.borderWidth,
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
  },
  outcomeCallout: {
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  comparisonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  comparisonBlock: {
    flexGrow: 1,
    flexBasis: 220,
    gap: Spacing.xs,
  },
  evidenceRow: {
    flexWrap: 'wrap',
    gap: Spacing.xl,
  },
  evidenceBlock: {
    minWidth: 120,
    gap: Spacing.xs,
  },
  input: {
    minHeight: 112,
    textAlignVertical: 'top',
  },
  limitationsCard: { gap: Spacing.sm },
});
