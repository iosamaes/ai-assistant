import type { ConfidenceLevel, MomentumDirection } from '@mizan/core';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, useColorScheme, useWindowDimensions, View } from 'react-native';

import {
  loadLifeMapSnapshot,
  type LifeMapDomainHistory,
  type LifeMapDomainId,
  type LifeMapMetricId,
  type LifeMapSnapshot,
} from '@/application/life-map';
import { AppIcon, type AppIconName } from '@/components/app-icon';
import { Card, MizanText, PrimaryButton, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Controls, Layout, Palette, Radius, Spacing } from '@/constants/theme';
import { formatLocalizedNumber } from '@/i18n/number-input';
import { useAppState } from '@/state/app-state';

type LoadStatus = 'loading' | 'ready' | 'error';
type Point = { x: number; y: number };

const domainIcons: Readonly<Record<LifeMapDomainId, AppIconName>> = {
  recovery: 'recovery',
  connection: 'connection',
  work: 'work',
  margin: 'margin',
};

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
    chartTitle: 'صورة التوازن المدعومة بالأدلة',
    chartBody: 'كل محور يستخدم إشارة إيجابية من 0 إلى 100. الحمل الذهني يُعكس هنا فقط ليعني الرقم الأعلى حالة أفضل. المحاور المجهولة لا تُغلق المضلع ولا تُعامل كصفر.',
    chartAccessibility: 'خريطة الحياة. ',
    supportedDomains: 'مجالات مدعومة',
    mapSignal: 'إشارة الخريطة',
    mapSignalBody: 'متوسط وصفي للمحاور المعروفة فقط، وليس حكمًا على جودة حياتك أو بديلًا عن توازن موسمك.',
    building: 'الخريطة ما زالت تتكوّن',
    overview: 'التفاصيل الدقيقة',
    overviewBody: 'الأرقام والاتجاه والثقة تبقى قابلة للفحص بجانب الرسم.',
    domainSignal: 'إشارة المجال',
    unknown: 'مجهول',
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
    chartTitle: 'Evidence-supported balance picture',
    chartBody: 'Each axis uses a positive 0–100 signal. Mental load is inverted here only so a higher visual value means a better state. Unknown axes never close the polygon or become zero.',
    chartAccessibility: 'Life map. ',
    supportedDomains: 'Supported domains',
    mapSignal: 'Map signal',
    mapSignalBody: 'A descriptive average of known axes only, not a judgment of life quality or a replacement for your season balance.',
    building: 'The map is still taking shape',
    overview: 'Exact overview',
    overviewBody: 'Values, direction, confidence, and evidence remain inspectable beside the visual.',
    domainSignal: 'Domain signal',
    unknown: 'Unknown',
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

function momentumIcon(direction: MomentumDirection): AppIconName {
  if (direction === 'improving') return 'trendUp';
  if (direction === 'declining') return 'trendDown';
  return 'trendFlat';
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

function metricLabel(metric: LifeMapMetricId, locale: 'ar' | 'en') {
  return copy[locale].metrics[metric];
}

function pointFor(index: number, count: number, radius: number, center: number, scale = 1): Point {
  const angle = -Math.PI / 2 + (Math.PI * 2 * index) / Math.max(count, 1);
  return {
    x: center + Math.cos(angle) * radius * scale,
    y: center + Math.sin(angle) * radius * scale,
  };
}

function lineBetween(from: Point, to: Point, color: string, width = 1) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);
  return {
    position: 'absolute' as const,
    left: from.x,
    top: from.y - width / 2,
    width: distance,
    height: width,
    backgroundColor: color,
    transform: [{ rotate: `${angle}rad` }],
    transformOrigin: 'left center',
  };
}

