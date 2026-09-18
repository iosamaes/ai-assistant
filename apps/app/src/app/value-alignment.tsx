import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  loadPersonalValueAlignments,
  type PersonalValueAlignment,
} from '@/application/value-alignment';
import { Card, MizanText, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Spacing } from '@/constants/theme';
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
    supported: 'الأدلة المتاحة مستقرة أو تتحسن',
    watch: 'يوجد احتمال انحراف يستحق المراجعة',
    insufficient: 'الأدلة غير كافية',
    confidence: 'الثقة',
    evidence: 'عدد الأدلة',
    watchSignals: 'الإشارات التي تراجعت',
    supportingSignals: 'الإشارات المستقرة أو المتحسنة',
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
    supported: 'Available evidence is steady or improving',
    watch: 'Possible drift worth reviewing',
    insufficient: 'Insufficient evidence',
    confidence: 'Confidence',
    evidence: 'Evidence count',
    watchSignals: 'Signals moving away',
    supportingSignals: 'Steady or improving signals',
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
  const labels = copy[locale].signals as Record<string, string>;
  return labels[signal] ?? signal;
}

export default function ValueAlignmentScreen() {
  const { enabledDomains, locale, personalValues, refreshSession, userId } = useAppState();
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [summaries, setSummaries] = useState<PersonalValueAlignment[]>([]);
  const labels = copy[locale];

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
      <View style={styles.hero}>
        <MizanText variant="label" muted>{labels.eyebrow}</MizanText>
        <MizanText variant="display">{labels.title}</MizanText>
        <MizanText muted>{labels.body}</MizanText>
      </View>

      {status === 'loading' ? (
        <MizanText accessibilityLiveRegion="polite" muted>{labels.loading}</MizanText>
      ) : null}
      {status === 'error' ? (
        <MizanText accessibilityLiveRegion="polite" muted>{labels.error}</MizanText>
      ) : null}
      {status === 'ready' && summaries.length === 0 ? (
        <Card>
          <MizanText muted>{labels.empty}</MizanText>
        </Card>
      ) : null}

      {summaries.map((summary) => {
        const valueId = summary.valueId as PersonalValue;
        return (
          <Card key={summary.valueId}>
            <MizanText variant="title">{labels.values[valueId]}</MizanText>
            <MizanText variant="label">{statusLabel(summary)}</MizanText>
            <MizanText variant="caption" muted>
              {labels.confidence}: {labels.confidenceLevels[summary.confidence.level]} · {labels.evidence}: {summary.confidence.evidenceCount}
            </MizanText>
            {summary.watchSignals.length > 0 ? (
              <MizanText muted>
                {labels.watchSignals}: {summary.watchSignals.map((signal) => signalLabel(signal, locale)).join(' · ')}
              </MizanText>
            ) : null}
            {summary.supportingSignals.length > 0 ? (
              <MizanText muted>
                {labels.supportingSignals}: {summary.supportingSignals.map((signal) => signalLabel(signal, locale)).join(' · ')}
              </MizanText>
            ) : null}
          </Card>
        );
      })}

      <MizanText variant="caption" muted>{labels.caveat}</MizanText>
      <SecondaryButton compact label={labels.back} onPress={() => router.replace('/settings')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.md },
});
