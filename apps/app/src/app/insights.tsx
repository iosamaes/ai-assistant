import type { ConfidenceLevel, RelationshipStatus } from '@mizan/core';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import {
  loadInsightsSnapshot,
  type InsightRelationshipKey,
  type InsightsSnapshot,
  type PersonalInsight,
} from '@/application/insights';
import { Card, MizanText } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Controls, Interaction, Palette, Radius, Spacing } from '@/constants/theme';
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
  const window = insight.hypothesis.windowDays === null ? '—' : `${Math.max(1, Math.round(insight.hypothesis.windowDays))} ${local.days}`;
  const effect = insight.hypothesis.effect === null ? '—' : insight.hypothesis.effect.toFixed(2);

  return (
    <Card>
      <MizanText variant="title">{local.relationships[key]}</MizanText>
      <MizanText muted>{directionLabel(insight, locale)}</MizanText>
      <View style={[styles.detailRow, { flexDirection: isRtl ? 'row-reverse' : 'row', borderTopColor: palette.border }]}>
        <MizanText variant="caption" muted>{local.status}</MizanText>
        <MizanText variant="label">{statusLabel(insight.hypothesis.status, locale)}</MizanText>
      </View>
      <View style={[styles.detailRow, { flexDirection: isRtl ? 'row-reverse' : 'row', borderTopColor: palette.border }]}>
        <MizanText variant="caption" muted>{local.confidence}</MizanText>
        <MizanText variant="label">{confidenceLabel(insight.hypothesis.confidence.level, locale)}</MizanText>
      </View>
      <View style={[styles.detailRow, { flexDirection: isRtl ? 'row-reverse' : 'row', borderTopColor: palette.border }]}>
        <MizanText variant="caption" muted>{local.samples}</MizanText>
        <MizanText variant="label">{insight.hypothesis.sampleSize}</MizanText>
      </View>
      <View style={[styles.detailRow, { flexDirection: isRtl ? 'row-reverse' : 'row', borderTopColor: palette.border }]}>
        <MizanText variant="caption" muted>{local.window}</MizanText>
        <MizanText variant="label">{window}</MizanText>
      </View>
      <View style={[styles.detailRow, { flexDirection: isRtl ? 'row-reverse' : 'row', borderTopColor: palette.border }]}>
        <MizanText variant="caption" muted>{local.effect}</MizanText>
        <MizanText variant="label">{effect}</MizanText>
      </View>
    </Card>
  );
}

export default function InsightsScreen() {
  const { isRtl, locale, refreshSession, userId } = useAppState();
  const [snapshot, setSnapshot] = useState<InsightsSnapshot | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
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
        <Link href="/today" asChild>
          <Pressable
            accessibilityLabel={local.back}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.backButton,
              {
                borderColor: palette.border,
                backgroundColor: palette.surface,
                opacity: pressed ? Interaction.subtlePressed : 1,
              },
            ]}>
            <MizanText variant="label">{local.back}</MizanText>
          </Pressable>
        </Link>
      </View>

      <Card>
        <MizanText muted>{local.body}</MizanText>
        <MizanText variant="caption" muted>{local.caveat}</MizanText>
        <Link href="/check-in" asChild>
          <Pressable
            accessibilityLabel={local.checkIn}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.primaryAction,
              { backgroundColor: palette.accent, opacity: pressed ? Interaction.pressed : 1 },
            ]}>
            <MizanText variant="label" style={[styles.primaryActionText, { color: palette.onAccent }]}>
              {local.checkIn}
            </MizanText>
          </Pressable>
        </Link>
      </Card>

      {status === 'loading' ? <MizanText muted>{local.loading}</MizanText> : null}
      {status === 'error' ? <Card><MizanText muted>{local.error}</MizanText></Card> : null}
      {status === 'ready' && (snapshot?.insights.length ?? 0) === 0 ? <Card><MizanText muted>{local.empty}</MizanText></Card> : null}
      {status === 'ready' ? snapshot?.insights.map((insight) => (
        <InsightCard key={insight.key} insight={insight} locale={locale} isRtl={isRtl} />
      )) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { alignItems: 'center', justifyContent: 'space-between', gap: Spacing.lg },
  heading: { flex: 1, gap: Spacing.xs },
  backButton: {
    minHeight: Controls.minimumTouchHeight,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    borderWidth: Controls.borderWidth,
    borderRadius: Radius.pill,
  },
  primaryAction: {
    minHeight: Controls.actionHeight,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  primaryActionText: { textAlign: 'center' },
  detailRow: { alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md, borderTopWidth: Controls.borderWidth, paddingTop: Spacing.sm },
});
