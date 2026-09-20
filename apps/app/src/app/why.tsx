import type { ConfidenceLevel } from '@mizan/core';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import {
  loadWhyExplanation,
  type WhyCandidateFactor,
  type WhyExplanation,
  type WhyFactorKey,
} from '@/application/why';
import { AppIcon, type AppIconName } from '@/components/app-icon';
import { Card, MizanText, PrimaryButton, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Controls, Palette, Radius, Spacing } from '@/constants/theme';
import { formatLocalizedNumber } from '@/i18n/number-input';
import { useAppState } from '@/state/app-state';

type LoadStatus = 'loading' | 'ready' | 'error';

const copy = {
  ar: {
    eyebrow: 'ميزان',
    title: 'لماذا قد أشعر أنني لست على ما يرام؟',
    body: 'يعرض ميزان الإشارات الموجودة في بياناتك ويرتبها حسب قوتها وثقة الأدلة. هذه عوامل محتملة وليست أسبابًا مثبتة أو تشخيصًا.',
    back: 'اليوم',
    loading: 'جاري فحص الأدلة المتاحة…',
    error: 'تعذر قراءة الأدلة الآن. لم يتم إنشاء تفسير بديل أو افتراض بيانات مفقودة.',
    empty: 'لا توجد حاليًا إشارات مدعومة بأدلة كافية. هذا لا يعني أن كل شيء مثالي؛ يعني فقط أن ميزان لا يملك بيانات كافية للتفسير.',
    rank: 'الترتيب',
    value: 'الإشارة الحالية',
    confidence: 'الثقة',
    evidence: 'عدد الأدلة',
    window: 'نافذة الأدلة',
    recentOnly: 'قراءة حديثة واحدة',
    caveatTitle: 'قراءة تفسيرية وليست تشخيصًا',
    caveat: 'الترتيب يصف ما يظهر معًا في بياناتك الحالية فقط. لا يثبت أن عاملًا ما سبّب شعورك، ولا يستخدم لاستنتاج مرض أو حالة نفسية.',
    checkIn: 'أضف فحصًا سريعًا',
    known: 'معروف',
    likely: 'مرجح',
    possible: 'محتمل',
    insufficient: 'غير كافٍ',
    factors: {
      recovery: 'التعافي منخفض عن المعتاد الآن',
      energy: 'الطاقة منخفضة الآن',
      mental_load: 'الحمل الذهني مرتفع الآن',
      connection: 'الإحساس بالتواصل منخفض الآن',
      overload_risk: 'توجد إشارات متداخلة لارتفاع الضغط',
    },
    descriptions: {
      recovery: 'مبني على ملاحظات التعافي المتاحة، دون افتراض سبب محدد لانخفاضه.',
      energy: 'مبني على تقارير الطاقة المتاحة، وقد يتأثر بعوامل كثيرة غير مقاسة.',
      mental_load: 'يعكس ارتفاع الحمل الذهني المبلغ عنه أو المستنتج من الأدلة المتاحة فقط.',
      connection: 'يعكس انخفاض التواصل المبلغ عنه، ولا يقيّم جودة علاقاتك أو قيمتها.',
      overload_risk: 'إشارة مركبة محافظة من الأدلة الحالية، وليست تحذيرًا طبيًا أو تشخيصًا.',
    },
  },
  en: {
    eyebrow: 'MIZAN',
    title: 'Why might I feel off?',
    body: 'MIZAN ranks signals that are actually present in your data by their strength and evidence confidence. These are candidate factors, not proven causes or diagnoses.',
    back: 'Today',
    loading: 'Reviewing available evidence…',
    error: 'The evidence could not be read right now. MIZAN did not generate a substitute explanation or fill in missing data.',
    empty: 'There are no candidate signals with enough evidence right now. That does not mean everything is perfect; it only means MIZAN lacks enough data to explain it.',
    rank: 'Rank',
    value: 'Current signal',
    confidence: 'Confidence',
    evidence: 'Evidence count',
    window: 'Evidence window',
    recentOnly: 'One recent observation',
    caveatTitle: 'Interpretation, not diagnosis',
    caveat: 'This ranking describes what is present together in your current data. It does not prove that a factor caused how you feel and is not used to infer a disease or mental-health condition.',
    checkIn: 'Add a quick check-in',
    known: 'Known',
    likely: 'Likely',
    possible: 'Possible',
    insufficient: 'Insufficient',
    factors: {
      recovery: 'Recovery is currently lower',
      energy: 'Energy is currently lower',
      mental_load: 'Mental load is currently higher',
      connection: 'Connection is currently lower',
      overload_risk: 'Several signals currently point toward higher overload',
    },
    descriptions: {
      recovery: 'Based on the recovery observations available, without assuming a specific cause for the lower signal.',
      energy: 'Based on available energy reports; many unmeasured factors could also matter.',
      mental_load: 'Reflects higher reported or evidence-derived mental load only.',
      connection: 'Reflects lower reported connection and does not judge the quality or value of your relationships.',
      overload_risk: 'A conservative combined signal from current evidence, not a medical warning or diagnosis.',
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

function formatDate(value: string, locale: 'ar' | 'en') {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return '—';
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-QA-u-nu-latn' : 'en-QA-u-nu-latn', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(timestamp));
  } catch {
    return '—';
  }
}

function evidenceWindowLabel(factor: WhyCandidateFactor, locale: 'ar' | 'en') {
  const local = copy[locale];
  if (!factor.evidenceStartAt || !factor.evidenceEndAt) return '—';
  if (factor.evidenceStartAt === factor.evidenceEndAt) return local.recentOnly;
  return `${formatDate(factor.evidenceStartAt, locale)} – ${formatDate(factor.evidenceEndAt, locale)}`;
}

function factorIcon(key: WhyFactorKey): AppIconName {
  if (key === 'recovery') return 'recovery';
  if (key === 'energy') return 'energy';
  if (key === 'mental_load') return 'mentalLoad';
  if (key === 'connection') return 'connection';
  return 'overload';
}

function FactorCard({
  factor,
  rank,
  locale,
  isRtl,
}: {
  factor: WhyCandidateFactor;
  rank: number;
  locale: 'ar' | 'en';
  isRtl: boolean;
}) {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const local = copy[locale];
  const key: WhyFactorKey = factor.key;
  const hundred = formatLocalizedNumber(100, locale, 0);
  const iconColor = key === 'overload_risk' ? palette.danger : palette.accent;

  return (
    <Card style={styles.factorCard}>
      <View style={[styles.factorHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        <View style={[styles.factorIdentity, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={[styles.iconBadge, { backgroundColor: palette.accentSoft }]}>
            <AppIcon name={factorIcon(key)} color={iconColor} size={25} />
          </View>
          <View style={styles.factorCopy}>
            <View style={[styles.rankRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <MizanText variant="caption" muted>{local.rank}</MizanText>
              <View style={[styles.rankPill, { backgroundColor: palette.surfaceMuted }]}>
                <MizanText variant="label">{formatLocalizedNumber(rank, locale, 0)}</MizanText>
              </View>
            </View>
            <MizanText variant="title">{local.factors[key]}</MizanText>
            <MizanText muted>{local.descriptions[key]}</MizanText>
          </View>
        </View>
        <View style={[styles.signalPill, { backgroundColor: palette.accentSoft }]}>
          <MizanText variant="label">{formatLocalizedNumber(Math.round(factor.value), locale, 0)} / {hundred}</MizanText>
        </View>
      </View>

      <View style={[styles.detailGrid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        <View style={[styles.detailTile, { backgroundColor: palette.surfaceMuted }]}>
          <View style={[styles.tileLabelRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <AppIcon name="confidence" color={palette.accent} size={16} />
            <MizanText variant="caption" muted>{local.confidence}</MizanText>
          </View>
          <MizanText variant="label">{confidenceLabel(factor.confidence.level, locale)}</MizanText>
        </View>
        <View style={[styles.detailTile, { backgroundColor: palette.surfaceMuted }]}>
          <View style={[styles.tileLabelRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <AppIcon name="evidence" color={palette.accent} size={16} />
            <MizanText variant="caption" muted>{local.evidence}</MizanText>
          </View>
          <MizanText variant="label">{formatLocalizedNumber(factor.evidence.length, locale, 0)}</MizanText>
        </View>
        <View style={[styles.detailTile, styles.windowTile, { backgroundColor: palette.surfaceMuted }]}>
          <MizanText variant="caption" muted>{local.window}</MizanText>
          <MizanText variant="label" style={styles.detailText}>{evidenceWindowLabel(factor, locale)}</MizanText>
        </View>
      </View>

      <View style={[styles.detailRow, { flexDirection: isRtl ? 'row-reverse' : 'row', borderTopColor: palette.border }]}>
        <MizanText variant="caption" muted style={styles.detailText}>{local.value}</MizanText>
        <MizanText variant="label" style={styles.detailText}>{formatLocalizedNumber(Math.round(factor.value), locale, 0)} / {hundred}</MizanText>
      </View>
    </Card>
  );
}

export default function WhyScreen() {
  const { isRtl, locale, refreshSession, userId } = useAppState();
  const [explanation, setExplanation] = useState<WhyExplanation | null>(null);
  const [explanationUserId, setExplanationUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const activeUserRef = useRef(userId);
  useEffect(() => {
    activeUserRef.current = userId;
  }, [userId]);
  const local = copy[locale];
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];

  useEffect(() => {
    let active = true;
    const requestedUserId = userId;
    const requestIsCurrent = () => active && activeUserRef.current === requestedUserId;

    void (async () => {
      await Promise.resolve();
      if (!requestIsCurrent()) return;
      if (!requestedUserId) {
        setExplanation(null);
        setExplanationUserId(null);
        setStatus('ready');
        return;
      }

      setExplanation(null);
      setExplanationUserId(requestedUserId);
      setStatus('loading');
      const result = await loadWhyExplanation(requestedUserId);
      if (!requestIsCurrent()) return;
      if (result.ok) {
        setExplanation(result.value);
        setExplanationUserId(requestedUserId);
        setStatus('ready');
        return;
      }
      if (result.error.kind === 'session-expired') {
        await refreshSession();
        if (!requestIsCurrent()) return;
      }
      setExplanation(null);
      setExplanationUserId(requestedUserId);
      setStatus('error');
    })();

    return () => {
      active = false;
    };
  }, [refreshSession, userId]);

  const currentExplanation = userId !== null && explanationUserId === userId ? explanation : null;
  const displayedStatus: LoadStatus =
    userId === null ? 'ready' : explanationUserId === userId ? status : 'loading';

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
        <View style={[styles.heroTitleRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={[styles.heroIcon, { backgroundColor: palette.surface }]}>
            <AppIcon name="hypothesis" color={palette.accent} size={28} />
          </View>
          <View style={styles.heroCopy}>
            <MizanText variant="title">{local.title}</MizanText>
            <MizanText muted>{local.body}</MizanText>
          </View>
        </View>
        <View style={[styles.caveatBox, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <View style={[styles.caveatTitleRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <AppIcon name="evidence" color={palette.accent} size={18} />
            <MizanText variant="label">{local.caveatTitle}</MizanText>
          </View>
          <MizanText variant="caption" muted>{local.caveat}</MizanText>
        </View>
        <PrimaryButton label={local.checkIn} onPress={() => router.push('/check-in')} />
      </Card>

      {displayedStatus === 'loading' ? <MizanText accessibilityLiveRegion="polite" muted>{local.loading}</MizanText> : null}
      {displayedStatus === 'error' ? (
        <Card style={{ backgroundColor: palette.surfaceMuted }}><MizanText accessibilityLiveRegion="polite" muted>{local.error}</MizanText></Card>
      ) : null}
      {displayedStatus === 'ready' && (currentExplanation?.factors.length ?? 0) === 0 ? (
        <Card style={{ backgroundColor: palette.surfaceMuted }}><MizanText accessibilityLiveRegion="polite" muted>{local.empty}</MizanText></Card>
      ) : null}

      {displayedStatus === 'ready' ? (
        <View style={[styles.factorGrid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          {currentExplanation?.factors.map((factor, index) => (
            <FactorCard key={factor.key} factor={factor} rank={index + 1} locale={locale} isRtl={isRtl} />
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
  heroIcon: { width: 52, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  heroCopy: { flex: 1, minWidth: 0, gap: Spacing.sm },
  caveatBox: { gap: Spacing.sm, borderWidth: Controls.borderWidth, borderRadius: Radius.md, padding: Spacing.lg },
  caveatTitleRow: { alignItems: 'center', gap: Spacing.sm },
  factorGrid: { flexWrap: 'wrap', alignItems: 'stretch', gap: Spacing.lg },
  factorCard: { flexGrow: 1, flexShrink: 1, flexBasis: 360 },
  factorHeader: { alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.lg, flexWrap: 'wrap' },
  factorIdentity: { flexGrow: 1, flexShrink: 1, flexBasis: 250, alignItems: 'flex-start', gap: Spacing.md },
  iconBadge: { width: 48, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  factorCopy: { flex: 1, minWidth: 0, gap: Spacing.sm },
  rankRow: { alignItems: 'center', gap: Spacing.sm },
  rankPill: { minWidth: 30, minHeight: 30, paddingHorizontal: Spacing.sm, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  signalPill: { minHeight: Controls.minimumTouchHeight, justifyContent: 'center', paddingHorizontal: Spacing.md, borderRadius: Radius.pill },
  detailGrid: { flexWrap: 'wrap', gap: Spacing.sm },
  detailTile: { flexGrow: 1, flexShrink: 1, flexBasis: 140, gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderRadius: Radius.md },
  tileLabelRow: { alignItems: 'center', gap: Spacing.xs },
  windowTile: { flexBasis: 220 },
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