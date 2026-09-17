import type { ConfidenceLevel, HumanStateVector } from '@mizan/core';
import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import { loadCurrentHumanState } from '@/application/daily-intelligence';
import { Card, MizanText } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Palette, Radius, Spacing } from '@/constants/theme';
import type { TranslationKey } from '@/i18n';
import { DomainId, useAppState } from '@/state/app-state';

type StateLoadStatus = 'loading' | 'ready' | 'error';

function stateLabelKey(key: string): TranslationKey | null {
  if (key === 'energy') return 'checkInEnergy';
  if (key === 'recovery') return 'checkInRecovery';
  if (key === 'mental_load') return 'checkInMentalLoad';
  if (key === 'connection') return 'checkInConnection';
  if (key === 'overload_risk') return 'stateOverloadRisk';
  return null;
}

function confidenceLabelKey(level: ConfidenceLevel): TranslationKey {
  if (level === 'known') return 'confidenceKnown';
  if (level === 'likely') return 'confidenceLikely';
  if (level === 'possible') return 'confidencePossible';
  return 'confidenceInsufficient';
}

export default function TodayScreen() {
  const { enabledDomains, isRtl, refreshSession, syncStatus, t, userId } = useAppState();
  const [humanState, setHumanState] = useState<HumanStateVector | null>(null);
  const [stateLoadStatus, setStateLoadStatus] = useState<StateLoadStatus>('loading');
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const syncMessage = syncStatus === 'offline' ? t('syncOffline') : syncStatus === 'error' ? t('syncError') : null;

  useEffect(() => {
    let active = true;
    if (!userId) {
      setHumanState(null);
      setStateLoadStatus('ready');
      return () => {
        active = false;
      };
    }

    setStateLoadStatus('loading');
    void loadCurrentHumanState(userId).then(async (result) => {
      if (!active) return;
      if (result.ok) {
        setHumanState(result.value);
        setStateLoadStatus('ready');
        return;
      }
      if (result.error.kind === 'session-expired') await refreshSession();
      if (active) setStateLoadStatus('error');
    });

    return () => {
      active = false;
    };
  }, [refreshSession, userId]);

  const visibleState = useMemo(
    () =>
      (humanState?.components ?? []).flatMap((component) => {
        const labelKey = stateLabelKey(component.key);
        if (!labelKey || component.value === null) return [];
        return [{ component, labelKey }];
      }),
    [humanState],
  );

  return (
    <Screen>
      <View style={[styles.topRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        <View style={styles.heading}>
          <MizanText variant="label" muted>{t('appName')}</MizanText>
          <MizanText variant="display">{t('todayTitle')}</MizanText>
        </View>
        <Link href="/settings" asChild>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.settingsButton,
              { borderColor: palette.border, backgroundColor: palette.surface, opacity: pressed ? 0.72 : 1 },
            ]}>
            <MizanText variant="label">{t('settings')}</MizanText>
          </Pressable>
        </Link>
      </View>

      {syncMessage ? <MizanText muted>{syncMessage}</MizanText> : null}

      <Card>
        <MizanText variant="title">{t('checkInPromptTitle')}</MizanText>
        <MizanText muted>{t('checkInPromptBody')}</MizanText>
        <Link href="/check-in" asChild>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.primaryAction,
              { backgroundColor: palette.accent, opacity: pressed ? 0.82 : 1 },
            ]}>
            <MizanText variant="label" style={styles.primaryActionText}>{t('checkInStart')}</MizanText>
          </Pressable>
        </Link>
      </Card>

      <Card>
        <MizanText variant="title">{t('currentStateTitle')}</MizanText>
        <MizanText muted>{t('currentStateBody')}</MizanText>
        {stateLoadStatus === 'loading' ? <MizanText muted>{t('loading')}</MizanText> : null}
        {stateLoadStatus === 'error' ? <MizanText muted>{t('currentStateError')}</MizanText> : null}
        {stateLoadStatus === 'ready' && visibleState.length === 0 ? (
          <MizanText muted>{t('currentStateEmpty')}</MizanText>
        ) : null}
        {visibleState.map(({ component, labelKey }) => (
          <View key={component.key} style={[styles.stateItem, { borderTopColor: palette.border }]}>
            <View style={[styles.stateRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <MizanText variant="label">{t(labelKey)}</MizanText>
              <MizanText variant="title">{Math.round(component.value ?? 0)} / 100</MizanText>
            </View>
            <MizanText variant="caption" muted>
              {t(confidenceLabelKey(component.confidence.level))} · {t('evidenceLabel')}: {component.evidence.length}
            </MizanText>
          </View>
        ))}
      </Card>

      <Card>
        <View style={[styles.statusRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={[styles.dot, { backgroundColor: palette.accent }]} />
          <MizanText variant="label" muted>{t('learningState')}</MizanText>
        </View>
        <MizanText variant="title">{t('learningState')}</MizanText>
        <MizanText muted>{t('learningBody')}</MizanText>
      </Card>

      <View style={styles.section}>
        <MizanText variant="title">{t('priorities')}</MizanText>
        <View style={styles.grid}>
          {enabledDomains.map((domainId: DomainId) => (
            <Card key={domainId} style={styles.domainCard}>
              <MizanText variant="label">{t(domainId)}</MizanText>
              <MizanText variant="caption" muted>{t('learningState')}</MizanText>
            </Card>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { alignItems: 'center', justifyContent: 'space-between', gap: Spacing.lg },
  heading: { flex: 1, gap: Spacing.xs },
  settingsButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: Spacing.lg, borderWidth: 1, borderRadius: Radius.pill },
  primaryAction: { minHeight: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  primaryActionText: { color: '#FFFFFF', textAlign: 'center' },
  stateItem: { gap: Spacing.xs, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.md },
  stateRow: { alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
  statusRow: { alignItems: 'center', gap: Spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  section: { gap: Spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  domainCard: { minWidth: 220, flexGrow: 1, flexBasis: 240 },
});
