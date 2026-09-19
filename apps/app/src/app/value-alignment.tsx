import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import {
  loadPersonalValueAlignments,
  type PersonalValueAlignment,
} from '@/application/value-alignment';
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
    body: 'هذه قراءة محايدة للأدلة المتاحة فقط، وليست حكمًا على هويتك أو أخلاقك. إذا كانت الأدلة قليلة يبقي ميزان النتيجة مجهولة.',
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
        <MizanText variant="title">{labels.overviewTitle}</MizanText>
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
            return (
              <Card key={summary.valueId} style={styles.valueCard}>
                <View style={[styles.cardHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <MizanText variant="title" style={styles.flexibleText}>{labels.values[valueId]}</MizanText>
                  <View style={[styles.statusPill, { backgroundColor: palette.accentSoft }]}>
                    <MizanText variant="caption">{statusLabel(summary)}</MizanText>
                  </View>
                </View>

                <View style={[styles.metrics, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.metricTile, { backgroundColor: palette.surfaceMuted }]}>
                    <MizanText variant="caption" muted>{labels.confidence}</MizanText>
                    <MizanText variant="label">{labels.confidenceLevels[summary.confidence.level]}</MizanText>
                  </View>
                  <View style={[styles.metricTile, { backgroundColor: palette.surfaceMuted }]}>
                    <MizanText variant="caption" muted>{labels.evidence}</MizanText>
                    <MizanText variant="title">{formatLocalizedNumber(summary.confidence.evidenceCount, locale, 0)}</MizanText>
                  </View>
                </View>

                <View style={[styles.signalSection, { borderTopColor: palette.border }]}>
                  <MizanText variant="label">{labels.watchSignals}</MizanText>
                  <MizanText muted>
                    {summary.watchSignals.length > 0
                      ? summary.watchSignals.map((signal) => signalLabel(signal, locale)).join(' · ')
                      : labels.noWatchSignals}
                  </MizanText>
                </View>

                <View style={[styles.signalSection, { borderTopColor: palette.border }]}>
                  <MizanText variant="label">{labels.supportingSignals}</MizanText>
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
  valueGrid: { flexWrap: 'wrap', alignItems: 'stretch', gap: Spacing.lg },
  valueCard: { flexGrow: 1, flexShrink: 1, flexBasis: 360 },
  cardHeader: { alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.md, flexWrap: 'wrap' },
  flexibleText: { flexShrink: 1 },
  statusPill: { minHeight: Controls.minimumTouchHeight, justifyContent: 'center', borderRadius: Radius.pill, paddingHorizontal: Spacing.md, maxWidth: '100%' },
  metrics: { flexWrap: 'wrap', gap: Spacing.md },
  metricTile: { flexGrow: 1, flexBasis: 150, minWidth: 0, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  signalSection: { borderTopWidth: Controls.borderWidth, paddingTop: Spacing.md, gap: Spacing.sm },
});
