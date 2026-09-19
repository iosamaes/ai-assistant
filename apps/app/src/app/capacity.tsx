import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import { loadCapacitySnapshot, type CapacitySnapshot } from '@/application/capacity';
import { Card, MizanText, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Controls, Palette, Radius, Spacing } from '@/constants/theme';
import { formatLocalizedNumber } from '@/i18n/number-input';
import type { DomainId } from '@/state/app-state';
import { useAppState } from '@/state/app-state';

type LoadStatus = 'loading' | 'ready' | 'error';

const copy = {
  ar: {
    eyebrow: 'السعة والتعافي',
    title: 'الهامش وديون الحياة',
    body: 'هذه القراءة تصف الاحتياج المتراكم والهامش المتاح فقط عندما توجد أدلة كافية. «الدَّين» هنا إشارة تخطيطية غير أخلاقية ولا يعني تقصيرًا أو حكمًا على أدائك.',
    loading: 'جارٍ قراءة السعة الحالية…',
    error: 'تعذر تحميل قراءة السعة الآن. لم يتم استبدال البيانات الناقصة بتقديرات.',
    bufferTitle: 'هامش الحياة',
    bufferBody: 'يقيس مقدار السعة المتبقية عبر إشارات التعافي والسيطرة على الوقت والدعم القريب. الأداء المرتفع مع هامش قليل قد يظل هشًا.',
    bufferUnknown: 'لا توجد إشارات متقاطعة كافية لحساب الهامش الآن.',
    buffer: 'الهامش',
    fragility: 'الهشاشة',
    confidence: 'الثقة',
    evidence: 'الأدلة',
    band: 'الحالة',
    strong: 'هامش قوي',
    moderate: 'هامش متوسط',
    low: 'هامش منخفض',
    debtTitle: 'ديون الحياة حسب المجال',
    debtBody: 'تقارن هذه القراءة المستوى المستدام الذي اخترته لهذا الموسم بما تدعمه ملاحظاتك الحديثة. الاتجاه لا يظهر إلا عندما يوجد تاريخ كافٍ.',
    debtUnknown: 'لا توجد أدلة أو أهداف كافية لهذا المجال بعد.',
    amount: 'المقدار',
    direction: 'الاتجاه',
    urgency: 'الأولوية',
    accumulating: 'يتراكم',
    stable: 'مستقر',
    recovering: 'يتعافى',
    unknown: 'غير معروف',
    lowUrgency: 'منخفضة',
    moderateUrgency: 'متوسطة',
    highUrgency: 'مرتفعة',
    snapshot: 'أول لقطة فقط — لا اتجاه تاريخي بعد',
    tracked: 'مدعوم بمقارنة تاريخية',
    caveat: 'لا تستخدم هذه المؤشرات لتشخيص حالة صحية أو للحكم على القيمة الشخصية. انخفاض الهامش يعني أن مساحة المناورة أقل وفق الأدلة الحالية فقط.',
    back: 'العودة للإعدادات',
  },
  en: {
    eyebrow: 'Capacity & recovery',
    title: 'Life Buffer & Life Debt',
    body: 'This view describes accumulated need and spare capacity only when evidence supports it. “Debt” is a neutral planning signal, not a moral judgment or a measure of performance.',
    loading: 'Reading current capacity…',
    error: 'Capacity could not be loaded right now. Missing data was not replaced with estimates.',
    bufferTitle: 'Life Buffer',
    bufferBody: 'Estimates remaining capacity across recovery, time control, and close-support signals. High output with little margin can still be fragile.',
    bufferUnknown: 'There are not enough comparable signals to summarize buffer yet.',
    buffer: 'Buffer',
    fragility: 'Fragility',
    confidence: 'Confidence',
    evidence: 'Evidence',
    band: 'Band',
    strong: 'Strong buffer',
    moderate: 'Moderate buffer',
    low: 'Low buffer',
    debtTitle: 'Life Debt by area',
    debtBody: 'This compares the sustainable level you chose for this season with what recent observations support. Direction appears only when enough history exists.',
    debtUnknown: 'There is not enough target or observation evidence for this area yet.',
    amount: 'Amount',
    direction: 'Direction',
    urgency: 'Priority',
    accumulating: 'Accumulating',
    stable: 'Stable',
    recovering: 'Recovering',
    unknown: 'Unknown',
    lowUrgency: 'Low',
    moderateUrgency: 'Moderate',
    highUrgency: 'High',
    snapshot: 'First snapshot only — no historical direction yet',
    tracked: 'Supported by a historical comparison',
    caveat: 'These indicators are not medical diagnoses or measures of personal worth. Low buffer only means less room to absorb change according to the current evidence.',
    back: 'Back to settings',
  },
} as const;

