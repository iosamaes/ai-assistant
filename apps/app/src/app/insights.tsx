import type { ConfidenceLevel, RelationshipStatus } from '@mizan/core';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import {
  loadInsightsSnapshot,
  type InsightRelationshipKey,
  type InsightsSnapshot,
  type PersonalInsight,
} from '@/application/insights';
import { Card, MizanText, PrimaryButton, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Controls, Palette, Spacing } from '@/constants/theme';
import { formatLocalizedNumber } from '@/i18n/number-input';
import { useAppState } from '@/state/app-state';

type LoadStatus = 'loading' | 'ready' | 'error';

const copy = {
  ar: {
    eyebrow: 'ميزان',
    title: 'الرؤى والأنماط',
    body: 'يعرض ميزان العلاقات التي ظهرت مرارًا في ملاحظاتك المقترنة خلال آخر 90 يومًا. الارتباط لا يعني أن أحد العاملين سبّب الآخر.',
    back: 'اليوم',
    loading: 'جاري فحص الأنماط الشخصية…',
    error: 'تعذر قراءة تاريخ الملاحظات الآن. لم يتم إنشاء نمط بديل أو افتراض بيانات مفقودة.',
    empty: 'لا توجد علاقة مدعومة بعد بعدد كافٍ من الملاحظات المقترنة. استمر في الفحوص السريعة، وسيعرض ميزان نمطًا فقط عندما تتوفر أدلة كافية.',
    checkIn: 'أضف فحصًا سريعًا',
    status: 'نوع الاستنتاج',
    confidence: 'الثقة',
    samples: 'الملاحظات المقترنة',
    window: 'نافذة الأدلة',
    effect: 'مؤشر الارتباط',
    days: 'يوم',
    association: 'ارتباط ملحوظ',
    hypothesis: 'فرضية شخصية',
    known: 'معروف',
    likely: 'مرجح',
    possible: 'محتمل',
    insufficient: 'غير كافٍ',
    sameDirection: 'في بياناتك المقترنة، تحرك العاملان غالبًا في الاتجاه نفسه.',
    oppositeDirection: 'في بياناتك المقترنة، تحرك العاملان غالبًا في اتجاهين متعاكسين.',
    noDirection: 'لم يظهر اتجاه ثابت بوضوح في الملاحظات المقترنة.',
    caveat: 'هذه قراءة وصفية لبياناتك الشخصية وليست تشخيصًا أو إثباتًا للسببية. حتى الفرضية الشخصية تظل قابلة للتغير مع وصول بيانات جديدة.',
    relationships: {
      recovery_energy: 'التعافي والطاقة',
      mental_load_energy: 'الحمل الذهني والطاقة',
      connection_energy: 'التواصل والطاقة',
      mental_load_control: 'الحمل الذهني والإحساس بالتحكم',
    },
  },
  en: {
    eyebrow: 'MIZAN',
    title: 'Insights and patterns',
    body: 'MIZAN shows relationships that repeatedly appear in your paired observations from the last 90 days. Association does not mean one factor caused the other.',
    back: 'Today',
    loading: 'Reviewing personal patterns…',
    error: 'Observation history could not be read right now. MIZAN did not invent a substitute pattern or fill missing data.',
    empty: 'No relationship has enough paired observations yet. Keep using quick check-ins; MIZAN will surface a pattern only when there is enough evidence.',
    checkIn: 'Add a quick check-in',
    status: 'Interpretation',
    confidence: 'Confidence',
    samples: 'Paired observations',
    window: 'Evidence window',
    effect: 'Association indicator',
    days: 'days',
    association: 'Observed association',
    hypothesis: 'Personal hypothesis',
    known: 'Known',
    likely: 'Likely',
    possible: 'Possible',
    insufficient: 'Insufficient',
    sameDirection: 'In your paired observations, the two signals have usually moved in the same direction.',
    oppositeDirection: 'In your paired observations, the two signals have usually moved in opposite directions.',
    noDirection: 'No stable direction is clear in the paired observations.',
    caveat: 'This is a descriptive reading of your personal data, not a diagnosis or proof of causation. Even a personal hypothesis can change as new evidence arrives.',
    relationships: {
      recovery_energy: 'Recovery and energy',
      mental_load_energy: 'Mental load and energy',
      connection_energy: 'Connection and energy',
      mental_load_control: 'Mental load and perceived control',
    },
  },
} as const;

function confidenceLabel(level: ConfidenceLevel, locale: 'ar' | 'en') {
  const local = copy[locale];
  if (level === 'known') return local.known;
  if (level === 'likely') return local.likely;
  if (level === 'possible') return local.possible;
  return local.insufficient;
}

function statusLabel(status: RelationshipStatus, locale: 'ar' | 'en') {
  const local = copy[locale];
  return status === 'hypothesis' ? local.hypothesis : local.association;
}

function directionLabel(insight: PersonalInsight, locale: 'ar' | 'en') {
  const local = copy[locale];
  if (insight.hypothesis.direction === 'positive') return local.sameDirection;
  if (insight.hypothesis.direction === 'negative') return local.oppositeDirection;
  return local.noDirection;
}

