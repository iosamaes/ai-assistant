import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import {
  cancelExperiment,
  completeExperimentWithOutcome,
  experimentTemplates,
  loadExperimentHistory,
  startExperiment,
  type ExperimentTemplateId,
  type ExperimentWithEvaluation,
} from '@/application/experiments';
import { AppIcon, type AppIconName } from '@/components/app-icon';
import {
  Card,
  ChoiceChip,
  MizanText,
  MizanTextInput,
  PrimaryButton,
  SecondaryButton,
} from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Controls, Interaction, Palette, Radius, Spacing } from '@/constants/theme';
import { formatLocalizedNumber } from '@/i18n/number-input';
import { useAppState } from '@/state/app-state';

const templateIds = Object.keys(experimentTemplates) as ExperimentTemplateId[];
const DAY_MS = 86_400_000;

const copy = {
  ar: {
    eyebrow: 'تجارب شخصية',
    title: 'اختبر فرضية صغيرة على حياتك',
    body: 'تجارب ميزان اختيارية ومحدودة المدة. الهدف هو جمع دليل شخصي متواضع، لا إثبات سبب علمي أو اتخاذ قرار طبي.',
    choose: 'اختر تجربة',
    chooseBody: 'ابدأ بتغيير واحد صغير وحدد ما الذي تريد ملاحظته خلال فترة قصيرة وواضحة.',
    newExperiment: 'تجربة جديدة',
    newExperimentBody: 'اختر فئة، راجع المدة والمؤشر، ثم عدّل الفرضية بما يناسبك.',
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
    progress: 'التقدم الزمني',
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
    unknownExperiment: 'تجربة شخصية',
    unknownMetric: 'مؤشر متابع',
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
    newExperiment: 'New experiment',
    newExperimentBody: 'Choose a category, review the window and outcome, then make the hypothesis your own.',
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
    progress: 'Time progress',
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
    unknownExperiment: 'Personal experiment',
    unknownMetric: 'Observed measure',
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

function formatExperimentDate(value: string, locale: 'ar' | 'en'): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return '—';
  const date = new Date(timestamp);
  try {
    return date.toLocaleDateString(locale === 'ar' ? 'ar-QA-u-nu-latn' : 'en-QA-u-nu-latn');
  } catch {
    return '—';
  }
}

function templateIcon(templateId: ExperimentTemplateId | null): AppIconName {
  if (templateId === 'earlier-bedtime') return 'recovery';
  if (templateId === 'quiet-focus') return 'mentalLoad';
  if (templateId === 'short-walk') return 'energy';
  return 'hypothesis';
}

function statusIcon(status: string): AppIconName {
  if (status === 'active') return 'oneMove';
  if (status === 'completed') return 'evidence';
  if (status === 'cancelled') return 'trendFlat';
  return 'pattern';
}

function activeTimeProgress(item: ExperimentWithEvaluation): number | null {
  if (item.experiment.status !== 'active' || item.experiment.duration_days <= 0) return null;
  const startedAt = Date.parse(item.experiment.started_at ?? item.experiment.created_at);
  if (!Number.isFinite(startedAt)) return null;
  const elapsed = Date.now() - startedAt;
  return Math.max(0, Math.min(1, elapsed / (item.experiment.duration_days * DAY_MS)));
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
  const [historyOwnerId, setHistoryOwnerId] = useState<string | null>(null);
  const [ratingById, setRatingById] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const activeUserRef = useRef(userId);
  const loadRequestRef = useRef(0);
  const mutationRequestRef = useRef(0);
  activeUserRef.current = userId;

  const visibleHistory = historyOwnerId === userId ? history : [];

  const load = useCallback(async () => {
    const requestedUserId = userId;
    const requestId = ++loadRequestRef.current;
    const requestIsCurrent = () =>
      loadRequestRef.current === requestId && activeUserRef.current === requestedUserId;

    setHistory([]);
    setHistoryOwnerId(null);
    setMessage(null);
    if (!requestedUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const result = await loadExperimentHistory(requestedUserId);
    if (!requestIsCurrent()) return;

    if (!result.ok) {
      if (result.error.kind === 'session-expired') {
        await refreshSession();
        if (!requestIsCurrent()) return;
      }
      setMessage(labels.loadError);
    } else {
      setHistory(result.value);
      setHistoryOwnerId(requestedUserId);
    }
    setLoading(false);
  }, [labels.loadError, refreshSession, userId]);

  useEffect(() => {
    mutationRequestRef.current += 1;
    setBusy(false);
    setMessage(null);
    setRatingById({});
    setConsented(false);
  }, [userId]);

  useEffect(() => {
    void load();
    return () => {
      loadRequestRef.current += 1;
    };
  }, [load]);

  const activeExperiment = useMemo(
    () => visibleHistory.find((item) => item.experiment.status === 'active') ?? null,
    [visibleHistory],
  );

  const start = async () => {
    const requestedUserId = userId;
    if (!requestedUserId || loading || busy || activeExperiment || !consented || hypothesis.trim().length < 8) return;
    const requestId = ++mutationRequestRef.current;
    const requestIsCurrent = () =>
      mutationRequestRef.current === requestId && activeUserRef.current === requestedUserId;

    setBusy(true);
    setMessage(null);
    const result = await startExperiment({ userId: requestedUserId, templateId: selected, hypothesis, consented });
    if (!requestIsCurrent()) return;

    if (!result.ok) {
      if (result.error.kind === 'session-expired') {
        await refreshSession();
        if (!requestIsCurrent()) return;
      }
      setMessage(labels.saveError);
    } else {
      setConsented(false);
      await load();
      if (!requestIsCurrent()) return;
    }
    setBusy(false);
  };

  const stop = async (experimentId: string) => {
    const requestedUserId = userId;
    if (!requestedUserId || busy) return;
    const requestId = ++mutationRequestRef.current;
    const requestIsCurrent = () =>
      mutationRequestRef.current === requestId && activeUserRef.current === requestedUserId;

    setBusy(true);
    setMessage(null);
    const result = await cancelExperiment(requestedUserId, experimentId);
    if (!requestIsCurrent()) return;

    if (!result.ok) {
      if (result.error.kind === 'session-expired') {
        await refreshSession();
        if (!requestIsCurrent()) return;
      }
      setMessage(labels.saveError);
    } else {
      await load();
      if (!requestIsCurrent()) return;
    }
    setBusy(false);
  };

  const finish = async (item: ExperimentWithEvaluation) => {
    const requestedUserId = userId;
    if (!requestedUserId || busy) return;
    const usefulness = ratingById[item.experiment.id];
    if (!usefulness) return;
    const requestId = ++mutationRequestRef.current;
    const requestIsCurrent = () =>
      mutationRequestRef.current === requestId && activeUserRef.current === requestedUserId;

    setBusy(true);
    setMessage(null);
    const result = await completeExperimentWithOutcome({
      userId: requestedUserId,
      experiment: item.experiment,
      usefulness,
    });
    if (!requestIsCurrent()) return;

    if (!result.ok) {
      if (result.error.kind === 'session-expired') {
        await refreshSession();
        if (!requestIsCurrent()) return;
      }
      setMessage(labels.saveError);
    } else {
      setRatingById((current) => {
        const next = { ...current };
        delete next[item.experiment.id];
        return next;
      });
      await load();
      if (!requestIsCurrent()) return;
    }
    setBusy(false);
  };

  const renderExperiment = (item: ExperimentWithEvaluation) => {
    const experiment = item.experiment;
    const evaluation = item.evaluation;
    const templateId = experiment.template_id as ExperimentTemplateId | null;
    const metricLabel = (labels.metrics as Record<string, string>)[experiment.metric] ?? labels.unknownMetric;
    const templateLabel = templateId && templateId in labels.templates
      ? labels.templates[templateId].label
      : labels.unknownExperiment;
    const selectedRating = ratingById[experiment.id] ?? 0;
    const startedAt = formatExperimentDate(experiment.started_at ?? experiment.created_at, locale);
    const isActive = experiment.status === 'active';
    const progress = activeTimeProgress(item);
    const progressPercent = progress === null ? null : Math.round(progress * 100);
    const progressLabel = progressPercent === null
      ? null
      : `${formatLocalizedNumber(progressPercent, locale, 0)}%`;

    return (
      <Card key={experiment.id} style={isActive ? { borderColor: palette.accent } : undefined}>
        <View style={[styles.experimentHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={[styles.experimentIdentity, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <View style={[styles.iconBadge, { backgroundColor: palette.accentSoft }]}>
              <AppIcon name={templateIcon(templateId)} color={palette.accent} size={22} />
            </View>
            <View style={styles.flexibleText}>
              <MizanText variant="label" muted>{isActive ? labels.active : labels.resultReading}</MizanText>
              <MizanText variant="title">{templateLabel}</MizanText>
            </View>
          </View>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: isActive ? palette.accentSoft : palette.surfaceMuted,
                flexDirection: isRtl ? 'row-reverse' : 'row',
              },
            ]}
          >
            <AppIcon name={statusIcon(experiment.status)} color={isActive ? palette.accent : palette.textMuted} size={16} />
            <MizanText variant="caption">{labels.statuses[experiment.status]}</MizanText>
          </View>
        </View>

        <MizanText>{experiment.hypothesis}</MizanText>

        <View style={[styles.metadataGrid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={[styles.metadataTile, { backgroundColor: palette.surfaceMuted }]}>
            <View style={[styles.metadataLabelRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <AppIcon name="margin" color={palette.textMuted} size={16} />
              <MizanText variant="caption" muted>{labels.duration}</MizanText>
            </View>
            <MizanText variant="label">
              {formatLocalizedNumber(experiment.duration_days, locale, 0)} {labels.days}
            </MizanText>
          </View>
          <View style={[styles.metadataTile, { backgroundColor: palette.surfaceMuted }]}>
            <View style={[styles.metadataLabelRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <AppIcon name={templateIcon(templateId)} color={palette.textMuted} size={16} />
              <MizanText variant="caption" muted>{labels.metric}</MizanText>
            </View>
            <MizanText variant="label">{metricLabel}</MizanText>
          </View>
          <View style={[styles.metadataTile, { backgroundColor: palette.surfaceMuted }]}>
            <View style={[styles.metadataLabelRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <AppIcon name="pattern" color={palette.textMuted} size={16} />
              <MizanText variant="caption" muted>{labels.started}</MizanText>
            </View>
            <MizanText variant="label">{startedAt}</MizanText>
          </View>
        </View>

        {isActive && progress !== null && progressLabel ? (
          <View style={styles.progressGroup}>
            <View style={[styles.progressHeading, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={[styles.metadataLabelRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <AppIcon name="margin" color={palette.accent} size={16} />
                <MizanText variant="label">{labels.progress}</MizanText>
              </View>
              <MizanText variant="label">{progressLabel}</MizanText>
            </View>
            <View
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: 100, now: progressPercent ?? 0, text: progressLabel }}
              style={[styles.progressTrack, { backgroundColor: palette.surfaceMuted }]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    alignSelf: isRtl ? 'flex-end' : 'flex-start',
                    backgroundColor: palette.accent,
                    width: `${progressPercent ?? 0}%`,
                  },
                ]}
              />
            </View>
          </View>
        ) : null}

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
              <View style={[styles.metadataLabelRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <AppIcon name="pattern" color={palette.accent} size={16} />
                <MizanText variant="caption" muted>{labels.outcome}</MizanText>
              </View>
              <MizanText variant="title">{labels.outcomes[evaluation.outcome]}</MizanText>
            </View>

            <MizanText variant="label">{labels.comparison}</MizanText>
            <View style={[styles.comparisonGrid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
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
                <View style={[styles.metadataLabelRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <AppIcon name="evidence" color={palette.accent} size={16} />
                  <MizanText variant="caption" muted>{labels.evidence}</MizanText>
                </View>
                <MizanText variant="label">
                  {formatLocalizedNumber(
                    evaluation.baselineEvidenceCount + evaluation.followupEvidenceCount,
                    locale,
                    0,
                  )}
                </MizanText>
              </View>
              <View style={styles.evidenceBlock}>
                <View style={[styles.metadataLabelRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <AppIcon name="confidence" color={palette.accent} size={16} />
                  <MizanText variant="caption" muted>{labels.confidence}</MizanText>
                </View>
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
        <View style={[styles.heroIdentity, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={[styles.heroIcon, { backgroundColor: palette.surface }]}>
            <AppIcon name="hypothesis" color={palette.accent} size={28} />
          </View>
          <View style={styles.flexibleText}>
            <MizanText variant="title">{labels.eyebrow}</MizanText>
            <MizanText>{labels.body}</MizanText>
          </View>
        </View>
        <MizanText variant="caption" muted>{labels.noScore}</MizanText>
      </Card>

      {!activeExperiment ? (
        <Card style={styles.plannerCard}>
          <View style={[styles.plannerHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <View style={[styles.iconBadge, { backgroundColor: palette.accentSoft }]}>
              <AppIcon name="oneMove" color={palette.accent} size={22} />
            </View>
            <View style={styles.flexibleText}>
              <MizanText variant="label" muted>{labels.newExperiment}</MizanText>
              <MizanText variant="title">{labels.choose}</MizanText>
              <MizanText muted>{labels.newExperimentBody}</MizanText>
            </View>
          </View>

          <View style={[styles.templateGrid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            {templateIds.map((id) => {
              const template = experimentTemplates[id];
              const isSelected = selected === id;
              return (
                <Pressable
                  key={id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected, disabled: loading || busy }}
                  accessibilityLabel={labels.templates[id].label}
                  disabled={loading || busy}
                  onPress={() => {
                    setSelected(id);
                    setHypothesis(labels.templates[id].hypothesis);
                    setConsented(false);
                  }}
                  style={({ pressed }) => [
                    styles.templateOption,
                    {
                      backgroundColor: isSelected ? palette.accentSoft : palette.surfaceMuted,
                      borderColor: isSelected ? palette.accent : palette.border,
                      opacity: pressed ? Interaction.subtlePressed : 1,
                    },
                  ]}
                >
                  <View style={[styles.templateIdentity, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.iconBadge, { backgroundColor: palette.surface }]}>
                      <AppIcon name={templateIcon(id)} color={isSelected ? palette.accent : palette.textMuted} size={22} />
                    </View>
                    <View style={styles.flexibleText}>
                      <MizanText variant="label">{labels.templates[id].label}</MizanText>
                      <MizanText variant="caption" muted>{labels.metrics[template.metric]}</MizanText>
                    </View>
                  </View>
                  <View style={[styles.metadataLabelRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <AppIcon name="margin" color={palette.textMuted} size={15} />
                    <MizanText variant="caption" muted>
                      {formatLocalizedNumber(template.durationDays, locale, 0)} {labels.days}
                    </MizanText>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.sectionIntro}>
            <MizanText variant="label">{labels.chooseBody}</MizanText>
          </View>

          <View style={[styles.planStats, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <View style={[styles.planStat, { backgroundColor: palette.surfaceMuted }]}>
              <View style={[styles.metadataLabelRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <AppIcon name="margin" color={palette.textMuted} size={16} />
                <MizanText variant="caption" muted>{labels.duration}</MizanText>
              </View>
              <MizanText variant="title">
                {formatLocalizedNumber(experimentTemplates[selected].durationDays, locale, 0)} {labels.days}
              </MizanText>
            </View>
            <View style={[styles.planStat, { backgroundColor: palette.surfaceMuted }]}>
              <View style={[styles.metadataLabelRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <AppIcon name={templateIcon(selected)} color={palette.textMuted} size={16} />
                <MizanText variant="caption" muted>{labels.metric}</MizanText>
              </View>
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

          <View style={[styles.consentPanel, { backgroundColor: palette.accentSoft }]}>
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

        {!loading && visibleHistory.length === 0 ? (
          <Card style={{ backgroundColor: palette.surfaceMuted }}>
            <MizanText accessibilityLiveRegion="polite" variant="title">{labels.empty}</MizanText>
            <MizanText muted>{labels.emptyBody}</MizanText>
          </Card>
        ) : null}

        {visibleHistory.map(renderExperiment)}
      </View>

      <Card style={[styles.limitationsCard, { backgroundColor: palette.surfaceMuted }]}>
        <View style={[styles.metadataLabelRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <AppIcon name="hypothesis" color={palette.textMuted} size={16} />
          <MizanText variant="label">{labels.limitationsTitle}</MizanText>
        </View>
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
  heroCard: { gap: Spacing.lg },
  heroIdentity: { alignItems: 'flex-start', gap: Spacing.md },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plannerCard: { gap: Spacing.xl },
  plannerHeader: { alignItems: 'flex-start', gap: Spacing.md },
  section: { gap: Spacing.lg },
  sectionIntro: { gap: Spacing.xs },
  chips: { flexWrap: 'wrap', gap: Spacing.sm },
  templateGrid: {
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  templateOption: {
    flexGrow: 1,
    flexBasis: 210,
    minHeight: 112,
    borderWidth: Controls.borderWidth,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  templateIdentity: { alignItems: 'center', gap: Spacing.md },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  planStats: {
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  planStat: {
    flexGrow: 1,
    flexBasis: 220,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
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
  experimentIdentity: {
    flex: 1,
    minWidth: 220,
    alignItems: 'center',
    gap: Spacing.md,
  },
  statusPill: {
    minHeight: 36,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metadataGrid: {
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
  metadataLabelRow: { alignItems: 'center', gap: Spacing.xs },
  progressGroup: { gap: Spacing.sm },
  progressHeading: { alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
  progressTrack: {
    height: 8,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.pill,
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
    gap: Spacing.sm,
  },
  comparisonGrid: {
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