function RadarChart({
  domains,
  locale,
  size,
}: {
  domains: readonly LifeMapDomainHistory[];
  locale: 'ar' | 'en';
  size: number;
}) {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const local = copy[locale];
  const count = domains.length;
  const center = size / 2;
  const radius = size * 0.32;
  const knownDomains = domains.filter((domain) => domain.score !== null);
  const allKnown = count >= 2 && knownDomains.length === count;
  const knownAverage = knownDomains.length > 0
    ? knownDomains.reduce((total, domain) => total + (domain.score ?? 0), 0) / knownDomains.length
    : null;
  const outerPoints = domains.map((_, index) => pointFor(index, count, radius, center));
  const dataPoints = domains.map((domain, index) =>
    domain.score === null ? null : pointFor(index, count, radius, center, Math.max(0, Math.min(100, domain.score)) / 100),
  );
  const accessibilityLabel = `${local.chartAccessibility}${domains
    .map((domain) => `${local.domains[domain.domainId]}: ${domain.score === null ? local.unknown : `${formatLocalizedNumber(Math.round(domain.score), locale, 0)} / ${formatLocalizedNumber(100, locale, 0)}`}`)
    .join('. ')}`;

  const dataSegments: { from: Point; to: Point; key: string }[] = [];
  if (count >= 2) {
    for (let index = 0; index < count - 1; index += 1) {
      const from = dataPoints[index];
      const to = dataPoints[index + 1];
      if (from && to) dataSegments.push({ from, to, key: `data-${index}` });
    }
    if (allKnown) {
      const from = dataPoints[count - 1];
      const to = dataPoints[0];
      if (from && to) dataSegments.push({ from, to, key: 'data-close' });
    }
  }

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      style={[styles.radar, { height: size, width: size }]}>
      {count >= 3
        ? [0.25, 0.5, 0.75, 1].flatMap((scale) => {
            const points = domains.map((_, index) => pointFor(index, count, radius, center, scale));
            return points.map((from, index) => {
              const to = points[(index + 1) % count];
              return to ? <View key={`grid-${scale}-${index}`} style={lineBetween(from, to, palette.border)} /> : null;
            });
          })
        : [0.25, 0.5, 0.75, 1].map((scale) => (
            <View
              key={`ring-${scale}`}
              style={[
                styles.radarRing,
                {
                  borderColor: palette.border,
                  height: radius * 2 * scale,
                  left: center - radius * scale,
                  top: center - radius * scale,
                  width: radius * 2 * scale,
                },
              ]}
            />
          ))}

      {outerPoints.map((point, index) => (
        <View key={`spoke-${domains[index]?.domainId ?? index}`} style={lineBetween({ x: center, y: center }, point, palette.border)} />
      ))}

      {dataSegments.map((segment) => (
        <View key={segment.key} style={lineBetween(segment.from, segment.to, palette.accent, 3)} />
      ))}

      {dataPoints.map((point, index) =>
        point ? (
          <View
            key={`dot-${domains[index]?.domainId ?? index}`}
            style={[
              styles.radarDot,
              { backgroundColor: palette.accent, left: point.x - 5, top: point.y - 5 },
            ]}
          />
        ) : null,
      )}

      {outerPoints.map((point, index) => {
        const domain = domains[index];
        if (!domain) return null;
        const labelWidth = Math.min(112, size * 0.32);
        const labelLeft = Math.max(0, Math.min(size - labelWidth, point.x - labelWidth / 2));
        const labelTop = Math.max(0, Math.min(size - 44, point.y - 22));
        return (
          <View
            key={`label-${domain.domainId}`}
            style={[styles.radarAxisLabel, { left: labelLeft, top: labelTop, width: labelWidth }]}>
            <AppIcon name={domainIcons[domain.domainId]} color={domain.score === null ? palette.textMuted : palette.accent} size={17} />
            <MizanText variant="caption" style={styles.centeredText} numberOfLines={2}>
              {domain.score === null ? local.unknown : formatLocalizedNumber(Math.round(domain.score), locale, 0)}
            </MizanText>
          </View>
        );
      })}

      <View
        style={[
          styles.radarCenter,
          {
            backgroundColor: palette.surface,
            borderColor: allKnown ? palette.accent : palette.border,
            left: center - 58,
            top: center - 43,
          },
        ]}>
        <MizanText variant="caption" muted style={styles.centeredText}>
          {allKnown ? local.mapSignal : local.supportedDomains}
        </MizanText>
        <MizanText variant="title" style={styles.centeredText}>
          {allKnown && knownAverage !== null
            ? formatLocalizedNumber(Math.round(knownAverage), locale, 0)
            : `${formatLocalizedNumber(knownDomains.length, locale, 0)} / ${formatLocalizedNumber(count, locale, 0)}`}
        </MizanText>
      </View>
    </View>
  );
}