function confidenceLabel(level: string, locale: 'ar' | 'en'): string {
  const labels = locale === 'ar'
    ? { known: 'معروف', likely: 'مرجح', possible: 'محتمل', insufficient: 'أدلة غير كافية' }
    : { known: 'Known', likely: 'Likely', possible: 'Possible', insufficient: 'Insufficient evidence' };
  return labels[level as keyof typeof labels] ?? labels.insufficient;
}

export default function CapacityScreen() {
  const { isRtl, locale, refreshSession, t, userId } = useAppState();
  const labels = copy[locale];
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const [snapshot, setSnapshot] = useState<CapacitySnapshot | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const hundred = formatLocalizedNumber(100, locale, 0);

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
      const result = await loadCapacitySnapshot(userId);
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
  }, [refreshSession, userId]);

  const bufferBand = snapshot?.buffer.band;
  const bufferBandLabel =
    bufferBand === 'strong'
      ? labels.strong
      : bufferBand === 'moderate'
        ? labels.moderate
        : bufferBand === 'low'
          ? labels.low
          : labels.unknown;
  const bufferEvidence = snapshot
    ? formatLocalizedNumber(snapshot.buffer.confidence.evidenceCount, locale, 0)
    : '—';
  const bufferScore = snapshot?.buffer.score;

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
        <View style={styles.heroCopy}>
          <MizanText variant="title">{labels.bufferTitle}</MizanText>
          <MizanText muted>{labels.body}</MizanText>
        </View>
        {status === 'ready' && bufferScore !== null && bufferScore !== undefined ? (
          <View style={[styles.heroReading, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <View style={styles.heroValueGroup}>
              <MizanText variant="caption" muted>{labels.buffer}</MizanText>
              <MizanText variant="display">{formatLocalizedNumber(Math.round(bufferScore), locale, 0)} / {hundred}</MizanText>
            </View>
            <View style={[styles.bandPill, { backgroundColor: palette.surface }]}>
              <MizanText variant="label">{bufferBandLabel}</MizanText>
            </View>
          </View>
        ) : null}
      </Card>

      {status === 'loading' ? (
        <Card style={{ backgroundColor: palette.surfaceMuted }}>
          <MizanText accessibilityLiveRegion="polite" muted>{labels.loading}</MizanText>
        </Card>
      ) : null}
      {status === 'error' ? (
        <Card style={{ backgroundColor: palette.surfaceMuted }}>
          <MizanText accessibilityLiveRegion="polite" muted>{labels.error}</MizanText>
        </Card>
      ) : null}

      {status === 'ready' ? (
        <Card style={styles.bufferCard}>
          <View style={styles.sectionHeader}>
            <MizanText variant="title">{labels.bufferTitle}</MizanText>
            <MizanText muted>{labels.bufferBody}</MizanText>
          </View>
          {bufferScore === null || bufferScore === undefined ? (
            <View style={[styles.unknownPanel, { backgroundColor: palette.surfaceMuted }]}>
              <MizanText accessibilityLiveRegion="polite" muted>{labels.bufferUnknown}</MizanText>
            </View>
          ) : (
            <View style={[styles.metrics, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={[styles.metricTile, { backgroundColor: palette.surfaceMuted }]}>
                <MizanText variant="caption" muted>{labels.fragility}</MizanText>
                <MizanText variant="title">
                  {snapshot?.buffer.fragility === null || snapshot?.buffer.fragility === undefined
                    ? labels.unknown
                    : `${formatLocalizedNumber(Math.round(snapshot.buffer.fragility), locale, 0)} / ${hundred}`}
                </MizanText>
              </View>
              <View style={[styles.metricTile, { backgroundColor: palette.surfaceMuted }]}>
                <MizanText variant="caption" muted>{labels.confidence}</MizanText>
                <MizanText variant="label">{confidenceLabel(snapshot?.buffer.confidence.level ?? 'insufficient', locale)}</MizanText>
              </View>
              <View style={[styles.metricTile, { backgroundColor: palette.surfaceMuted }]}>
                <MizanText variant="caption" muted>{labels.evidence}</MizanText>
                <MizanText variant="title">{bufferEvidence}</MizanText>
              </View>
            </View>
          )}
        </Card>
      ) : null}

      {status === 'ready' ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MizanText variant="title">{labels.debtTitle}</MizanText>
            <MizanText muted>{labels.debtBody}</MizanText>
          </View>
          <View style={[styles.debtGrid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            {(snapshot?.debts ?? []).map((debt) => {
              const direction =
                debt.direction === 'accumulating'
                  ? labels.accumulating
                  : debt.direction === 'stable'
                    ? labels.stable
                    : debt.direction === 'recovering'
                      ? labels.recovering
                      : labels.unknown;
              const urgency =
                debt.urgency === 'low'
                  ? labels.lowUrgency
                  : debt.urgency === 'moderate'
                    ? labels.moderateUrgency
                    : debt.urgency === 'high'
                      ? labels.highUrgency
                      : labels.unknown;
              return (
                <Card key={debt.dimensionId} style={styles.debtCard}>
                  <View style={[styles.debtHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <MizanText variant="title" style={styles.flexibleText}>{t(debt.dimensionId as DomainId)}</MizanText>
                    <View style={[styles.urgencyPill, { backgroundColor: palette.accentSoft }]}>
                      <MizanText variant="caption">{labels.urgency}: {urgency}</MizanText>
                    </View>
                  </View>
                  {debt.amount === null ? (
                    <View style={[styles.unknownPanel, { backgroundColor: palette.surfaceMuted }]}>
                      <MizanText muted>{labels.debtUnknown}</MizanText>
                    </View>
                  ) : (
                    <View style={[styles.metrics, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                      <View style={[styles.metricTile, { backgroundColor: palette.surfaceMuted }]}>
                        <MizanText variant="caption" muted>{labels.amount}</MizanText>
                        <MizanText variant="title">{formatLocalizedNumber(Math.round(debt.amount), locale, 0)} / {hundred}</MizanText>
                      </View>
                      <View style={[styles.metricTile, { backgroundColor: palette.surfaceMuted }]}>
                        <MizanText variant="caption" muted>{labels.direction}</MizanText>
                        <MizanText variant="label">{direction}</MizanText>
                      </View>
                    </View>
                  )}
                  {debt.history !== 'unknown' ? (
                    <MizanText variant="caption" muted>{debt.history === 'tracked' ? labels.tracked : labels.snapshot}</MizanText>
                  ) : null}
                  <View style={[styles.evidenceRow, { borderTopColor: palette.border }]}>
                    <MizanText variant="caption" muted>
                      {labels.confidence}: {confidenceLabel(debt.confidence.level, locale)}
                    </MizanText>
                    <MizanText variant="caption" muted>
                      {labels.evidence}: {formatLocalizedNumber(debt.confidence.evidenceCount, locale, 0)}
                    </MizanText>
                  </View>
                </Card>
              );
            })}
          </View>
        </View>
      ) : null}

      <Card style={{ backgroundColor: palette.surfaceMuted }}>
        <MizanText variant="caption" muted>{labels.caveat}</MizanText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.lg, flexWrap: 'wrap' },
  heading: { flex: 1, minWidth: 0, gap: Spacing.xs },
  heroCard: { gap: Spacing.xl },
  heroCopy: { gap: Spacing.sm },
  heroReading: { alignItems: 'flex-end', justifyContent: 'space-between', gap: Spacing.lg, flexWrap: 'wrap' },
  heroValueGroup: { gap: Spacing.xs, flexGrow: 1, minWidth: 0 },
  bandPill: { minHeight: Controls.minimumTouchHeight, justifyContent: 'center', paddingHorizontal: Spacing.lg, borderRadius: Radius.pill },
  bufferCard: { gap: Spacing.xl },
  section: { gap: Spacing.lg },
  sectionHeader: { gap: Spacing.sm },
  metrics: { flexWrap: 'wrap', gap: Spacing.md },
  metricTile: { flexGrow: 1, flexBasis: 160, minWidth: 0, gap: Spacing.xs, borderRadius: Radius.md, padding: Spacing.md },
  unknownPanel: { borderRadius: Radius.md, padding: Spacing.lg },
  debtGrid: { flexWrap: 'wrap', alignItems: 'stretch', gap: Spacing.lg },
  debtCard: { flexGrow: 1, flexShrink: 1, flexBasis: 360 },
  debtHeader: { alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.md, flexWrap: 'wrap' },
  flexibleText: { flexShrink: 1 },
  urgencyPill: { minHeight: Controls.minimumTouchHeight, justifyContent: 'center', paddingHorizontal: Spacing.md, borderRadius: Radius.pill, maxWidth: '100%' },
  evidenceRow: { gap: Spacing.xs, borderTopWidth: Controls.borderWidth, paddingTop: Spacing.md },
});
