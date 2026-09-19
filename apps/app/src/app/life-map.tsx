import type { ConfidenceLevel, MomentumDirection } from '@mizan/core';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import {
  loadLifeMapSnapshot,
  type LifeMapDomainHistory,
  type LifeMapMetricId,
  type LifeMapSnapshot,
} from '@/application/life-map';
import { Card, MizanText, PrimaryButton, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Controls, Palette, Radius, Spacing } from '@/constants/theme';
import { formatLocalizedNumber } from '@/i18n/number-input';
import { useAppState } from '@/state/app-state';

type LoadStatus = 'loading' | 'ready' | 'error';

const copy = {
  ar: {
    eyebrow: 'ميزان',
    title: 'خريطة الحياة',
    body: 'هذه الخريطة تصف ما تدعمه ملاحظاتك فقط. المجال الذي لا توجد له أدلة يبقى مجهولًا ولا يتحول إلى درجة منخفضة.',
    back: 'اليوم',
    loading: 'جاري قراءة تاريخك…',
    error: 'تعذر تحميل خريطة الحياة الآن. لم يتم استبدال البيانات الناقصة بتقديرات.',
    allEmpty: 'لا توجد ملاحظات رقمية كافية بعد. ابدأ بتسجيل فحص سريع، وستظهر الخريطة تدريجيًا مع الأدلة.',
    domainEmpty: 'لا توجد أدلة لهذا المجال حتى الآن. سيبقى مجهولًا إلى أن تسجل بيانات مرتبطة به.',
    latest: 'أحدث قراءة',
    median: 'الوسيط خلال 28 يومًا',
    evidence: 'دليل خلال 28 يومًا',
    updated: 'آخر تحديث',
    trend: 'الاتجاه',
    trendUnknown: 'لا يوجد تاريخ كافٍ لوصف اتجاه التغير.',
    improving: 'يتحسن',
    stable: 'مستقر تقريبًا',
    declining: 'يتراجع',
    confidence: 'الثقة',
    known: 'معروف',
    likely: 'مرجح',
    possible: 'محتمل',
    insufficient: 'أدلة غير كافية',
    observations: 'ملاحظات',
    startCheckIn: 'أضف فحصًا سريعًا',
    domains: {
      recovery: 'التعافي والطاقة',
      connection: 'العلاقات القريبة',
      work: 'العمل والحمل الذهني',
      margin: 'الهامش والسيطرة على الوقت',
    },
    metrics: {
      energy: 'الطاقة',
      recovery: 'التعافي',
      mental_load: 'الحمل الذهني',
      connection: 'التواصل',
      perceived_control: 'الإحساس بالسيطرة',
    },
  },
  en: {
    eyebrow: 'MIZAN',
    title: 'Life map',
    body: 'This map describes only what your observations support. A domain with no evidence stays unknown instead of becoming a low score.',
    back: 'Today',
    loading: 'Reading your history…',
    error: 'The life map could not be loaded right now. Missing data was not replaced with estimates.',
    allEmpty: 'There is not enough numeric evidence yet. Start with a quick check-in and the map will build gradually from real observations.',
    domainEmpty: 'There is no evidence for this domain yet. It stays unknown until related observations exist.',
    latest: 'Latest reading',
    median: '28-day median',
    evidence: '28-day evidence',
    updated: 'Last updated',
    trend: 'Direction',
    trendUnknown: 'There is not enough history to describe a direction yet.',
    improving: 'Improving',
    stable: 'Roughly stable',
    declining: 'Declining',
    confidence: 'Confidence',
    known: 'Known',
    likely: 'Likely',
    possible: 'Possible',
    insufficient: 'Insufficient evidence',
    observations: 'observations',
    startCheckIn: 'Add a quick check-in',
    domains: {
      recovery: 'Recovery & energy',
      connection: 'Close relationships',
      work: 'Work & mental load',
      margin: 'Time margin & control',
    },
    metrics: {
      energy: 'Energy',
      recovery: 'Recovery',
      mental_load: 'Mental load',
      connection: 'Connection',
      perceived_control: 'Perceived control',
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

function momentumLabel(direction: MomentumDirection, locale: 'ar' | 'en') {
  const local = copy[locale];
  if (direction === 'improving') return local.improving;
  if (direction === 'declining') return local.declining;
  if (direction === 'stable') return local.stable;
  return local.trendUnknown;
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

function metricLabel(metric: LifeMapMetricId, locale: 'ar' | 'en') {
  return copy[locale].metrics[metric];
}

function DomainCard({ domain, locale, isRtl }: { domain: LifeMapDomainHistory; locale: 'ar' | 'en'; isRtl: boolean }) {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const local = copy[locale];
  const hundred = formatLocalizedNumber(100, locale, 0);

  return (
    <Card style={styles.domainCard}>
      <View style={[styles.domainHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        <MizanText variant="title" style={styles.flexibleRowText}>{local.domains[domain.domainId]}</MizanText>
        {domain.evidenceCount > 0 ? (
          <View style={[styles.evidencePill, { backgroundColor: palette.accentSoft }]}>
            <MizanText variant="caption">{formatLocalizedNumber(domain.evidenceCount, locale, 0)} {local.observations}</MizanText>
          </View>
        ) : null}
      </View>

      {domain.metrics.length === 0 ? <MizanText muted>{local.domainEmpty}</MizanText> : null}

      {domain.metrics.map((metric) => {
        const momentumIsUsable = metric.momentum !== 'unknown' && metric.momentumConfidence.level !== 'insufficient';
        return (
          <View key={metric.metric} style={[styles.metric, { borderTopColor: palette.border }]}>
            <View style={[styles.metricTitleRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <MizanText variant="label" style={styles.flexibleRowText}>{metricLabel(metric.metric, locale)}</MizanText>
              <View style={[styles.scorePill, { backgroundColor: palette.surfaceMuted }]}>
                <MizanText variant="label">{formatLocalizedNumber(Math.round(metric.latestValue), locale, 0)} / {hundred}</MizanText>
              </View>
            </View>

            <View style={styles.detailGroup}>
              <MizanText variant="caption" muted>{local.updated}: {formatDate(metric.latestObservedAt, locale)}</MizanText>
              <MizanText variant="caption" muted>
                {local.median}: {metric.monthMedian === null ? '—' : `${formatLocalizedNumber(Math.round(metric.monthMedian), locale, 0)} / ${hundred}`}
              </MizanText>
              <MizanText variant="caption" muted>
                {local.evidence}: {formatLocalizedNumber(metric.monthEvidenceCount, locale, 0)} · {local.confidence}: {confidenceLabel(metric.monthConfidence.level, locale)}
              </MizanText>
              <View style={[styles.trendPill, { backgroundColor: palette.surfaceMuted, alignSelf: isRtl ? 'flex-end' : 'flex-start' }]}>
                <MizanText variant="caption">{local.trend}: {momentumIsUsable ? momentumLabel(metric.momentum, locale) : local.trendUnknown}</MizanText>
              </View>
            </View>
          </View>
        );
      })}
    </Card>
  );
}

export default function LifeMapScreen() {
  const { enabledDomains, isRtl, locale, refreshSession, userId } = useAppState();
  const [snapshot, setSnapshot] = useState<LifeMapSnapshot | null>(null);
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
        setSnapshot(null);
        setStatus('ready');
        return;
      }

      setStatus('loading');
      const result = await loadLifeMapSnapshot(userId, enabledDomains);
      if (!active) return;
      if (result.ok) {
        setSnapshot(result.value);
        setStatus('ready');
        return;
      }
      if (result.error.kind === 'session-expired') await refreshSession();
      if (active) setStatus('error');
    })();

    return () => {
      active = false;
    };
  }, [enabledDomains, refreshSession, userId]);

  const evidenceCount = snapshot?.domains.reduce((total, domain) => total + domain.evidenceCount, 0) ?? 0;

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
        </View>
        <PrimaryButton label={local.startCheckIn} onPress={() => router.push('/check-in')} />
      </Card>

      {status === 'loading' ? <MizanText accessibilityLiveRegion="polite" muted>{local.loading}</MizanText> : null}
      {status === 'error' ? (
        <Card style={{ backgroundColor: palette.surfaceMuted }}><MizanText accessibilityLiveRegion="polite" muted>{local.error}</MizanText></Card>
      ) : null}
      {status === 'ready' && evidenceCount === 0 ? (
        <Card style={{ backgroundColor: palette.surfaceMuted }}><MizanText accessibilityLiveRegion="polite" muted>{local.allEmpty}</MizanText></Card>
      ) : null}

      {status === 'ready' ? (
        <View style={styles.domainGrid}>
          {snapshot?.domains.map((domain) => (
            <DomainCard key={domain.domainId} domain={domain} locale={locale} isRtl={isRtl} />
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
  domainGrid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', gap: Spacing.lg },
  domainCard: { flexGrow: 1, flexShrink: 1, flexBasis: 360 },
  domainHeader: { alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.md, flexWrap: 'wrap' },
  evidencePill: { minHeight: Controls.minimumTouchHeight, justifyContent: 'center', paddingHorizontal: Spacing.md, borderRadius: Radius.pill },
  metric: { gap: Spacing.sm, borderTopWidth: Controls.borderWidth, paddingTop: Spacing.md },
  metricTitleRow: { alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md, flexWrap: 'wrap' },
  scorePill: { minHeight: Controls.minimumTouchHeight, justifyContent: 'center', paddingHorizontal: Spacing.md, borderRadius: Radius.pill },
  flexibleRowText: { flexShrink: 1 },
  detailGroup: { gap: Spacing.xs },
  trendPill: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.pill, maxWidth: '100%' },
});
