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
import { AppIcon, type AppIconName } from '@/components/app-icon';
import { BrandedIllustration } from '@/components/branded-illustration';
import { Card, MizanText, PrimaryButton, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Controls, Palette, Radius, Spacing } from '@/constants/theme';
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
    confidence: 'الثقة',
  },
  en: {
    eyebrow: 'Today focus',
    title: 'Your One Move, directly',
    body: 'One conservative suggestion based on your current evidence. The decision stays yours, with no penalty for deferring or declining.',
    confidence: 'Confidence',
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

function reasonIconName(signal: DailyRecommendationOption['reasonSignal']): AppIconName {
  if (signal === 'recovery') return 'recovery';
  if (signal === 'energy') return 'energy';
  if (signal === 'connection') return 'connection';
  return 'overload';
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
  const { isRtl, locale, refreshSession, t, userId } = useAppState();
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const activeUserRef = useRef(userId);
  activeUserRef.current = userId;
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('loading');
  const [recommendation, setRecommendation] = useState<DailyRecommendation | null>(null);
  const [recommendationUserId, setRecommendationUserId] = useState<string | null>(null);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [decisionStatus, setDecisionStatus] = useState<DecisionStatus>('idle');
  const pageCopy = copy[locale];

  useEffect(() => {
    let active = true;
    const requestedUserId = userId;
    const requestIsCurrent = () => active && activeUserRef.current === requestedUserId;

    void (async () => {
      await Promise.resolve();
      if (!requestIsCurrent()) return;
      setLoadStatus('loading');
      setRecommendation(null);
      setRecommendationUserId(requestedUserId);
      setSelectedActionId(null);
      setDecisionStatus('idle');

      if (!requestedUserId) {
        if (requestIsCurrent()) setLoadStatus('ready');
        return;
      }

      const snapshot = await loadDailySnapshot(requestedUserId);
      if (!requestIsCurrent()) return;
      if (!snapshot.ok) {
        if (snapshot.error.kind === 'session-expired') {
          await refreshSession();
          if (!requestIsCurrent()) return;
        }
        setLoadStatus('error');
        return;
      }

      const nextRecommendation = await loadPersonalizedDailyRecommendation(
        requestedUserId,
        snapshot.value.humanState,
      );
      if (!requestIsCurrent()) return;
      setRecommendation(nextRecommendation);
      setRecommendationUserId(requestedUserId);
      setSelectedActionId(nextRecommendation?.primary.actionId ?? null);
      setLoadStatus('ready');
    })();

    return () => {
      active = false;
    };
  }, [refreshSession, userId]);

  const currentRecommendation =
    userId !== null && recommendationUserId === userId ? recommendation : null;
  const displayedLoadStatus: LoadStatus =
    userId === null ? 'ready' : recommendationUserId === userId ? loadStatus : 'loading';
  const options = currentRecommendation
    ? [currentRecommendation.primary, ...currentRecommendation.alternatives]
    : [];
  const activeRecommendation =
    options.find((option) => option.actionId === selectedActionId) ?? currentRecommendation?.primary ?? null;
  const activeLabelKey = activeRecommendation ? actionLabelKey(activeRecommendation.actionId) : null;
  const alternative = currentRecommendation?.alternatives.find(
    (option) => option.actionId !== activeRecommendation?.actionId,
  ) ?? (activeRecommendation?.actionId !== currentRecommendation?.primary.actionId ? currentRecommendation?.primary : null);
  const alternativeLabelKey = alternative ? actionLabelKey(alternative.actionId) : null;
  const finished =
    decisionStatus === 'accepted' || decisionStatus === 'deferred' || decisionStatus === 'declined';
  const decisionMessage = decisionMessageKey(decisionStatus);

  const handleDecision = async (decision: OneMoveDecision) => {
    if (
      !userId ||
      activeUserRef.current !== userId ||
      recommendationUserId !== userId ||
      !currentRecommendation ||
      !activeRecommendation ||
      decisionStatus === 'saving' ||
      finished
    ) {
      return;
    }
    const actingUserId = userId;
    setDecisionStatus('saving');
    const result = await recordOneMoveDecision(
      actingUserId,
      activeRecommendation,
      decision,
      activeRecommendation.actionId !== currentRecommendation.primary.actionId,
    );
    if (activeUserRef.current !== actingUserId) return;
    if (!result.ok) {
      if (result.error.kind === 'session-expired') {
        await refreshSession();
        if (activeUserRef.current !== actingUserId) return;
      }
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
        <View style={[styles.heroLayout, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={styles.heroCopy}>
            <MizanText variant="label" muted>{pageCopy.eyebrow}</MizanText>
            <MizanText variant="display">{pageCopy.title}</MizanText>
            <MizanText muted>{pageCopy.body}</MizanText>
          </View>
          <BrandedIllustration variant="focus" size={132} />
        </View>
      </Card>

      {displayedLoadStatus === 'loading' ? (
        <Card style={[styles.stateCard, { backgroundColor: palette.surfaceMuted }]}>
          <MizanText accessibilityLiveRegion="polite" muted>{t('loading')}</MizanText>
        </Card>
      ) : null}
      {displayedLoadStatus === 'error' ? (
        <Card style={[styles.stateCard, { backgroundColor: palette.surfaceMuted }]}>
          <MizanText accessibilityLiveRegion="polite" muted>{t('currentStateError')}</MizanText>
        </Card>
      ) : null}
      {displayedLoadStatus === 'ready' && (!activeRecommendation || !activeLabelKey) ? (
        <Card style={[styles.stateCard, { backgroundColor: palette.surfaceMuted }]}>
          <MizanText variant="title">{t('oneMoveTitle')}</MizanText>
          <MizanText accessibilityLiveRegion="polite" muted>{t('oneMoveEmpty')}</MizanText>
        </Card>
      ) : null}

      {activeRecommendation && activeLabelKey ? (
        <Card style={styles.focusCard}>
          <View style={[styles.focusHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <View style={[styles.iconWell, { backgroundColor: palette.accentSoft }]}>
              <AppIcon name="oneMove" color={palette.accent} size={24} />
            </View>
            <View style={styles.focusCopy}>
              <MizanText variant="label" muted>{t('oneMoveTitle')}</MizanText>
              <MizanText variant="title">{t(activeLabelKey)}</MizanText>
            </View>
          </View>

          <View style={[styles.reasonPanel, { backgroundColor: palette.surfaceMuted }]}>
            <View style={[styles.reasonRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <AppIcon name={reasonIconName(activeRecommendation.reasonSignal)} color={palette.accent} size={22} />
              <MizanText muted style={styles.reasonText}>
                {t(reasonLabelKey(activeRecommendation.reasonSignal))}
              </MizanText>
            </View>
          </View>

          <View style={[styles.detailGrid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <View style={[styles.detailTile, { backgroundColor: palette.surfaceMuted }]}>
              <View style={[styles.detailHeading, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <AppIcon name="confidence" color={palette.accent} size={18} />
                <MizanText variant="caption" muted>{pageCopy.confidence}</MizanText>
              </View>
              <MizanText variant="label">{t(confidenceLabelKey(activeRecommendation.confidence.level))}</MizanText>
            </View>
            <View style={[styles.detailTile, { backgroundColor: palette.surfaceMuted }]}>
              <View style={[styles.detailHeading, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <AppIcon name="evidence" color={palette.accent} size={18} />
                <MizanText variant="caption" muted>{t('evidenceLabel')}</MizanText>
              </View>
              <MizanText variant="title">
                {formatLocalizedNumber(activeRecommendation.evidence.length, locale, 0)}
              </MizanText>
            </View>
          </View>

          {alternative && alternativeLabelKey && !finished ? (
            <View style={[styles.alternativePanel, { backgroundColor: palette.surfaceMuted }]}>
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
            <View style={[styles.statusPanel, { backgroundColor: palette.accentSoft }]}>
              <MizanText accessibilityLiveRegion="polite" muted>{t(decisionMessage)}</MizanText>
            </View>
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
  heroLayout: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.xl,
  },
  heroCopy: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 320,
    minWidth: 0,
    gap: Spacing.md,
  },
  stateCard: {
    paddingVertical: Spacing.lg,
  },
  focusCard: {
    gap: Spacing.xl,
  },
  focusHeader: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWell: {
    width: Controls.standardHeight,
    height: Controls.standardHeight,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusCopy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.xs,
  },
  reasonPanel: {
    borderRadius: Radius.md,
    padding: Spacing.lg,
  },
  reasonRow: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  reasonText: {
    flex: 1,
    minWidth: 0,
  },
  detailGrid: {
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  detailTile: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 160,
    minWidth: 0,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  detailHeading: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  alternativePanel: {
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  group: {
    gap: Spacing.sm,
  },
  statusPanel: {
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
});