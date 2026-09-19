import type { ConfidenceLevel } from '@mizan/core';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import {
  loadPersonalLearning,
  type PersonalLearningAction,
} from '@/application/personal-learning';
import { Card, MizanText, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Controls, Palette, Radius, Spacing } from '@/constants/theme';
import { formatLocalizedNumber } from '@/i18n/number-input';
import { useAppState } from '@/state/app-state';

type LoadStatus = 'loading' | 'ready' | 'error';

const copy = {
  ar: {
    eyebrow: 'تعلّم ميزان الشخصي',
    title: 'ما الذي تعلّمناه من تجربتك؟',
    body: 'يعتمد هذا القسم فقط على تقييمات الأثر التي سجلتها أنت بعد تجربة الخطوة. تنفيذ الخطوة وحده دليل التزام، وليس دليلًا على أنها أفادتك.',
    loading: 'جارٍ تحميل سجل التعلّم الشخصي…',
    error: 'تعذر تحميل سجل التعلّم الشخصي الآن.',
    empty: 'لا توجد تقييمات أثر صريحة بعد. عندما تجرّب خطوة وتسجل فائدتها، ستظهر هنا.',
    samples: 'تقييمات الأثر',
    learnedActions: 'خطوات لها دليل',
    totalReports: 'إجمالي التقييمات',
    confidence: 'الثقة',
    recency: 'أحدث دليل',
    days: 'يوم',
    today: 'اليوم',
    estimate: 'تقدير الاستجابة الشخصية',
    noEstimate: 'الدليل غير كافٍ لتقدير الاستجابة الشخصية بعد.',
    recent: 'أحدث التقييمات الصريحة',
    rating: 'الفائدة المسجلة',
    note: 'ملاحظتك',
    noNote: 'لا توجد ملاحظة نصية.',
    adherenceRule: 'مهم: إكمال الخطوة أو الضغط على «تم» لا يرفع هذا التقدير. الذي يدخل في التعلّم هو تقييم الأثر الصريح فقط.',
    positive: 'يميل إلى فائدة إيجابية لك',
    neutral: 'الأثر الشخصي قريب من المحايد',
    negative: 'يميل إلى أثر غير مفيد لك',
    back: 'العودة للإعدادات',
    actionRecovery: 'احمِ 20 دقيقة للتعافي',
    actionConnection: 'خصص 15 دقيقة لتواصل له معنى',
    actionGeneric: 'خطوة شخصية',
    confidenceKnown: 'ثقة عالية',
    confidenceLikely: 'مرجّح',
    confidencePossible: 'ممكن',
    confidenceInsufficient: 'دليل غير كافٍ',
  },
  en: {
    eyebrow: 'Personal learning',
    title: 'What has MIZAN learned from your experience?',
    body: 'This view uses only outcome ratings you explicitly recorded after trying an action. Completing an action is adherence evidence, not evidence that it helped you.',
    loading: 'Loading your personal learning history…',
    error: 'Your personal learning history could not be loaded right now.',
    empty: 'There are no explicit outcome ratings yet. After you try an action and report its effect, it will appear here.',
    samples: 'Outcome reports',
    learnedActions: 'Actions with evidence',
    totalReports: 'Total outcome reports',
    confidence: 'Confidence',
    recency: 'Freshest evidence',
    days: 'days',
    today: 'today',
    estimate: 'Personal response estimate',
    noEstimate: 'There is not enough evidence to estimate your personal response yet.',
    recent: 'Recent explicit outcome reports',
    rating: 'Reported usefulness',
    note: 'Your note',
    noNote: 'No written note.',
    adherenceRule: 'Important: completing an action or tapping Done does not raise this estimate. Only explicit outcome feedback contributes to benefit learning.',
    positive: 'Tends to be personally helpful',
    neutral: 'Your observed response is near neutral',
    negative: 'Tends not to be personally helpful',
    back: 'Back to settings',
    actionRecovery: 'Protect 20 minutes for recovery',
    actionConnection: 'Set aside 15 minutes for meaningful connection',
    actionGeneric: 'Personal action',
    confidenceKnown: 'High confidence',
    confidenceLikely: 'Likely',
    confidencePossible: 'Possible',
    confidenceInsufficient: 'Insufficient evidence',
  },
} as const;

function actionLabel(actionId: string, locale: 'ar' | 'en'): string {
  const labels = copy[locale];
  if (actionId === 'protect-recovery-window') return labels.actionRecovery;
  if (actionId === 'meaningful-connection') return labels.actionConnection;
  return labels.actionGeneric;
}