function DomainCard({ domain, locale, isRtl }: { domain: LifeMapDomainHistory; locale: 'ar' | 'en'; isRtl: boolean }) {
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const local = copy[locale];
  const hundred = formatLocalizedNumber(100, locale, 0);
  const domainScore = domain.score === null ? null : Math.round(domain.score);

  return (
    <Card style={styles.domainCard}>
      <View style={[styles.domainHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        <View style={[styles.domainIdentity, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={[styles.domainIcon, { backgroundColor: palette.accentSoft }]}>
            <AppIcon name={domainIcons[domain.domainId]} color={domain.score === null ? palette.textMuted : palette.accent} size={22} />
          </View>
          <MizanText variant="title" style={styles.flexibleRowText}>{local.domains[domain.domainId]}</MizanText>
        </View>
        <View style={[styles.scorePill, { backgroundColor: palette.surfaceMuted }]}>
          <MizanText variant="label">
            {local.domainSignal}: {domainScore === null ? local.unknown : `${formatLocalizedNumber(domainScore, locale, 0)} / ${hundred}`}
          </MizanText>
        </View>
      </View>

      {domainScore !== null ? (
        <View style={[styles.meterTrack, { backgroundColor: palette.surfaceMuted }]} accessibilityElementsHidden>
          <View style={[styles.meterFill, { backgroundColor: palette.accent, width: `${Math.max(0, Math.min(100, domainScore))}%` }]} />
        </View>
      ) : null}

      {domain.evidenceCount > 0 ? (
        <View style={[styles.evidenceRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <AppIcon name="evidence" color={palette.accent} size={17} />
          <MizanText variant="caption" muted>
            {formatLocalizedNumber(domain.evidenceCount, locale, 0)} {local.observations}
          </MizanText>
        </View>
      ) : null}

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
              <View
                style={[
                  styles.trendPill,
                  {
                    backgroundColor: palette.surfaceMuted,
                    flexDirection: isRtl ? 'row-reverse' : 'row',
                    alignSelf: isRtl ? 'flex-end' : 'flex-start',
                  },
                ]}>
                {momentumIsUsable ? <AppIcon name={momentumIcon(metric.momentum)} color={palette.accent} size={16} /> : null}
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
  const [snapshotUserId, setSnapshotUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const activeUserRef = useRef(userId);
  activeUserRef.current = userId;
  const local = copy[locale];
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const { width } = useWindowDimensions();
  const wide = width >= Layout.wideBreakpoint;
  const screenHorizontalPadding =
    width < Layout.compactWidth
      ? Layout.horizontalPadding.compact
      : wide
        ? Layout.horizontalPadding.wide
        : Layout.horizontalPadding.regular;
  const availableChartWidth = width - screenHorizontalPadding * 2 - Spacing.xl * 2;
  const chartSize = Math.min(348, Math.max(180, availableChartWidth));

  useEffect(() => {
    let active = true;
    const requestedUserId = userId;
    const requestIsCurrent = () => active && activeUserRef.current === requestedUserId;

    void (async () => {
      await Promise.resolve();
      if (!requestIsCurrent()) return;
      if (!requestedUserId) {
        setSnapshot(null);
        setSnapshotUserId(null);
        setStatus('ready');
        return;
      }

      setSnapshot(null);
      setSnapshotUserId(requestedUserId);
      setStatus('loading');
      const result = await loadLifeMapSnapshot(requestedUserId, enabledDomains);
      if (!requestIsCurrent()) return;
      if (result.ok) {
        setSnapshot(result.value);
        setSnapshotUserId(requestedUserId);
        setStatus('ready');
        return;
      }
      if (result.error.kind === 'session-expired') {
        await refreshSession();
        if (!requestIsCurrent()) return;
      }
      setSnapshot(null);
      setSnapshotUserId(requestedUserId);
      setStatus('error');
    })();

    return () => {
      active = false;
    };
  }, [enabledDomains, refreshSession, userId]);

  const currentSnapshot = userId !== null && snapshotUserId === userId ? snapshot : null;
  const displayedStatus: LoadStatus =
    userId === null ? 'ready' : snapshotUserId === userId ? status : 'loading';
  const evidenceCount = currentSnapshot?.domains.reduce((total, domain) => total + domain.evidenceCount, 0) ?? 0;
  const knownDomainCount = currentSnapshot?.domains.filter((domain) => domain.score !== null).length ?? 0;
  const mapSignal = useMemo(() => {
    if (!currentSnapshot || currentSnapshot.domains.length === 0 || knownDomainCount !== currentSnapshot.domains.length) return null;
    return currentSnapshot.domains.reduce((total, domain) => total + (domain.score ?? 0), 0) / currentSnapshot.domains.length;
  }, [currentSnapshot, knownDomainCount]);

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

      {displayedStatus === 'loading' ? <MizanText accessibilityLiveRegion="polite" muted>{local.loading}</MizanText> : null}
      {displayedStatus === 'error' ? (
        <Card style={{ backgroundColor: palette.surfaceMuted }}><MizanText accessibilityLiveRegion="polite" muted>{local.error}</MizanText></Card>
      ) : null}
      {displayedStatus === 'ready' && evidenceCount === 0 ? (
        <Card style={{ backgroundColor: palette.surfaceMuted }}><MizanText accessibilityLiveRegion="polite" muted>{local.allEmpty}</MizanText></Card>
      ) : null}

      {displayedStatus === 'ready' && currentSnapshot && currentSnapshot.domains.length > 0 ? (
        <>
          <Card style={styles.visualCard}>
            <View style={styles.visualHeading}>
              <MizanText variant="title">{local.chartTitle}</MizanText>
              <MizanText muted>{local.chartBody}</MizanText>
            </View>
            <View
              style={[
                styles.visualComposition,
                wide ? styles.visualCompositionWide : null,
                wide && { flexDirection: isRtl ? 'row-reverse' : 'row' },
              ]}>
              <View style={styles.radarColumn}>
                <RadarChart domains={currentSnapshot.domains} locale={locale} size={chartSize} />
                <View style={[styles.mapSummary, { backgroundColor: palette.surfaceMuted }]}>
                  <MizanText variant="label">
                    {mapSignal === null
                      ? `${local.supportedDomains}: ${formatLocalizedNumber(knownDomainCount, locale, 0)} / ${formatLocalizedNumber(currentSnapshot.domains.length, locale, 0)}`
                      : `${local.mapSignal}: ${formatLocalizedNumber(Math.round(mapSignal), locale, 0)} / ${formatLocalizedNumber(100, locale, 0)}`}
                  </MizanText>
                  <MizanText variant="caption" muted>
                    {mapSignal === null ? local.building : local.mapSignalBody}
                  </MizanText>
                </View>
              </View>

              <View style={styles.overviewColumn}>
                <View style={styles.visualHeading}>
                  <MizanText variant="title">{local.overview}</MizanText>
                  <MizanText muted>{local.overviewBody}</MizanText>
                </View>
                {currentSnapshot.domains.map((domain) => (
                  <DomainCard key={domain.domainId} domain={domain} locale={locale} isRtl={isRtl} />
                ))}
              </View>
            </View>
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.lg, flexWrap: 'wrap' },
  heading: { flex: 1, minWidth: 0, gap: Spacing.xs },
  heroCard: { gap: Spacing.xl },
  heroCopy: { gap: Spacing.sm },
  visualCard: { gap: Spacing.xl },
  visualHeading: { gap: Spacing.sm },
  visualComposition: { alignItems: 'stretch', gap: Spacing.xl },
  visualCompositionWide: { alignItems: 'flex-start' },
  radarColumn: { alignItems: 'center', flexShrink: 0, gap: Spacing.lg },
  overviewColumn: { flex: 1, minWidth: 0, gap: Spacing.lg },
  radar: { alignSelf: 'center', position: 'relative' },
  radarRing: { borderRadius: Radius.pill, borderWidth: Controls.borderWidth, position: 'absolute' },
  radarDot: { borderRadius: Radius.pill, height: 10, position: 'absolute', width: 10 },
  radarAxisLabel: { alignItems: 'center', gap: 2, position: 'absolute' },
  radarCenter: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: Controls.borderWidth,
    height: 86,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    position: 'absolute',
    width: 116,
  },
  centeredText: { textAlign: 'center' },
  mapSummary: { borderRadius: Radius.md, gap: Spacing.xs, padding: Spacing.lg, width: '100%' },
  domainCard: { gap: Spacing.lg },
  domainHeader: { alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.md, flexWrap: 'wrap' },
  domainIdentity: { alignItems: 'center', flex: 1, gap: Spacing.md, minWidth: 180 },
  domainIcon: { alignItems: 'center', borderRadius: Radius.md, height: 44, justifyContent: 'center', width: 44 },
  evidenceRow: { alignItems: 'center', gap: Spacing.sm },
  meterTrack: { borderRadius: Radius.pill, height: 8, overflow: 'hidden' },
  meterFill: { borderRadius: Radius.pill, height: '100%' },
  metric: { gap: Spacing.sm, borderTopWidth: Controls.borderWidth, paddingTop: Spacing.md },
  metricTitleRow: { alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md, flexWrap: 'wrap' },
  scorePill: { minHeight: Controls.minimumTouchHeight, justifyContent: 'center', paddingHorizontal: Spacing.md, borderRadius: Radius.pill },
  flexibleRowText: { flexShrink: 1 },
  detailGroup: { gap: Spacing.xs },
  trendPill: { alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.pill, maxWidth: '100%' },
});