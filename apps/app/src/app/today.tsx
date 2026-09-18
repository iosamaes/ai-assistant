import type { ConfidenceLevel, HumanStateVector, MomentumDirection } from '@mizan/core';
import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, useColorScheme, View } from 'react-native';

import {
  recoverPendingActionFeedback,
  recordExplicitActionOutcome,
} from '@/application/action-feedback';
import {
  loadCurrentHumanState,
  loadDailyOverview,
  type DailyOverview,
} from '@/application/daily-intelligence';
import {
  loadPersonalizedDailyRecommendation,
  recordOneMoveDecision,
  type DailyRecommendation,
  type DailyRecommendationOption,
  type OneMoveDecision,
} from '@/application/daily-recommendation';
import { Card, MizanText } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Palette, Radius, Spacing } from '@/constants/theme';
import type { TranslationKey } from '@/i18n';
import { DomainId, useAppState } from '@/state/app-state';

type StateLoadStatus = 'loading' | 'ready' | 'error';
type OverviewLoadStatus = 'loading' | 'ready' | 'error';
type RecommendationLoadStatus = 'loading' | 'ready';
type DecisionStatus = 'idle' | 'saving' | OneMoveDecision | 'offline' | 'error';
type FeedbackStatus = 'idle' | 'saving' | 'saved' | 'offline' | 'error';
type FeedbackTarget = { actionEventId: string; actionId: string; acceptedAt: string };

const OUTCOME_RATINGS = [1, 2, 3, 4, 5] as const;

const overviewCopy = {
  ar: {
    title: 'التوازن والزخم',
    body: 'يعتمد ميزان على أولويات موسمك والأدلة الفعلية فقط؛ أي مجال بلا دليل يبقى مجهولًا.',
    balance: 'التوازن مع موسمك',
    balanceEmpty: 'لا توجد أدلة كافية عبر كل المجالات ذات الأولوية لحساب التوازن الآن.',
    momentum: 'الزخم',
    momentumEmpty: 'نحتاج تاريخًا أوسع قبل وصف اتجاه التغيّر بثقة.',
    improving: 'يتحسن',
    stable: 'مستقر تقريبًا',
    declining: 'يتراجع',
    error: 'تعذر تحميل التوازن والزخم الآن.',
  },
  en: {
    title: 'Balance & momentum',
    body: 'MIZAN uses your season priorities and actual evidence only; any area without evidence stays unknown.',
    balance: 'Balance for your season',
    balanceEmpty: 'There is not enough evidence across every priority area to calculate balance yet.',
    momentum: 'Momentum',
    momentumEmpty: 'A broader history is needed before MIZAN can describe a change direction with confidence.',
    improving: 'Improving',
    stable: 'Roughly stable',
    declining: 'Declining',
    error: 'Balance and momentum could not be loaded right now.',
  },
} as const;

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

function momentumLabel(direction: MomentumDirection, locale: 'ar' | 'en'): string {
  const copy = overviewCopy[locale];
  if (direction === 'improving') return copy.improving;
  if (direction === 'declining') return copy.declining;
  return copy.stable;
}

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

function decisionMessageKey(status: DecisionStatus): TranslationKey | null {
  if (status === 'saving') return 'oneMoveSaving';
  if (status === 'accepted') return 'oneMoveAccepted';
  if (status === 'deferred') return 'oneMoveDeferred';
  if (status === 'declined') return 'oneMoveDeclined';
  if (status === 'offline') return 'oneMoveSaveOffline';
  if (status === 'error') return 'oneMoveSaveError';
  return null;
}

function feedbackMessageKey(status: FeedbackStatus): TranslationKey | null {
  if (status === 'saving') return 'feedbackSaving';
  if (status === 'saved') return 'feedbackSaved';
  if (status === 'offline') return 'feedbackOffline';
  if (status === 'error') return 'feedbackError';
  return null;
}

