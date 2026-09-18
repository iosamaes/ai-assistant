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
import { Palette, Spacing } from '@/constants/theme';
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
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-QA' : 'en', {
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

  return (
    <Card>
      <View style={[styles.domainHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        <MizanText variant="title">{local.domains[domain.domainId]}</MizanText>
        {domain.evidenceCount > 0 ? (
          <MizanText variant="caption" muted>{domain.evidenceCount} {local.observations}</MizanText>
        ) : null}
      </View>

      {domain.metrics.length === 0 ? <MizanText muted>{local.domainEmpty}</MizanText> : null}

      {domain.metrics.map((metric) => {
        const momentumIsUsable = metric.momentum !== 'unknown' && metric.momentumConfidence.level !== 'insufficient';
        return (
          <View key={metric.metric} style={[styles.metric, { borderTopColor: palette.border }]}>
            <View style={[styles.metricTitleRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <MizanText variant="label">{metricLabel(metric.metric, locale)}</MizanText>
              <MizanText variant="title">{Math.round(metric.latestValue)} / 100</MizanText>
            </View>

            <View style={styles.detailGroup}>
              <MizanText variant="caption" muted>{local.updated}: {formatDate(metric.latestObservedAt, locale)}</MizanText>
              <MizanText variant="caption" muted>
                {local.median}: {metric.monthMedian === null ? '—' : `${Math.round(metric.monthMedian)} / 100`}
              </MizanText>
              <MizanText variant="caption" muted>
                {local.evidence}: {metric.monthEvidenceCount} · {local.confidence}: {confidenceLabel(metric.monthConfidence.level, locale)}
              </MizanText>
              <MizanText variant="caption" muted>
                {local.trend}: {momentumIsUsable ? momentumLabel(metric.momentum, locale) : local.trendUnknown}
              </MizanText>
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

  useEffect(() => {
    let active = true;
    if (!userId) {
      setSnapshot(null);
      setStatus('ready');
      return () => {
        active = false;
      };
    }

    setStatus('loading');
    void loadLifeMapSnapshot(userId, enabledDomains).then(async (result) => {
      if (!active) return;
      if (result.ok) {
        setSnapshot(result.value);
        setStatus('ready');
        return;
      }
      if (result.error.kind === 'session-expired') await refreshSession();
      if (active) setStatus('error');
    });

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

      <Card>
        <MizanText muted>{local.body}</MizanText>
        <PrimaryButton label={local.startCheckIn} onPress={() => router.push('/check-in')} />
      </Card>

      {status === 'loading' ? <MizanText muted>{local.loading}</MizanText> : null}
      {status === 'error' ? <Card><MizanText muted>{local.error}</MizanText></Card> : null}
      {status === 'ready' && evidenceCount === 0 ? <Card><MizanText muted>{local.allEmpty}</MizanText></Card> : null}

      {status === 'ready'
        ? snapshot?.domains.map((domain) => (
            <DomainCard key={domain.domainId} domain={domain} locale={locale} isRtl={isRtl} />
          ))
        : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { alignItems: 'center', justifyContent: 'space-between', gap: Spacing.lg },
  heading: { flex: 1, gap: Spacing.xs },
  domainHeader: { alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
  metric: { gap: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.md },
  metricTitleRow: { alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
  detailGroup: { gap: Spacing.xs },
});
