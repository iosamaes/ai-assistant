import type { ConfidenceLevel } from '@mizan/core';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import {
  loadWhyExplanation,
  type WhyCandidateFactor,
  type WhyExplanation,
  type WhyFactorKey,
} from '@/application/why';
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
    value: 'الإشارة الحالية',
    confidence: 'الثقة',
    evidence: 'عدد الأدلة',
    window: 'نافذة الأدلة',
    recentOnly: 'قراءة حديثة واحدة',
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
    value: 'Current signal',
    confidence: 'Confidence',
    evidence: 'Evidence count',
    window: 'Evidence window',
    recentOnly: 'One recent observation',
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
    return new Date(timestamp).toISOString().slice(0, 10);
  }
}

function evidenceWindowLabel(factor: WhyCandidateFactor, locale: 'ar' | 'en') {
  const local = copy[locale];
  if (!factor.evidenceStartAt || !factor.evidenceEndAt) return '—';
  if (factor.evidenceStartAt === factor.evidenceEndAt) return local.recentOnly;
  return `${formatDate(factor.evidenceStartAt, locale)} – ${formatDate(factor.evidenceEndAt, locale)}`;
}

function FactorCard({ factor, locale, isRtl }: { factor: WhyCandidateFactor; locale: 'ar' | 'en'; isRtl: boolean }) {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const local = copy[locale];
  const key: WhyFactorKey = factor.key;
  const hundred = formatLocalizedNumber(100, locale, 0);

  return (
    <Card style={styles.factorCard}>
      <View style={[styles.factorHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        <View style={styles.factorCopy}>
          <MizanText variant="title">{local.factors[key]}</MizanText>
          <MizanText muted>{local.descriptions[key]}</MizanText>
        </View>
        <View style={[styles.signalPill, { backgroundColor: palette.accentSoft }]}>
          <MizanText variant="label">{formatLocalizedNumber(Math.round(factor.value), locale, 0)} / {hundred}</MizanText>
        </View>
      </View>

      <View style={styles.detailGrid}>
        <View style={[styles.detailTile, { backgroundColor: palette.surfaceMuted }]}>
          <MizanText variant="caption" muted>{local.confidence}</MizanText>
          <MizanText variant="label">{confidenceLabel(factor.confidence.level, locale)}</MizanText>
        </View>
        <View style={[styles.detailTile, { backgroundColor: palette.surfaceMuted }]}>
          <MizanText variant="caption" muted>{local.evidence}</MizanText>
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
  const [status, setStatus] = useState<LoadStatus>('loading');
  const local = copy[locale];
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];

  useEffect(() => {
    let active = true;
    void (async () => {
      await Promise.resolve();
      if (!active) return;
      if (!userId) {
        setExplanation(null);
        setStatus('ready');
        return;
      }

      setStatus('loading');
      const result = await loadWhyExplanation(userId);
      if (!active) return;
      if (result.ok) {
        setExplanation(result.value);
        setStatus('ready');
        return;
      }
      if (result.error.kind === 'session-expired') await refreshSession();
      if (active) setStatus('error');
    })();

    return () => {
      active = false;
    };
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

      <Card style={[styles.heroCard, { backgroundColor: palette.accentSoft, borderColor: palette.accent }]}>
        <View style={styles.heroCopy}>
          <MizanText variant="title">{local.title}</MizanText>
          <MizanText muted>{local.body}</MizanText>
          <MizanText variant="caption" muted>{local.caveat}</MizanText>
        </View>
        <PrimaryButton label={local.checkIn} onPress={() => router.push('/check-in')} />
      </Card>

      {status === 'loading' ? <MizanText accessibilityLiveRegion="polite" muted>{local.loading}</MizanText> : null}
      {status === 'error' ? (
        <Card style={{ backgroundColor: palette.surfaceMuted }}><MizanText accessibilityLiveRegion="polite" muted>{local.error}</MizanText></Card>
      ) : null}
      {status === 'ready' && (explanation?.factors.length ?? 0) === 0 ? (
        <Card style={{ backgroundColor: palette.surfaceMuted }}><MizanText accessibilityLiveRegion="polite" muted>{local.empty}</MizanText></Card>
      ) : null}

      {status === 'ready' ? (
        <View style={styles.factorGrid}>
          {explanation?.factors.map((factor) => (
            <FactorCard key={factor.key} factor={factor} locale={locale} isRtl={isRtl} />
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
  heroCopy: { gap: Spacing.sm },
  factorGrid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', gap: Spacing.lg },
  factorCard: { flexGrow: 1, flexShrink: 1, flexBasis: 360 },
  factorHeader: { alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.lg, flexWrap: 'wrap' },
  factorCopy: { flexGrow: 1, flexShrink: 1, flexBasis: 220, gap: Spacing.sm },
  signalPill: { minHeight: Controls.minimumTouchHeight, justifyContent: 'center', paddingHorizontal: Spacing.md, borderRadius: Radius.pill },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  detailTile: { flexGrow: 1, flexShrink: 1, flexBasis: 140, gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderRadius: Radius.md },
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
