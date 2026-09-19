import type { ConfidenceLevel } from '@mizan/core';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import { loadDailySnapshot } from '@/application/daily-intelligence';
import {
  loadPersonalizedDailyRecommendation,
  recordOneMoveDecision,
  type DailyRecommendation,
  type DailyRecommendationOption,
  type OneMoveDecision,
} from '@/application/daily-recommendation';
import { Card, MizanText, PrimaryButton, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Palette, Spacing } from '@/constants/theme';
import type { TranslationKey } from '@/i18n';
import { formatLocalizedNumber } from '@/i18n/number-input';
import { useAppState } from '@/state/app-state';

type LoadStatus = 'loading' | 'ready' | 'error';
type DecisionStatus = 'idle' | 'saving' | OneMoveDecision | 'offline' | 'error';

const copy = {
  ar: {
    eyebrow: 'تركيز اليوم',
    title: 'خطوتك الواحدة، مباشرة',
    body: 'اقتراح واحد محافظ مبني على أدلتك الحالية. القرار يظل لك، ويمكنك التأجيل أو الرفض بلا عقوبة.',
  },
  en: {
    eyebrow: 'Today focus',
    title: 'Your One Move, directly',
    body: 'One conservative suggestion based on your current evidence. The decision stays yours, with no penalty for deferring or declining.',
  },
} as const;

function actionLabelKey(actionId: string): TranslationKey | null {
  if (actionId === 'protect-recovery-window') return 'actionProtectRecoveryWindow';
  if (actionId === 'meaningful-connection') return 'actionMeaningfulConnection';
  return null;
}

function reasonLabelKey(signal: DailyRecommendationOption['reasonSignal']): TranslationKey {
  if (signal === 'recovery') return 'oneMoveWhyRecovery';
  if (signal === 'energy') return 'oneMoveWhyEnergy';
  if (signal === 'connection') return 'oneMoveWhyConnection';
  return 'oneMoveWhyOverload';
}

function confidenceLabelKey(level: ConfidenceLevel): TranslationKey {
  if (level === 'known') return 'confidenceKnown';
  if (level === 'likely') return 'confidenceLikely';
  if (level === 'possible') return 'confidencePossible';
  return 'confidenceInsufficient';
}

function decisionMessageKey(status: DecisionStatus): TranslationKey | null {
  if (status === 'saving') return 'oneMoveSaving';
  if (status === 'accepted') return 'oneMoveAccepted';
  if (status === 'deferred') return 'oneMoveDeferred';
  if (status === 'declined') return 'oneMoveDeclined';
  if (status === 'offline') return 'oneMoveSaveOffline';
  if (status === 'error') return 'oneMoveSaveError';
  return null;
}

