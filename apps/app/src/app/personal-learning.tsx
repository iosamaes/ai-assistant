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
import { Controls, Palette, Spacing } from '@/constants/theme';
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
  return actionId;
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
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-QA-u-nu-latn' : 'en', { dateStyle: 'medium' }).format(parsed);
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

  return (
    <Screen>
      <View style={styles.hero}>
        <MizanText variant="label" muted>{labels.eyebrow}</MizanText>
        <MizanText variant="display">{labels.title}</MizanText>
        <MizanText muted>{labels.body}</MizanText>
      </View>

      {status === 'loading' ? <MizanText accessibilityLiveRegion="polite" muted>{labels.loading}</MizanText> : null}
      {status === 'error' ? <MizanText accessibilityLiveRegion="polite" muted>{labels.error}</MizanText> : null}
      {status === 'ready' && visible.length === 0 ? (
        <Card>
          <MizanText accessibilityLiveRegion="polite" muted>{labels.empty}</MizanText>
          <MizanText variant="caption" muted>{labels.adherenceRule}</MizanText>
        </Card>
      ) : null}

      {status === 'ready' ? visible.map((action) => {
        const estimateLabel = responseLabel(action.estimate.usefulness, locale);
        const freshness = action.estimate.confidence.freshnessDays;
        return (
          <Card key={action.actionId}>
            <MizanText variant="title">{actionLabel(action.actionId, locale)}</MizanText>
            <View style={styles.metrics}>
              <View style={[styles.metricRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <MizanText muted>{labels.samples}</MizanText>
                <MizanText variant="label">{formatLocalizedNumber(action.estimate.feedbackCount, locale, 0)}</MizanText>
              </View>
              <View style={[styles.metricRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <MizanText muted>{labels.confidence}</MizanText>
                <MizanText variant="label">{confidenceLabel(action.estimate.confidence.level, locale)}</MizanText>
              </View>
              <View style={[styles.metricRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <MizanText muted>{labels.recency}</MizanText>
                <MizanText variant="label">
                  {freshness === null
                    ? '—'
                    : freshness < 1
                      ? labels.today
                      : `${formatLocalizedNumber(Math.round(freshness), locale, 0)} ${labels.days}`}
                </MizanText>
              </View>
            </View>

            <View style={[styles.learningBox, { borderTopColor: palette.border }]}>
              <MizanText variant="label">{labels.estimate}</MizanText>
              <MizanText muted>{estimateLabel ?? labels.noEstimate}</MizanText>
            </View>

            {action.outcomes.length > 0 ? (
              <View style={styles.history}>
                <MizanText variant="label">{labels.recent}</MizanText>
                {action.outcomes.slice(0, 3).map((outcome) => (
                  <View key={outcome.id} style={[styles.outcome, { borderTopColor: palette.border }]}>
                    <View style={[styles.metricRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                      <MizanText variant="caption" muted>{formatDate(outcome.observedAt, locale)}</MizanText>
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

            <MizanText variant="caption" muted>{labels.adherenceRule}</MizanText>
          </Card>
        );
      }) : null}

      <SecondaryButton compact label={labels.back} onPress={() => router.replace('/settings')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.md },
  metrics: { gap: Spacing.sm },
  metricRow: { alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
  learningBox: { borderTopWidth: Controls.borderWidth, paddingTop: Spacing.md, gap: Spacing.xs },
  history: { gap: Spacing.sm },
  outcome: { borderTopWidth: Controls.borderWidth, paddingTop: Spacing.sm, gap: Spacing.xs },
});