export default function TodayScreen() {
  const { enabledDomains, isRtl, locale, refreshSession, syncStatus, t, userId } = useAppState();
  const [humanState, setHumanState] = useState<HumanStateVector | null>(null);
  const [stateLoadStatus, setStateLoadStatus] = useState<StateLoadStatus>('loading');
  const [dailyOverview, setDailyOverview] = useState<DailyOverview | null>(null);
  const [overviewLoadStatus, setOverviewLoadStatus] = useState<OverviewLoadStatus>('loading');
  const [recommendation, setRecommendation] = useState<DailyRecommendation | null>(null);
  const [recommendationLoadStatus, setRecommendationLoadStatus] = useState<RecommendationLoadStatus>('loading');
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [decisionStatus, setDecisionStatus] = useState<DecisionStatus>('idle');
  const [feedbackTarget, setFeedbackTarget] = useState<FeedbackTarget | null>(null);
  const [feedbackUsefulness, setFeedbackUsefulness] = useState<number | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatus>('idle');
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const syncMessage = syncStatus === 'offline' ? t('syncOffline') : syncStatus === 'error' ? t('syncError') : null;
  const dailyCopy = overviewCopy[locale];

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

  useEffect(() => {
    let active = true;
    if (!userId) {
      setDailyOverview(null);
      setOverviewLoadStatus('ready');
      return () => {
        active = false;
      };
    }

    setOverviewLoadStatus('loading');
    void loadDailyOverview(userId).then(async (result) => {
      if (!active) return;
      if (result.ok) {
        setDailyOverview(result.value);
        setOverviewLoadStatus('ready');
        return;
      }
      if (result.error.kind === 'session-expired') await refreshSession();
      if (active) setOverviewLoadStatus('error');
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

  useEffect(() => {
    let active = true;
    if (!userId || !humanState) {
      setRecommendation(null);
      setRecommendationLoadStatus('ready');
      return () => {
        active = false;
      };
    }

    setRecommendationLoadStatus('loading');
    void loadPersonalizedDailyRecommendation(userId, humanState).then((nextRecommendation) => {
      if (!active) return;
      setRecommendation(nextRecommendation);
      setRecommendationLoadStatus('ready');
    });

    return () => {
      active = false;
    };
  }, [humanState, userId]);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setFeedbackTarget(null);
      return () => {
        active = false;
      };
    }

    void recoverPendingActionFeedback(userId).then(async (result) => {
      if (!active) return;
      if (!result.ok) {
        if (result.error.kind === 'session-expired') await refreshSession();
        return;
      }
      if (active) setFeedbackTarget(result.value);
    });

    return () => {
      active = false;
    };
  }, [refreshSession, userId]);

  useEffect(() => {
    setSelectedActionId(recommendation?.primary.actionId ?? null);
    setDecisionStatus('idle');
  }, [recommendation?.primary.actionId]);

  useEffect(() => {
    setFeedbackUsefulness(null);
    setFeedbackNote('');
    setFeedbackStatus('idle');
  }, [feedbackTarget?.actionEventId]);

  const recommendationOptions = recommendation
    ? [recommendation.primary, ...recommendation.alternatives]
    : [];
  const activeRecommendation =
    recommendationOptions.find((option) => option.actionId === selectedActionId) ?? recommendation?.primary ?? null;
  const activeActionLabel = activeRecommendation ? actionLabelKey(activeRecommendation.actionId) : null;
  const alternative = recommendation?.alternatives.find((option) => option.actionId !== activeRecommendation?.actionId) ??
    (activeRecommendation?.actionId !== recommendation?.primary.actionId ? recommendation?.primary : null);
  const alternativeLabel = alternative ? actionLabelKey(alternative.actionId) : null;
  const decisionFinished =
    decisionStatus === 'accepted' || decisionStatus === 'deferred' || decisionStatus === 'declined';
  const decisionMessage = decisionMessageKey(decisionStatus);
  const feedbackMessage = feedbackMessageKey(feedbackStatus);

  const handleDecision = async (decision: OneMoveDecision) => {
    if (!userId || !recommendation || !activeRecommendation || decisionStatus === 'saving' || decisionFinished) return;
    setDecisionStatus('saving');
    const result = await recordOneMoveDecision(
      userId,
      activeRecommendation,
      decision,
      activeRecommendation.actionId !== recommendation.primary.actionId,
    );
    if (!result.ok) {
      if (result.error.kind === 'session-expired') await refreshSession();
      setDecisionStatus(
        result.error.kind === 'unavailable' || result.error.kind === 'not-configured' ? 'offline' : 'error',
      );
      return;
    }

    setDecisionStatus(decision);
    if (decision === 'accepted') {
      setFeedbackTarget({
        actionEventId: result.value,
        actionId: activeRecommendation.actionId,
        acceptedAt: new Date().toISOString(),
      });
    }
  };

  const handleFeedback = async () => {
    if (
      !userId ||
      !feedbackTarget ||
      feedbackUsefulness === null ||
      feedbackStatus === 'saving' ||
      feedbackStatus === 'saved'
    ) {
      return;
    }

    setFeedbackStatus('saving');
    const result = await recordExplicitActionOutcome(
      userId,
      feedbackTarget.actionId,
      feedbackTarget.actionEventId,
      feedbackUsefulness,
      feedbackNote,
    );
    if (!result.ok) {
      if (result.error.kind === 'session-expired') await refreshSession();
      setFeedbackStatus(
        result.error.kind === 'unavailable' || result.error.kind === 'not-configured' ? 'offline' : 'error',
      );
      return;
    }

    setFeedbackStatus('saved');
  };

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
        <MizanText variant="title">{dailyCopy.title}</MizanText>
        <MizanText muted>{dailyCopy.body}</MizanText>
        {overviewLoadStatus === 'loading' ? <MizanText muted>{t('loading')}</MizanText> : null}
        {overviewLoadStatus === 'error' ? <MizanText muted>{dailyCopy.error}</MizanText> : null}
        {overviewLoadStatus === 'ready' ? (
          <View style={styles.oneMoveContent}>
            <View style={[styles.stateItem, { borderTopColor: palette.border }]}>
              <View style={[styles.stateRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <MizanText variant="label">{dailyCopy.balance}</MizanText>
                {dailyOverview?.balance?.score !== null && dailyOverview?.balance?.score !== undefined ? (
                  <MizanText variant="title">{Math.round(dailyOverview.balance.score)} / 100</MizanText>
                ) : null}
              </View>
              {dailyOverview?.balance?.score !== null && dailyOverview?.balance?.score !== undefined ? (
                <MizanText variant="caption" muted>
                  {t(confidenceLabelKey(dailyOverview.balance.confidence.level))} · {t('evidenceLabel')}: {dailyOverview.balance.evidence.length}
                </MizanText>
              ) : (
                <MizanText muted>{dailyCopy.balanceEmpty}</MizanText>
              )}
            </View>

            <View style={[styles.stateItem, { borderTopColor: palette.border }]}>
              <MizanText variant="label">{dailyCopy.momentum}</MizanText>
              {(dailyOverview?.momentum.length ?? 0) === 0 ? (
                <MizanText muted>{dailyCopy.momentumEmpty}</MizanText>
              ) : null}
              {dailyOverview?.momentum.map(({ metric, momentum }) => {
                const labelKey = stateLabelKey(metric);
                if (!labelKey) return null;
                return (
                  <View key={metric} style={styles.oneMoveContent}>
                    <View style={[styles.stateRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                      <MizanText>{t(labelKey)}</MizanText>
                      <MizanText variant="label">{momentumLabel(momentum.direction, locale)}</MizanText>
                    </View>
                    <MizanText variant="caption" muted>
                      {t(confidenceLabelKey(momentum.confidence.level))} · {t('evidenceLabel')}: {momentum.evidence.length}
                    </MizanText>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}
      </Card>

      <Card>
        <MizanText variant="title">{t('oneMoveTitle')}</MizanText>
        <MizanText muted>{t('oneMoveBody')}</MizanText>
        {stateLoadStatus === 'loading' || recommendationLoadStatus === 'loading' ? (
          <MizanText muted>{t('loading')}</MizanText>
        ) : null}
        {stateLoadStatus === 'ready' && recommendationLoadStatus === 'ready' && (!activeRecommendation || !activeActionLabel) ? (
          <MizanText muted>{t('oneMoveEmpty')}</MizanText>
        ) : null}
        {activeRecommendation && activeActionLabel ? (
          <View style={styles.oneMoveContent}>
            <MizanText variant="title">{t(activeActionLabel)}</MizanText>
            <MizanText muted>{t(reasonLabelKey(activeRecommendation.reasonSignal))}</MizanText>
            <MizanText variant="caption" muted>
              {t(confidenceLabelKey(activeRecommendation.confidence.level))} · {t('evidenceLabel')}: {activeRecommendation.evidence.length}
            </MizanText>

            {alternative && alternativeLabel && !decisionFinished ? (
              <View style={styles.alternativeBlock}>
                <MizanText variant="caption" muted>{t('oneMoveAlternative')}</MizanText>
                <Pressable
                  accessibilityRole="button"
                  disabled={decisionStatus === 'saving'}
                  onPress={() => {
                    setSelectedActionId(alternative.actionId);
                    setDecisionStatus('idle');
                  }}
                  style={({ pressed }) => [
                    styles.secondaryAction,
                    {
                      borderColor: palette.border,
                      backgroundColor: palette.surface,
                      opacity: decisionStatus === 'saving' ? 0.5 : pressed ? 0.72 : 1,
                    },
                  ]}>
                  <MizanText variant="label">{t(alternativeLabel)}</MizanText>
                </Pressable>
              </View>
            ) : null}

            <View style={[styles.decisionRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <Pressable
                accessibilityRole="button"
                disabled={decisionStatus === 'saving' || decisionFinished}
                onPress={() => void handleDecision('accepted')}
                style={({ pressed }) => [
                  styles.decisionButton,
                  {
                    backgroundColor: palette.accent,
                    opacity: decisionStatus === 'saving' || decisionFinished ? 0.5 : pressed ? 0.82 : 1,
                  },
                ]}>
                <MizanText variant="label" style={styles.primaryActionText}>{t('oneMoveAccept')}</MizanText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={decisionStatus === 'saving' || decisionFinished}
                onPress={() => void handleDecision('deferred')}
                style={({ pressed }) => [
                  styles.decisionButton,
                  styles.secondaryAction,
                  {
                    borderColor: palette.border,
                    backgroundColor: palette.surface,
                    opacity: decisionStatus === 'saving' || decisionFinished ? 0.5 : pressed ? 0.72 : 1,
                  },
                ]}>
                <MizanText variant="label">{t('oneMoveDefer')}</MizanText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={decisionStatus === 'saving' || decisionFinished}
                onPress={() => void handleDecision('declined')}
                style={({ pressed }) => [
                  styles.decisionButton,
                  styles.secondaryAction,
                  {
                    borderColor: palette.border,
                    backgroundColor: palette.surface,
                    opacity: decisionStatus === 'saving' || decisionFinished ? 0.5 : pressed ? 0.72 : 1,
                  },
                ]}>
                <MizanText variant="label">{t('oneMoveDecline')}</MizanText>
              </Pressable>
            </View>

            {decisionMessage ? <MizanText muted>{t(decisionMessage)}</MizanText> : null}
          </View>
        ) : null}

        {feedbackTarget ? (
          <View style={[styles.feedbackBlock, { borderTopColor: palette.border }]}>
            <MizanText variant="title">{t('feedbackTitle')}</MizanText>
            <MizanText muted>{t('feedbackBody')}</MizanText>
            <MizanText variant="label">{t('feedbackUsefulness')}</MizanText>
            <View style={[styles.ratingRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              {OUTCOME_RATINGS.map((value) => {
                const selected = feedbackUsefulness === value;
                const disabled = feedbackStatus === 'saving' || feedbackStatus === 'saved';
                return (
                  <Pressable
                    key={value}
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled }}
                    disabled={disabled}
                    onPress={() => {
                      setFeedbackUsefulness(value);
                      if (feedbackStatus === 'offline' || feedbackStatus === 'error') setFeedbackStatus('idle');
                    }}
                    style={({ pressed }) => [
                      styles.ratingButton,
                      {
                        borderColor: selected ? palette.accent : palette.border,
                        backgroundColor: selected ? palette.accent : palette.surface,
                        opacity: disabled ? 0.55 : pressed ? 0.76 : 1,
                      },
                    ]}>
                    <MizanText variant="label" style={selected ? styles.primaryActionText : undefined}>
                      {value}
                    </MizanText>
                  </Pressable>
                );
              })}
            </View>
            <View style={[styles.feedbackScaleLabels, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <MizanText variant="caption" muted>{t('feedbackLow')}</MizanText>
              <MizanText variant="caption" muted>{t('feedbackHigh')}</MizanText>
            </View>
            <TextInput
              accessibilityLabel={t('feedbackNotePlaceholder')}
              editable={feedbackStatus !== 'saving' && feedbackStatus !== 'saved'}
              maxLength={280}
              multiline
              onChangeText={(text) => {
                setFeedbackNote(text);
                if (feedbackStatus === 'offline' || feedbackStatus === 'error') setFeedbackStatus('idle');
              }}
              placeholder={t('feedbackNotePlaceholder')}
              placeholderTextColor={palette.textMuted}
              style={[
                styles.feedbackInput,
                {
                  borderColor: palette.border,
                  backgroundColor: palette.surface,
                  color: palette.text,
                  textAlign: isRtl ? 'right' : 'left',
                },
              ]}
              value={feedbackNote}
            />
            <Pressable
              accessibilityRole="button"
              disabled={feedbackUsefulness === null || feedbackStatus === 'saving' || feedbackStatus === 'saved'}
              onPress={() => void handleFeedback()}
              style={({ pressed }) => [
                styles.primaryAction,
                {
                  backgroundColor: palette.accent,
                  opacity:
                    feedbackUsefulness === null || feedbackStatus === 'saving' || feedbackStatus === 'saved'
                      ? 0.5
                      : pressed
                        ? 0.82
                        : 1,
                },
              ]}>
              <MizanText variant="label" style={styles.primaryActionText}>{t('feedbackSave')}</MizanText>
            </Pressable>
            {feedbackMessage ? <MizanText muted>{t(feedbackMessage)}</MizanText> : null}
          </View>
        ) : null}
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
  oneMoveContent: { gap: Spacing.md },
  alternativeBlock: { gap: Spacing.sm },
  decisionRow: { flexWrap: 'wrap', gap: Spacing.sm },
  decisionButton: { minHeight: 44, flexGrow: 1, minWidth: 120, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md, paddingHorizontal: Spacing.md },
  secondaryAction: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md, borderWidth: 1, paddingHorizontal: Spacing.md },
  feedbackBlock: { gap: Spacing.md, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.lg },
  ratingRow: { flexWrap: 'wrap', gap: Spacing.sm },
  ratingButton: { minWidth: 48, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: Radius.md },
  feedbackScaleLabels: { justifyContent: 'space-between', gap: Spacing.md },
  feedbackInput: { minHeight: 88, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, textAlignVertical: 'top' },
  statusRow: { alignItems: 'center', gap: Spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  section: { gap: Spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  domainCard: { minWidth: 220, flexGrow: 1, flexBasis: 240 },
});