export default function OneMoveScreen() {
  const { locale, refreshSession, t, userId } = useAppState();
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const activeUserRef = useRef(userId);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('loading');
  const [recommendation, setRecommendation] = useState<DailyRecommendation | null>(null);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [decisionStatus, setDecisionStatus] = useState<DecisionStatus>('idle');
  const pageCopy = copy[locale];

  useEffect(() => {
    activeUserRef.current = userId;
  }, [userId]);

  useEffect(() => {
    let active = true;
    setLoadStatus('loading');
    setRecommendation(null);
    setSelectedActionId(null);
    setDecisionStatus('idle');

    void (async () => {
      if (!userId) {
        if (active) setLoadStatus('ready');
        return;
      }

      const snapshot = await loadDailySnapshot(userId);
      if (!active) return;
      if (!snapshot.ok) {
        if (snapshot.error.kind === 'session-expired') await refreshSession();
        if (active) setLoadStatus('error');
        return;
      }

      const nextRecommendation = await loadPersonalizedDailyRecommendation(userId, snapshot.value.humanState);
      if (!active) return;
      setRecommendation(nextRecommendation);
      setSelectedActionId(nextRecommendation?.primary.actionId ?? null);
      setLoadStatus('ready');
    })();

    return () => {
      active = false;
    };
  }, [refreshSession, userId]);

  const options = recommendation ? [recommendation.primary, ...recommendation.alternatives] : [];
  const activeRecommendation =
    options.find((option) => option.actionId === selectedActionId) ?? recommendation?.primary ?? null;
  const activeLabelKey = activeRecommendation ? actionLabelKey(activeRecommendation.actionId) : null;
  const alternative = recommendation?.alternatives.find(
    (option) => option.actionId !== activeRecommendation?.actionId,
  ) ?? (activeRecommendation?.actionId !== recommendation?.primary.actionId ? recommendation?.primary : null);
  const alternativeLabelKey = alternative ? actionLabelKey(alternative.actionId) : null;
  const finished =
    decisionStatus === 'accepted' || decisionStatus === 'deferred' || decisionStatus === 'declined';
  const decisionMessage = decisionMessageKey(decisionStatus);

  const handleDecision = async (decision: OneMoveDecision) => {
    if (!userId || !recommendation || !activeRecommendation || decisionStatus === 'saving' || finished) return;
    const actingUserId = userId;
    setDecisionStatus('saving');
    const result = await recordOneMoveDecision(
      actingUserId,
      activeRecommendation,
      decision,
      activeRecommendation.actionId !== recommendation.primary.actionId,
    );
    if (activeUserRef.current !== actingUserId) return;
    if (!result.ok) {
      if (result.error.kind === 'session-expired') await refreshSession();
      setDecisionStatus(
        result.error.kind === 'unavailable' || result.error.kind === 'not-configured' ? 'offline' : 'error',
      );
      return;
    }
    setDecisionStatus(decision);
  };

  return (
    <Screen>
      <Card style={[styles.hero, { backgroundColor: palette.accentSoft, borderColor: palette.accent }]}>
        <MizanText variant="label" muted>{pageCopy.eyebrow}</MizanText>
        <MizanText variant="display">{pageCopy.title}</MizanText>
        <MizanText muted>{pageCopy.body}</MizanText>
      </Card>

      {loadStatus === 'loading' ? <MizanText accessibilityLiveRegion="polite" muted>{t('loading')}</MizanText> : null}
      {loadStatus === 'error' ? <MizanText accessibilityLiveRegion="polite" muted>{t('currentStateError')}</MizanText> : null}
      {loadStatus === 'ready' && (!activeRecommendation || !activeLabelKey) ? (
        <Card>
          <MizanText variant="title">{t('oneMoveTitle')}</MizanText>
          <MizanText accessibilityLiveRegion="polite" muted>{t('oneMoveEmpty')}</MizanText>
        </Card>
      ) : null}

      {activeRecommendation && activeLabelKey ? (
        <Card style={styles.focusCard}>
          <MizanText variant="label" muted>{t('oneMoveTitle')}</MizanText>
          <MizanText variant="title">{t(activeLabelKey)}</MizanText>
          <MizanText muted>{t(reasonLabelKey(activeRecommendation.reasonSignal))}</MizanText>
          <MizanText variant="caption" muted>
            {t(confidenceLabelKey(activeRecommendation.confidence.level))} · {t('evidenceLabel')}: {formatLocalizedNumber(activeRecommendation.evidence.length, locale, 0)}
          </MizanText>

          {alternative && alternativeLabelKey && !finished ? (
            <View style={styles.group}>
              <MizanText variant="caption" muted>{t('oneMoveAlternative')}</MizanText>
              <SecondaryButton
                label={t(alternativeLabelKey)}
                disabled={decisionStatus === 'saving'}
                onPress={() => {
                  setSelectedActionId(alternative.actionId);
                  setDecisionStatus('idle');
                }}
              />
            </View>
          ) : null}

          <View style={styles.group}>
            <PrimaryButton
              label={t('oneMoveAccept')}
              disabled={decisionStatus === 'saving' || finished}
              onPress={() => void handleDecision('accepted')}
            />
            <SecondaryButton
              label={t('oneMoveDefer')}
              disabled={decisionStatus === 'saving' || finished}
              onPress={() => void handleDecision('deferred')}
            />
            <SecondaryButton
              label={t('oneMoveDecline')}
              disabled={decisionStatus === 'saving' || finished}
              onPress={() => void handleDecision('declined')}
            />
          </View>

          {decisionMessage ? (
            <MizanText accessibilityLiveRegion="polite" muted>{t(decisionMessage)}</MizanText>
          ) : null}
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: Spacing.md,
  },
  focusCard: {
    gap: Spacing.lg,
  },
  group: {
    gap: Spacing.sm,
  },
});