function InsightCard({ insight, locale, isRtl }: { insight: PersonalInsight; locale: 'ar' | 'en'; isRtl: boolean }) {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const local = copy[locale];
  const key: InsightRelationshipKey = insight.key;
  const window = insight.hypothesis.windowDays === null
    ? '—'
    : `${formatLocalizedNumber(Math.max(1, Math.round(insight.hypothesis.windowDays)), locale, 0)} ${local.days}`;
  const effect = insight.hypothesis.effect === null
    ? '—'
    : formatLocalizedNumber(insight.hypothesis.effect, locale, 2);

  return (
    <Card>
      <MizanText variant="title">{local.relationships[key]}</MizanText>
      <MizanText muted>{directionLabel(insight, locale)}</MizanText>
      <View style={[styles.detailRow, { flexDirection: isRtl ? 'row-reverse' : 'row', borderTopColor: palette.border }]}>
        <MizanText variant="caption" muted style={styles.detailText}>{local.status}</MizanText>
        <MizanText variant="label" style={styles.detailText}>{statusLabel(insight.hypothesis.status, locale)}</MizanText>
      </View>
      <View style={[styles.detailRow, { flexDirection: isRtl ? 'row-reverse' : 'row', borderTopColor: palette.border }]}>
        <MizanText variant="caption" muted style={styles.detailText}>{local.confidence}</MizanText>
        <MizanText variant="label" style={styles.detailText}>{confidenceLabel(insight.hypothesis.confidence.level, locale)}</MizanText>
      </View>
      <View style={[styles.detailRow, { flexDirection: isRtl ? 'row-reverse' : 'row', borderTopColor: palette.border }]}>
        <MizanText variant="caption" muted style={styles.detailText}>{local.samples}</MizanText>
        <MizanText variant="label" style={styles.detailText}>{formatLocalizedNumber(insight.hypothesis.sampleSize, locale, 0)}</MizanText>
      </View>
      <View style={[styles.detailRow, { flexDirection: isRtl ? 'row-reverse' : 'row', borderTopColor: palette.border }]}>
        <MizanText variant="caption" muted style={styles.detailText}>{local.window}</MizanText>
        <MizanText variant="label" style={styles.detailText}>{window}</MizanText>
      </View>
      <View style={[styles.detailRow, { flexDirection: isRtl ? 'row-reverse' : 'row', borderTopColor: palette.border }]}>
        <MizanText variant="caption" muted style={styles.detailText}>{local.effect}</MizanText>
        <MizanText variant="label" style={styles.detailText}>{effect}</MizanText>
      </View>
    </Card>
  );
}

export default function InsightsScreen() {
  const { isRtl, locale, refreshSession, userId } = useAppState();
  const [snapshot, setSnapshot] = useState<InsightsSnapshot | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const local = copy[locale];

  useEffect(() => {
    let active = true;
    void (async () => {
      await Promise.resolve();
      if (!active) return;
      if (!userId) {
        setSnapshot(null);
        setStatus('ready');
        return;
      }

      setStatus('loading');
      const result = await loadInsightsSnapshot(userId);
      if (!active) return;
      if (result.ok) {
        setSnapshot(result.value);
        setStatus('ready');
        return;
      }
      if (result.error.kind === 'session-expired') await refreshSession();
      if (active) setStatus('error');
    })();

    return () => { active = false; };
  }, [refreshSession, userId]);

  return (
    <Screen>
      <View style={[styles.topRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        <View style={styles.heading}>
          <MizanText variant="label" muted>{local.eyebrow}</MizanText>
          <MizanText variant="display">{local.title}</MizanText>
        </View>
        <SecondaryButton compact label={local.back} onPress={() => router.replace('/today')} />
      </View>

      <Card>
        <MizanText muted>{local.body}</MizanText>
        <MizanText variant="caption" muted>{local.caveat}</MizanText>
        <PrimaryButton label={local.checkIn} onPress={() => router.push('/check-in')} />
      </Card>

      {status === 'loading' ? <MizanText accessibilityLiveRegion="polite" muted>{local.loading}</MizanText> : null}
      {status === 'error' ? <Card><MizanText accessibilityLiveRegion="polite" muted>{local.error}</MizanText></Card> : null}
      {status === 'ready' && (snapshot?.insights.length ?? 0) === 0 ? (
        <Card><MizanText accessibilityLiveRegion="polite" muted>{local.empty}</MizanText></Card>
      ) : null}
      {status === 'ready' ? snapshot?.insights.map((insight) => (
        <InsightCard key={insight.key} insight={insight} locale={locale} isRtl={isRtl} />
      )) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.lg, flexWrap: 'wrap' },
  heading: { flex: 1, minWidth: 0, gap: Spacing.xs },
  detailRow: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
    flexWrap: 'wrap',
    borderTopWidth: Controls.borderWidth,
    paddingTop: Spacing.sm,
  },
  detailText: { flexShrink: 1 },
});
