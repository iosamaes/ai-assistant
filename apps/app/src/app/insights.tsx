import type { ConfidenceLevel, RelationshipStatus } from '@mizan/core';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import {
  loadInsightsSnapshot,
  type InsightRelationshipKey,
  type InsightsSnapshot,
  type PersonalInsight,
} from '@/application/insights';
import { AppIcon, type AppIconName } from '@/components/app-icon';
import { Card, ChoiceChip, MizanText, PrimaryButton, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Controls, Palette, Radius, Spacing } from '@/constants/theme';
import { formatLocalizedNumber } from '@/i18n/number-input';
import { useAppState } from '@/state/app-state';

type LoadStatus = 'loading' | 'ready' | 'error';
type InsightFilter = 'all' | 'association' | 'hypothesis';

const copy = {
  ar: {
    eyebrow: 'ميزان',
    title: 'الرؤى والأنماط',
    body: 'يعرض ميزان العلاقات التي ظهرت مرارًا في ملاحظاتك المقترنة خلال آخر 90 يومًا. الارتباط لا يعني أن أحد العاملين سبّب الآخر.',
    back: 'اليوم',
    loading: 'جاري فحص الأنماط الشخصية…',
    error: 'تعذر قراءة تاريخ الملاحظات الآن. لم يتم إنشاء نمط بديل أو افتراض بيانات مفقودة.',
    empty: 'لا توجد علاقة مدعومة بعد بعدد كافٍ من الملاحظات المقترنة. استمر في الفحوص السريعة، وسيعرض ميزان نمطًا فقط عندما تتوفر أدلة كافية.',
    filterEmpty: 'لا توجد رؤى من هذا النوع ضمن الأدلة المدعومة حاليًا.',
    checkIn: 'أضف فحصًا سريعًا',
    status: 'نوع الاستنتاج',
    confidence: 'الثقة',
    samples: 'الملاحظات المقترنة',
    window: 'نافذة الأدلة',
    effect: 'مؤشر الارتباط',
    patterns: 'الأنماط المدعومة',
    evidenceWindow: 'مدى القراءة',
    days: 'يوم',
    filterLabel: 'تصفية الرؤى',
    all: 'الكل',
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
    filterEmpty: 'There are no currently supported insights in this category.',
    checkIn: 'Add a quick check-in',
    status: 'Interpretation',
    confidence: 'Confidence',
    samples: 'Paired observations',
    window: 'Evidence window',
    effect: 'Association indicator',
    patterns: 'Supported patterns',
    evidenceWindow: 'Reading window',
    days: 'days',
    filterLabel: 'Filter insights',
    all: 'All',
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

function relationshipIcon(key: InsightRelationshipKey): AppIconName {
  if (key === 'recovery_energy') return 'recovery';
  if (key === 'connection_energy') return 'connection';
  return 'mentalLoad';
}

function InsightCard({ insight, locale, isRtl }: { insight: PersonalInsight; locale: 'ar' | 'en'; isRtl: boolean }) {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const local = copy[locale];
  const key: InsightRelationshipKey = insight.key;
  const isHypothesis = insight.hypothesis.status === 'hypothesis';
  const statusIcon: AppIconName = isHypothesis ? 'hypothesis' : 'pattern';
  const accentColor = isHypothesis ? palette.textMuted : palette.accent;
  const window = insight.hypothesis.windowDays === null
    ? '—'
    : `${formatLocalizedNumber(Math.max(1, Math.round(insight.hypothesis.windowDays)), locale, 0)} ${local.days}`;
  const effect = insight.hypothesis.effect === null
    ? '—'
    : formatLocalizedNumber(insight.hypothesis.effect, locale, 2);

  return (
    <Card style={styles.insightCard}>
      <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
      <View style={[styles.insightHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        <View style={[styles.insightIdentity, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={[styles.iconBadge, { backgroundColor: palette.accentSoft }]}>
            <AppIcon name={relationshipIcon(key)} color={palette.accent} size={24} />
          </View>
          <View style={styles.insightCopy}>
            <MizanText variant="title">{local.relationships[key]}</MizanText>
            <View style={[styles.directionBox, { backgroundColor: palette.accentSoft }]}>
              <MizanText muted>{directionLabel(insight, locale)}</MizanText>
            </View>
          </View>
        </View>
        <View style={[styles.statusPill, { backgroundColor: isHypothesis ? palette.surfaceMuted : palette.accentSoft, borderColor: accentColor, flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <AppIcon name={statusIcon} color={accentColor} size={17} />
          <MizanText variant="caption">{statusLabel(insight.hypothesis.status, locale)}</MizanText>
        </View>
      </View>

      <View style={[styles.detailGrid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        <View style={[styles.detailTile, { backgroundColor: palette.surfaceMuted }]}>
          <View style={[styles.tileLabelRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <AppIcon name="confidence" color={palette.accent} size={16} />
            <MizanText variant="caption" muted>{local.confidence}</MizanText>
          </View>
          <MizanText variant="label">{confidenceLabel(insight.hypothesis.confidence.level, locale)}</MizanText>
        </View>
        <View style={[styles.detailTile, { backgroundColor: palette.surfaceMuted }]}>
          <View style={[styles.tileLabelRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <AppIcon name="evidence" color={palette.accent} size={16} />
            <MizanText variant="caption" muted>{local.samples}</MizanText>
          </View>
          <MizanText variant="title">{formatLocalizedNumber(insight.hypothesis.sampleSize, locale, 0)}</MizanText>
        </View>
        <View style={[styles.detailTile, { backgroundColor: palette.surfaceMuted }]}>
          <MizanText variant="caption" muted>{local.window}</MizanText>
          <MizanText variant="label" style={styles.detailText}>{window}</MizanText>
        </View>
        <View style={[styles.detailTile, { backgroundColor: palette.surfaceMuted }]}>
          <MizanText variant="caption" muted>{local.effect}</MizanText>
          <MizanText variant="title" style={styles.detailText}>{effect}</MizanText>
        </View>
      </View>

      <View style={[styles.detailRow, { flexDirection: isRtl ? 'row-reverse' : 'row', borderTopColor: palette.border }]}>
        <MizanText variant="caption" muted style={styles.detailText}>{local.status}</MizanText>
        <MizanText variant="label" style={styles.detailText}>{statusLabel(insight.hypothesis.status, locale)}</MizanText>
      </View>
    </Card>
  );
}

export default function InsightsScreen() {
  const { isRtl, locale, refreshSession, userId } = useAppState();
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const [snapshot, setSnapshot] = useState<InsightsSnapshot | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [filter, setFilter] = useState<InsightFilter>('all');
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

  const visibleInsights = useMemo(() => {
    const insights = snapshot?.insights ?? [];
    if (filter === 'all') return insights;
    return insights.filter((insight) => insight.hypothesis.status === filter);
  }, [filter, snapshot?.insights]);

  const supportedPatternCount = status === 'ready'
    ? formatLocalizedNumber(snapshot?.insights.length ?? 0, locale, 0)
    : '—';
  const evidenceWindow = `${formatLocalizedNumber(90, locale, 0)} ${local.days}`;
  const hasAnyInsights = (snapshot?.insights.length ?? 0) > 0;

  return (
    <Screen>
      <View style={[styles.topRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        <View style={styles.heading}>
          <MizanText variant="label" muted>{local.eyebrow}</MizanText>
          <MizanText variant="display">{local.title}</MizanText>
        </View>
        <SecondaryButton compact label={local.back} onPress={() => router.replace('/today')} />
      </View>

      <Card style={[styles.heroCard, { backgroundColor: palette.accentSoft, borderColor: palette.accent }]}>
        <View style={[styles.cardAccent, { backgroundColor: palette.accent }]} />
        <View style={[styles.heroTitleRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={[styles.iconBadge, { backgroundColor: palette.surface }]}>
            <AppIcon name="insights" color={palette.accent} size={26} />
          </View>
          <View style={styles.heroCopy}>
            <MizanText variant="title">{local.title}</MizanText>
            <MizanText>{local.body}</MizanText>
            <MizanText variant="caption" muted>{local.caveat}</MizanText>
          </View>
        </View>
        <View style={styles.heroFooter}>
          <View style={[styles.heroStats, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <View style={[styles.heroStat, { backgroundColor: palette.surface }]}>
              <MizanText variant="caption" muted>{local.evidenceWindow}</MizanText>
              <MizanText variant="title">{evidenceWindow}</MizanText>
            </View>
            <View style={[styles.heroStat, { backgroundColor: palette.surface }]}>
              <MizanText variant="caption" muted>{local.patterns}</MizanText>
              <MizanText variant="title">{supportedPatternCount}</MizanText>
            </View>
          </View>
          <View style={styles.heroAction}>
            <PrimaryButton label={local.checkIn} onPress={() => router.push('/check-in')} />
          </View>
        </View>
      </Card>

      {status === 'ready' && hasAnyInsights ? (
        <View style={styles.filterSection} accessibilityRole="summary">
          <MizanText variant="label" muted>{local.filterLabel}</MizanText>
          <View style={[styles.filterRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <ChoiceChip label={local.all} selected={filter === 'all'} onPress={() => setFilter('all')} />
            <ChoiceChip label={local.association} selected={filter === 'association'} onPress={() => setFilter('association')} />
            <ChoiceChip label={local.hypothesis} selected={filter === 'hypothesis'} onPress={() => setFilter('hypothesis')} />
          </View>
        </View>
      ) : null}

      {status === 'loading' ? (
        <Card style={[styles.stateCard, { backgroundColor: palette.surfaceMuted }]}>
          <MizanText accessibilityLiveRegion="polite" muted>{local.loading}</MizanText>
        </Card>
      ) : null}
      {status === 'error' ? (
        <Card style={[styles.stateCard, { backgroundColor: palette.surfaceMuted }]}>
          <MizanText accessibilityLiveRegion="polite" muted>{local.error}</MizanText>
        </Card>
      ) : null}
      {status === 'ready' && !hasAnyInsights ? (
        <Card style={[styles.stateCard, { backgroundColor: palette.surfaceMuted }]}>
          <MizanText accessibilityLiveRegion="polite" muted>{local.empty}</MizanText>
        </Card>
      ) : null}
      {status === 'ready' && hasAnyInsights && visibleInsights.length === 0 ? (
        <Card style={[styles.stateCard, { backgroundColor: palette.surfaceMuted }]}>
          <MizanText accessibilityLiveRegion="polite" muted>{local.filterEmpty}</MizanText>
        </Card>
      ) : null}
      {status === 'ready' ? (
        <View style={[styles.insightGrid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          {visibleInsights.map((insight) => (
            <InsightCard key={insight.key} insight={insight} locale={locale} isRtl={isRtl} />
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.lg, flexWrap: 'wrap' },
  heading: { flex: 1, minWidth: 0, gap: Spacing.xs },
  heroCard: { gap: Spacing.xl },
  heroTitleRow: { alignItems: 'flex-start', gap: Spacing.lg },
  heroCopy: { flex: 1, minWidth: 0, gap: Spacing.sm },
  heroFooter: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', gap: Spacing.lg },
  heroStats: { flexGrow: 1, flexShrink: 1, flexBasis: 320, flexWrap: 'wrap', gap: Spacing.sm },
  heroStat: { flexGrow: 1, flexShrink: 1, flexBasis: 140, borderRadius: Radius.md, padding: Spacing.lg, gap: Spacing.xs },
  heroAction: { flexGrow: 0, flexShrink: 1, minWidth: 190, justifyContent: 'flex-end' },
  filterSection: { gap: Spacing.sm },
  filterRow: { flexWrap: 'wrap', gap: Spacing.sm },
  stateCard: { paddingVertical: Spacing.lg },
  insightGrid: { flexWrap: 'wrap', alignItems: 'stretch', gap: Spacing.lg },
  insightCard: { flexGrow: 1, flexShrink: 1, flexBasis: 360, overflow: 'hidden' },
  cardAccent: { height: 4, borderRadius: Radius.pill, alignSelf: 'stretch' },
  insightHeader: { alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.lg, flexWrap: 'wrap' },
  insightIdentity: { flexGrow: 1, flexShrink: 1, flexBasis: 240, alignItems: 'flex-start', gap: Spacing.md },
  insightCopy: { flex: 1, minWidth: 0, gap: Spacing.sm },
  iconBadge: { width: 48, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  directionBox: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  statusPill: {
    minHeight: Controls.minimumTouchHeight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: Controls.borderWidth,
  },
  detailGrid: { flexWrap: 'wrap', gap: Spacing.sm },
  detailTile: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 140,
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  tileLabelRow: { alignItems: 'center', gap: Spacing.xs },
  detailRow: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
    flexWrap: 'wrap',
    borderTopWidth: Controls.borderWidth,
    paddingTop: Spacing.md,
  },
  detailText: { flexShrink: 1 },
});
