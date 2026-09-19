import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import {
  loadPersonalValueAlignments,
  type PersonalValueAlignment,
} from '@/application/value-alignment';
import { AppIcon, type AppIconName } from '@/components/app-icon';
import { Card, MizanText, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Controls, Palette, Radius, Spacing } from '@/constants/theme';
import { formatLocalizedNumber } from '@/i18n/number-input';
import { useAppState, type PersonalValue } from '@/state/app-state';

type LoadStatus = 'loading' | 'ready' | 'error';

const copy = {
  ar: {
    eyebrow: 'القيم والهوية',
    title: 'هل أنماطك الحالية تعطي قيمك المساحة التي اخترتها؟',
    body: 'هذه قراءة محايدة للأدلة المتاحة فقط، وليست حكمًا على هويتك أو أخلاقك. إذا كانت الأدلة قليلة يُبقي ميزان النتيجة مجهولة.',
    loading: 'جارٍ قراءة إشارات القيم…',
    error: 'تعذر قراءة إشارات القيم الآن.',
    empty: 'لم تختر قيمًا شخصية بعد. يمكنك تعديلها من إعدادات الأولويات.',
    overviewTitle: 'قراءة القيم الحالية',
    overviewBody: 'كل بطاقة تربط قيمة اخترتها أنت بإشارات قابلة للفحص. لا توجد درجة هوية أو حكم أخلاقي.',
    supported: 'الأدلة المتاحة مستقرة أو تتحسن',
    watch: 'يوجد احتمال انحراف يستحق المراجعة',
    insufficient: 'الأدلة غير كافية',
    confidence: 'الثقة',
    evidence: 'عدد الأدلة',
    watchSignals: 'الإشارات التي تراجعت',
    supportingSignals: 'الإشارات المستقرة أو المتحسنة',
    noWatchSignals: 'لا توجد إشارات متراجعة مدعومة حاليًا.',
    noSupportingSignals: 'لا توجد إشارات داعمة كافية حاليًا.',
    unknownSignal: 'إشارة أخرى',
    caveat: 'الانحراف هنا يعني تغيرًا في إشارات مرتبطة بقيمة اخترتها أنت؛ لا يعني حكمًا على شخصيتك ولا يثبت سببًا.',
    back: 'العودة للإعدادات',
    values: {
      stability: 'الاستقرار',
      family: 'الأسرة',
      growth: 'النمو',
      meaning: 'المعنى',
    },
    signals: {
      recovery: 'التعافي',
      mental_load: 'الضغط الذهني',
      connection: 'التواصل',
    },
    confidenceLevels: {
      insufficient: 'غير كافية',
      possible: 'ممكنة',
      likely: 'مرجحة',
      known: 'قوية',
    },
  },
  en: {
    eyebrow: 'Values & identity',
    title: 'Are your current patterns giving your chosen values enough room?',
    body: 'This is a neutral reading of available evidence, not a judgment about your identity or character. When evidence is sparse, MIZAN keeps the result unknown.',
    loading: 'Reading value signals…',
    error: 'Value signals could not be loaded right now.',
    empty: 'You have not selected personal values yet. You can change them in your priority settings.',
    overviewTitle: 'Your current value signals',
    overviewBody: 'Each card links a value you chose to inspectable signals. There is no identity score or moral judgment.',
    supported: 'Available evidence is steady or improving',
    watch: 'Possible drift worth reviewing',
    insufficient: 'Insufficient evidence',
    confidence: 'Confidence',
    evidence: 'Evidence count',
    watchSignals: 'Signals moving away',
    supportingSignals: 'Steady or improving signals',
    noWatchSignals: 'No supported declining signals are present right now.',
    noSupportingSignals: 'There are not enough supporting signals yet.',
    unknownSignal: 'Another signal',
    caveat: 'Drift here only means a change in signals linked to a value you selected. It is not a judgment about you and does not prove a cause.',
    back: 'Back to settings',
    values: {
      stability: 'Stability',
      family: 'Family',
      growth: 'Growth',
      meaning: 'Meaning',
    },
    signals: {
      recovery: 'Recovery',
      mental_load: 'Mental load',
      connection: 'Connection',
    },
    confidenceLevels: {
      insufficient: 'Insufficient',
      possible: 'Possible',
      likely: 'Likely',
      known: 'Strong',
    },
  },
} as const;