function confidenceLabel(level: ConfidenceLevel, locale: 'ar' | 'en'): string {
  const labels = copy[locale];
  if (level === 'known') return labels.confidenceKnown;
  if (level === 'likely') return labels.confidenceLikely;
  if (level === 'possible') return labels.confidencePossible;
  return labels.confidenceInsufficient;
}

function responseLabel(usefulness: number | null, locale: 'ar' | 'en'): string | null {
  if (usefulness === null) return null;
  const labels = copy[locale];
  if (usefulness >= 20) return labels.positive;
  if (usefulness <= -20) return labels.negative;
  return labels.neutral;
}

function formatDate(value: string, locale: 'ar' | 'en'): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-QA-u-nu-latn' : 'en-QA-u-nu-latn', { dateStyle: 'medium' }).format(parsed);
  } catch {
    return parsed.toISOString().slice(0, 10);
  }
}

export default function PersonalLearningScreen() {
  const { isRtl, locale, refreshSession, userId } = useAppState();
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [actions, setActions] = useState<readonly PersonalLearningAction[]>([]);
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const labels = copy[locale];

  useEffect(() => {
    let active = true;
    void (async () => {
      await Promise.resolve();
      if (!active) return;
      if (!userId) {
        setActions([]);
        setStatus('ready');
        return;
      }

      setActions([]);
      setStatus('loading');
      const result = await loadPersonalLearning(userId);
      if (!active) return;
      if (!result.ok) {
        if (result.error.kind === 'session-expired') await refreshSession();
        if (active) setStatus('error');
        return;
      }
      setActions(result.value);
      setStatus('ready');
    })();

    return () => {
      active = false;
    };
  }, [refreshSession, userId]);

  const visible = actions.filter((action) => action.estimate.feedbackCount > 0 || action.outcomes.length > 0);
  const totalReports = visible.reduce((sum, action) => sum + action.estimate.feedbackCount, 0);

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
        <View style={[styles.cardAccent, { backgroundColor: palette.accent }]} />
        <View style={styles.heroCopy}>
          <MizanText variant="title">{labels.eyebrow}</MizanText>
          <MizanText>{labels.body}</MizanText>
          <View style={[styles.ruleBox, { backgroundColor: palette.surface }]}>
            <MizanText variant="caption" muted>{labels.adherenceRule}</MizanText>
          </View>
        </View>
        <View style={styles.heroStats}>
          <View style={[styles.heroStat, { backgroundColor: palette.surface }]}>
            <MizanText variant="caption" muted>{labels.learnedActions}</MizanText>
            <MizanText variant="title">
              {status === 'ready' ? formatLocalizedNumber(visible.length, locale, 0) : '—'}
            </MizanText>
          </View>
          <View style={[styles.heroStat, { backgroundColor: palette.surface }]}>
            <MizanText variant="caption" muted>{labels.totalReports}</MizanText>
            <MizanText variant="title">
              {status === 'ready' ? formatLocalizedNumber(totalReports, locale, 0) : '—'}
            </MizanText>
          </View>
        </View>
      </Card>

      {status === 'loading' ? (
        <Card style={[styles.stateCard, { backgroundColor: palette.surfaceMuted }]}>
          <MizanText accessibilityLiveRegion="polite" muted>{labels.loading}</MizanText>
        </Card>
      ) : null}
      {status === 'error' ? (
        <Card style={[styles.stateCard, { backgroundColor: palette.surfaceMuted }]}>
          <MizanText accessibilityLiveRegion="polite" muted>{labels.error}</MizanText>
        </Card>
      ) : null}
      {status === 'ready' && visible.length === 0 ? (
        <Card style={[styles.stateCard, { backgroundColor: palette.surfaceMuted }]}>
          <MizanText accessibilityLiveRegion="polite" muted>{labels.empty}</MizanText>
          <MizanText variant="caption" muted>{labels.adherenceRule}</MizanText>
        </Card>
      ) : null}

      {status === 'ready' ? (
        <View style={styles.actionGrid}>
          {visible.map((action) => {
            const estimateLabel = responseLabel(action.estimate.usefulness, locale);
            const freshness = action.estimate.confidence.freshnessDays;
            const freshnessLabel = freshness === null
              ? '—'
              : freshness < 1
                ? labels.today
                : `${formatLocalizedNumber(Math.round(freshness), locale, 0)} ${labels.days}`;

            return (
              <Card key={action.actionId} style={styles.actionCard}>
                <View style={[styles.cardAccent, { backgroundColor: palette.accent }]} />
                <View style={[styles.actionHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <MizanText variant="title" style={styles.actionTitle}>{actionLabel(action.actionId, locale)}</MizanText>
                  <View style={[styles.estimatePill, { backgroundColor: palette.accentSoft, borderColor: palette.accent }]}>
                    <MizanText variant="caption">{estimateLabel ?? labels.confidenceInsufficient}</MizanText>
                  </View>
                </View>

                <View style={styles.metricGrid}>
                  <View style={[styles.metricTile, { backgroundColor: palette.surfaceMuted }]}>
                    <MizanText variant="caption" muted>{labels.samples}</MizanText>
                    <MizanText variant="title">{formatLocalizedNumber(action.estimate.feedbackCount, locale, 0)}</MizanText>
                  </View>
                  <View style={[styles.metricTile, { backgroundColor: palette.surfaceMuted }]}>
                    <MizanText variant="caption" muted>{labels.confidence}</MizanText>
                    <MizanText variant="label">{confidenceLabel(action.estimate.confidence.level, locale)}</MizanText>
                  </View>
                  <View style={[styles.metricTile, { backgroundColor: palette.surfaceMuted }]}>
                    <MizanText variant="caption" muted>{labels.recency}</MizanText>
                    <MizanText variant="label">{freshnessLabel}</MizanText>
                  </View>
                </View>

                <View style={[styles.learningBox, { backgroundColor: palette.accentSoft }]}>
                  <MizanText variant="caption" muted>{labels.estimate}</MizanText>
                  <MizanText variant="title">{estimateLabel ?? labels.noEstimate}</MizanText>
                </View>

                {action.outcomes.length > 0 ? (
                  <View style={styles.history}>
                    <MizanText variant="label">{labels.recent}</MizanText>
                    {action.outcomes.slice(0, 3).map((outcome) => (
                      <View key={outcome.id} style={[styles.outcome, { backgroundColor: palette.surfaceMuted }]}>
                        <View style={[styles.metricRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                          <View style={[styles.datePill, { backgroundColor: palette.surface }]}>
                            <MizanText variant="caption" muted>{formatDate(outcome.observedAt, locale)}</MizanText>
                          </View>
                          <MizanText variant="label">
                            {labels.rating}: {formatLocalizedNumber(outcome.usefulness, locale, 0)}/{formatLocalizedNumber(5, locale, 0)}
                          </MizanText>
                        </View>
                        <MizanText variant="caption" muted>
                          {outcome.outcomeNote ? `${labels.note}: ${outcome.outcomeNote}` : labels.noNote}
                        </MizanText>
                      </View>
                    ))}
                  </View>
                ) : null}
              </Card>
            );
          })}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.lg, flexWrap: 'wrap' },
  heading: { flex: 1, minWidth: 0, gap: Spacing.xs },
  heroCard: { gap: Spacing.xl },
  heroCopy: { gap: Spacing.sm },
  cardAccent: { height: 4, borderRadius: Radius.pill, alignSelf: 'stretch' },
  ruleBox: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  heroStats: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  heroStat: { flexGrow: 1, flexShrink: 1, flexBasis: 180, padding: Spacing.lg, borderRadius: Radius.md, gap: Spacing.xs },
  stateCard: { paddingVertical: Spacing.lg },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', gap: Spacing.lg },
  actionCard: { flexGrow: 1, flexShrink: 1, flexBasis: 360, overflow: 'hidden' },
  actionHeader: { alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.lg, flexWrap: 'wrap' },
  actionTitle: { flexGrow: 1, flexShrink: 1, flexBasis: 220 },
  estimatePill: {
    minHeight: Controls.minimumTouchHeight,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: Controls.borderWidth,
  },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  metricTile: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 130,
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  metricRow: { alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md, flexWrap: 'wrap' },
  learningBox: { padding: Spacing.lg, borderRadius: Radius.md, gap: Spacing.xs },
  history: { gap: Spacing.sm },
  outcome: { padding: Spacing.md, borderRadius: Radius.md, gap: Spacing.sm },
  datePill: { minHeight: Controls.minimumTouchHeight, justifyContent: 'center', paddingHorizontal: Spacing.md, borderRadius: Radius.pill },
});