function signalLabel(signal: string, locale: 'ar' | 'en'): string {
  const labels = copy[locale];
  return (labels.signals as Record<string, string>)[signal] ?? labels.unknownSignal;
}

function valueIconName(valueId: PersonalValue): AppIconName {
  if (valueId === 'stability') return 'margin';
  if (valueId === 'family') return 'connection';
  if (valueId === 'growth') return 'trendUp';
  return 'values';
}

function statusIconName(status: PersonalValueAlignment['status']): AppIconName {
  if (status === 'watch') return 'trendDown';
  if (status === 'supported') return 'trendUp';
  return 'evidence';
}

export default function ValueAlignmentScreen() {
  const { enabledDomains, isRtl, locale, personalValues, refreshSession, userId } = useAppState();
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [summaries, setSummaries] = useState<PersonalValueAlignment[]>([]);
  const labels = copy[locale];
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];

  useEffect(() => {
    let active = true;
    void (async () => {
      await Promise.resolve();
      if (!active) return;
      if (!userId || personalValues.length === 0) {
        setSummaries([]);
        setStatus('ready');
        return;
      }

      setStatus('loading');
      const result = await loadPersonalValueAlignments(userId, personalValues, enabledDomains);
      if (!active) return;
      if (!result.ok) {
        if (result.error.kind === 'session-expired') await refreshSession();
        if (active) setStatus('error');
        return;
      }
      setSummaries(result.value);
      setStatus('ready');
    })();

    return () => {
      active = false;
    };
  }, [enabledDomains, personalValues, refreshSession, userId]);

  const statusLabel = (summary: PersonalValueAlignment) => {
    if (summary.status === 'watch') return labels.watch;
    if (summary.status === 'supported') return labels.supported;
    return labels.insufficient;
  };

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
        <View style={[styles.heroHeading, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={[styles.iconWell, { backgroundColor: palette.surface }]}>
            <AppIcon name="values" color={palette.accent} size={24} />
          </View>
          <MizanText variant="title" style={styles.flexibleText}>{labels.overviewTitle}</MizanText>
        </View>
        <MizanText>{labels.body}</MizanText>
        <MizanText variant="caption" muted>{labels.overviewBody}</MizanText>
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
      {status === 'ready' && summaries.length === 0 ? (
        <Card style={{ backgroundColor: palette.surfaceMuted }}>
          <MizanText accessibilityLiveRegion="polite" muted>{labels.empty}</MizanText>
        </Card>
      ) : null}

      {status === 'ready' && summaries.length > 0 ? (
        <View style={[styles.valueGrid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          {summaries.map((summary) => {
            const valueId = summary.valueId as PersonalValue;
            const statusColor =
              summary.status === 'watch'
                ? palette.danger
                : summary.status === 'supported'
                  ? palette.accent
                  : palette.textMuted;
            const statusBackground = summary.status === 'supported' ? palette.accentSoft : palette.surfaceMuted;
            const statusBorder = summary.status === 'insufficient' ? palette.border : statusColor;
            const watchSignalColor = summary.watchSignals.length > 0 ? palette.danger : palette.textMuted;
            const supportingSignalColor = summary.supportingSignals.length > 0 ? palette.accent : palette.textMuted;
            return (
              <Card key={summary.valueId} style={styles.valueCard}>
                <View style={[styles.cardHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.titleGroup, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.iconWell, { backgroundColor: palette.accentSoft }]}>
                      <AppIcon name={valueIconName(valueId)} color={palette.accent} size={22} />
                    </View>
                    <MizanText variant="title" style={styles.flexibleText}>{labels.values[valueId]}</MizanText>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: statusBackground,
                        borderColor: statusBorder,
                        flexDirection: isRtl ? 'row-reverse' : 'row',
                      },
                    ]}>
                    <AppIcon name={statusIconName(summary.status)} color={statusColor} size={16} />
                    <MizanText variant="caption" style={{ color: statusColor }}>{statusLabel(summary)}</MizanText>
                  </View>
                </View>

                <View style={[styles.metrics, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.metricTile, { backgroundColor: palette.surfaceMuted }]}>
                    <View style={[styles.metricHeading, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                      <AppIcon name="confidence" color={palette.accent} size={18} />
                      <MizanText variant="caption" muted>{labels.confidence}</MizanText>
                    </View>
                    <MizanText variant="label">{labels.confidenceLevels[summary.confidence.level]}</MizanText>
                  </View>
                  <View style={[styles.metricTile, { backgroundColor: palette.surfaceMuted }]}>
                    <View style={[styles.metricHeading, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                      <AppIcon name="evidence" color={palette.accent} size={18} />
                      <MizanText variant="caption" muted>{labels.evidence}</MizanText>
                    </View>
                    <MizanText variant="title">{formatLocalizedNumber(summary.confidence.evidenceCount, locale, 0)}</MizanText>
                  </View>
                </View>

                <View style={[styles.signalSection, { borderTopColor: palette.border }]}>
                  <View style={[styles.signalHeading, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <AppIcon name="trendDown" color={watchSignalColor} size={18} />
                    <MizanText variant="label" style={{ color: watchSignalColor }}>{labels.watchSignals}</MizanText>
                  </View>
                  <MizanText muted>
                    {summary.watchSignals.length > 0
                      ? summary.watchSignals.map((signal) => signalLabel(signal, locale)).join(' · ')
                      : labels.noWatchSignals}
                  </MizanText>
                </View>

                <View style={[styles.signalSection, { borderTopColor: palette.border }]}>
                  <View style={[styles.signalHeading, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <AppIcon name="trendUp" color={supportingSignalColor} size={18} />
                    <MizanText variant="label" style={{ color: supportingSignalColor }}>{labels.supportingSignals}</MizanText>
                  </View>
                  <MizanText muted>
                    {summary.supportingSignals.length > 0
                      ? summary.supportingSignals.map((signal) => signalLabel(signal, locale)).join(' · ')
                      : labels.noSupportingSignals}
                  </MizanText>
                </View>
              </Card>
            );
          })}
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
  heroCard: { gap: Spacing.md },
  heroHeading: { alignItems: 'center', gap: Spacing.md },
  iconWell: {
    width: Controls.minimumTouchHeight,
    height: Controls.minimumTouchHeight,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  valueGrid: { flexWrap: 'wrap', alignItems: 'stretch', gap: Spacing.lg },
  valueCard: { flexGrow: 1, flexShrink: 1, flexBasis: 360 },
  cardHeader: { alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.md, flexWrap: 'wrap' },
  titleGroup: { flexGrow: 1, flexShrink: 1, flexBasis: 220, minWidth: 0, alignItems: 'center', gap: Spacing.md },
  flexibleText: { flexShrink: 1, minWidth: 0 },
  statusPill: {
    alignItems: 'center',
    borderRadius: Radius.pill,
    borderWidth: Controls.borderWidth,
    gap: Spacing.xs,
    justifyContent: 'center',
    minHeight: Controls.minimumTouchHeight,
    paddingHorizontal: Spacing.md,
    maxWidth: '100%',
  },
  metrics: { flexWrap: 'wrap', gap: Spacing.md },
  metricTile: { flexGrow: 1, flexBasis: 150, minWidth: 0, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  metricHeading: { alignItems: 'center', gap: Spacing.xs },
  signalSection: { borderTopWidth: Controls.borderWidth, paddingTop: Spacing.md, gap: Spacing.sm },
  signalHeading: { alignItems: 'center', gap: Spacing.xs },
});
