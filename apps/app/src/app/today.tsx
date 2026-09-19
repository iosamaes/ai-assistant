import type { ConfidenceLevel, MomentumDirection } from '@mizan/core';
import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, useColorScheme, useWindowDimensions, View } from 'react-native';

import {
  recoverPendingActionFeedback,
  recordExplicitActionOutcome,
} from '@/application/action-feedback';
import {
  loadDailySnapshot,
  type DailySnapshot,
} from '@/application/daily-intelligence';
import {
  loadPersonalizedDailyRecommendation,
  recordOneMoveDecision,
  type DailyRecommendation,
  type DailyRecommendationOption,
  type OneMoveDecision,
} from '@/application/daily-recommendation';
import { AppIcon, type AppIconName } from '@/components/app-icon';
import { BrandedIllustration } from '@/components/branded-illustration';
import {
  Card,
  MizanText,
  MizanTextInput,
  PrimaryButton,
  SecondaryButton,
} from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Controls, Interaction, Layout, Palette, Radius, Spacing } from '@/constants/theme';
import type { TranslationKey } from '@/i18n';
import { formatLocalizedNumber } from '@/i18n/number-input';
import { DomainId, useAppState } from '@/state/app-state';

type DailyLoadStatus = 'loading' | 'ready' | 'error';
type RecommendationLoadStatus = 'loading' | 'ready';
type DecisionStatus = 'idle' | 'saving' | OneMoveDecision | 'offline' | 'error';
type FeedbackStatus = 'idle' | 'saving' | 'saved' | 'offline' | 'error';
type FeedbackTarget = { userId: string; actionEventId: string; actionId: string; acceptedAt: string };

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
    cacheUnavailable: 'تعذر الوصول إلى البيانات المباشرة، لذلك يعرض ميزان آخر لقطة محفوظة.',
    cacheNotConfigured: 'الاتصال المباشر غير مهيأ في هذا الإصدار، لذلك يعرض ميزان آخر لقطة محفوظة.',
    cacheSavedAt: 'وقت اللقطة المحفوظة',
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
    cacheUnavailable: 'Live data is unavailable, so MIZAN is showing the most recent saved snapshot.',
    cacheNotConfigured: 'Live data is not configured in this build, so MIZAN is showing the most recent saved snapshot.',
    cacheSavedAt: 'Saved snapshot time',
  },
} as const;

const premiumCopy = {
  ar: {
    greeting: 'مساحتك الهادئة لليوم',
    focusEyebrow: 'تركيز اليوم',
    focusBody: 'خطوة واحدة واضحة مبنية على حالتك الحالية والأدلة المتاحة.',
    quickCheckIn: 'تحديث سريع للحالة',
    stateSignals: 'إشارات حالتك',
    stateSignalsBody: 'قراءة مختصرة لما نعرفه الآن. القيم المجهولة تبقى مجهولة حتى يتوفر دليل.',
    unknown: 'غير معروف',
    summary: 'ملخص اليوم',
    prioritiesBody: 'المجالات التي اخترت أن يركز عليها ميزان في هذا الموسم.',
    learningEyebrow: 'التعلّم الشخصي',
  },
  en: {
    greeting: 'Your calm space for today',
    focusEyebrow: 'Today focus',
    focusBody: 'One clear move grounded in your current state and the evidence available.',
    quickCheckIn: 'Quick state update',
    stateSignals: 'Your state signals',
    stateSignalsBody: 'A compact view of what MIZAN knows now. Unknown values stay unknown until evidence exists.',
    unknown: 'Unknown',
    summary: 'Today summary',
    prioritiesBody: 'The areas you chose for MIZAN to emphasize in this season.',
    learningEyebrow: 'Personal learning',
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

function stateIconName(key: string): AppIconName {
  if (key === 'energy') return 'energy';
  if (key === 'recovery') return 'recovery';
  if (key === 'mental_load') return 'mentalLoad';
  if (key === 'connection') return 'connection';
  return 'overload';
}

function domainIconName(domainId: DomainId): AppIconName {
  if (domainId === 'recovery') return 'recovery';
  if (domainId === 'connection') return 'connection';
  if (domainId === 'work') return 'work';
  return 'margin';
}

function signalIconName(signal: DailyRecommendationOption['reasonSignal']): AppIconName {
  if (signal === 'recovery') return 'recovery';
  if (signal === 'energy') return 'energy';
  if (signal === 'connection') return 'connection';
  return 'overload';
}

function momentumIconName(direction: MomentumDirection): AppIconName {
  if (direction === 'improving') return 'trendUp';
  if (direction === 'declining') return 'trendDown';
  return 'trendFlat';
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

function cachedSnapshotMessage(snapshot: DailySnapshot | null, locale: 'ar' | 'en'): string | null {
  if (!snapshot || snapshot.source !== 'cache' || !snapshot.cachedAt) return null;
  const savedAt = new Date(snapshot.cachedAt);
  if (!Number.isFinite(savedAt.getTime())) return null;
  const copy = overviewCopy[locale];
  const reason = snapshot.degradedBy === 'not-configured' ? copy.cacheNotConfigured : copy.cacheUnavailable;
  return `${reason} ${copy.cacheSavedAt}: ${savedAt.toLocaleString(locale === 'ar' ? 'ar-QA-u-nu-latn' : 'en-QA-u-nu-latn')}`;
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

function formattedDayContext(locale: 'ar' | 'en'): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-QA-u-nu-latn' : 'en-QA-u-nu-latn', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
}

function SignalMeter({ value, trackColor, fillColor }: { value: number | null; trackColor: string; fillColor: string }) {
  const clamped = value === null ? null : Math.max(0, Math.min(100, value));
  return (
    <View style={[styles.meterTrack, { backgroundColor: trackColor }]}>
      {clamped !== null ? (
        <View style={[styles.meterFill, { backgroundColor: fillColor, width: `${clamped}%` as `${number}%` }]} />
      ) : null}
    </View>
  );
}

export default function TodayScreen() {
  const { enabledDomains, isRtl, locale, refreshSession, syncStatus, t, userId } = useAppState();
  const { width } = useWindowDimensions();
  const [dailySnapshot, setDailySnapshot] = useState<DailySnapshot | null>(null);
  const [dailySnapshotUserId, setDailySnapshotUserId] = useState<string | null>(null);
  const [dailyLoadStatus, setDailyLoadStatus] = useState<DailyLoadStatus>('loading');
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
  const isWideHome = width >= Math.min(Layout.wideBreakpoint, 760);
  const syncMessage = syncStatus === 'offline' ? t('syncOffline') : syncStatus === 'error' ? t('syncError') : null;
  const dailyCopy = overviewCopy[locale];
  const todayCopy = premiumCopy[locale];
  const dayContext = formattedDayContext(locale);
  const formatWhole = (value: number) => formatLocalizedNumber(value, locale, 0);
  const currentDailySnapshot = userId !== null && dailySnapshotUserId === userId ? dailySnapshot : null;
  const displayedDailyLoadStatus: DailyLoadStatus =
    userId !== null && dailyLoadStatus === 'ready' && dailySnapshotUserId !== userId ? 'loading' : dailyLoadStatus;
  const humanState = currentDailySnapshot?.humanState ?? null;
  const dailyOverview = currentDailySnapshot?.overview ?? null;
  const snapshotMessage = cachedSnapshotMessage(currentDailySnapshot, locale);
  const activeFeedbackTarget = feedbackTarget?.userId === userId ? feedbackTarget : null;

  useEffect(() => {
    let active = true;
    void (async () => {
      await Promise.resolve();
      if (!active) return;
      if (!userId) {
        setDailySnapshot(null);
        setDailySnapshotUserId(null);
        setDailyLoadStatus('ready');
        return;
      }

      setDailySnapshot(null);
      setDailySnapshotUserId(null);
      setDailyLoadStatus('loading');
      const result = await loadDailySnapshot(userId);
      if (!active) return;
      if (result.ok) {
        setDailySnapshot(result.value);
        setDailySnapshotUserId(userId);
        setDailyLoadStatus('ready');
        return;
      }
      if (result.error.kind === 'session-expired') await refreshSession();
      if (active) {
        setDailySnapshot(null);
        setDailySnapshotUserId(null);
        setDailyLoadStatus('error');
      }
    })();

    return () => {
      active = false;
    };
  }, [refreshSession, userId]);

  const visibleState = useMemo(
    () =>
      (humanState?.components ?? []).flatMap((component) => {
        const labelKey = stateLabelKey(component.key);
        if (!labelKey) return [];
        return [{ component, labelKey }];
      }),
    [humanState],
  );

  useEffect(() => {
    let active = true;
    void (async () => {
      await Promise.resolve();
      if (!active) return;
      if (!userId || !humanState) {
        setRecommendation(null);
        setRecommendationLoadStatus('ready');
        return;
      }

      setRecommendationLoadStatus('loading');
      const nextRecommendation = await loadPersonalizedDailyRecommendation(userId, humanState);
      if (!active) return;
      setRecommendation(nextRecommendation);
      setRecommendationLoadStatus('ready');
    })();

    return () => {
      active = false;
    };
  }, [humanState, userId]);

  useEffect(() => {
    let active = true;
    void (async () => {
      await Promise.resolve();
      if (!active) return;
      if (!userId) {
        setFeedbackTarget(null);
        return;
      }

      setFeedbackTarget(null);
      const result = await recoverPendingActionFeedback(userId);
      if (!active) return;
      if (!result.ok) {
        if (result.error.kind === 'session-expired') await refreshSession();
        return;
      }
      setFeedbackTarget(result.value ? { ...result.value, userId } : null);
    })();

    return () => {
      active = false;
    };
  }, [refreshSession, userId]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      setSelectedActionId(recommendation?.primary.actionId ?? null);
      setDecisionStatus('idle');
    });
    return () => {
      active = false;
    };
  }, [recommendation?.primary.actionId]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      setFeedbackUsefulness(null);
      setFeedbackNote('');
      setFeedbackStatus('idle');
    });
    return () => {
      active = false;
    };
  }, [activeFeedbackTarget?.actionEventId]);

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
        userId,
        actionEventId: result.value,
        actionId: activeRecommendation.actionId,
        acceptedAt: new Date().toISOString(),
      });
    }
  };

  const handleFeedback = async () => {
    if (
      !userId ||
      !activeFeedbackTarget ||
      feedbackUsefulness === null ||
      feedbackStatus === 'saving' ||
      feedbackStatus === 'saved'
    ) {
      return;
    }

    setFeedbackStatus('saving');
    const result = await recordExplicitActionOutcome(
      userId,
      activeFeedbackTarget.actionId,
      activeFeedbackTarget.actionEventId,
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
          <MizanText muted>{todayCopy.greeting}</MizanText>
          <View
            style={[
              styles.dayStrip,
              {
                alignSelf: isRtl ? 'flex-end' : 'flex-start',
                backgroundColor: palette.surfaceMuted,
                borderColor: palette.border,
                flexDirection: isRtl ? 'row-reverse' : 'row',
              },
            ]}>
            <AppIcon name="home" color={palette.accent} size={17} />
            <MizanText variant="caption">{dayContext}</MizanText>
          </View>
        </View>
        <Link href="/settings" asChild>
          <Pressable
            accessibilityLabel={t('settings')}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.settingsButton,
              {
                borderColor: palette.border,
                backgroundColor: palette.surfaceMuted,
                opacity: pressed ? Interaction.subtlePressed : 1,
                flexDirection: isRtl ? 'row-reverse' : 'row',
              },
            ]}>
            <AppIcon name="more" color={palette.textMuted} size={18} />
            <MizanText variant="label">{t('settings')}</MizanText>
          </Pressable>
        </Link>
      </View>

      {syncMessage ? <MizanText accessibilityLiveRegion="polite" muted>{syncMessage}</MizanText> : null}
      {snapshotMessage ? (
        <Card style={{ backgroundColor: palette.surfaceMuted }}>
          <MizanText accessibilityLiveRegion="polite" variant="caption" muted>{snapshotMessage}</MizanText>
        </Card>
      ) : null}

      <Card style={[styles.oneMoveHero, { backgroundColor: palette.accentSoft, borderColor: palette.accent }]}>
        <View
          style={[
            styles.focusHeroRow,
            { flexDirection: isWideHome ? (isRtl ? 'row-reverse' : 'row') : 'column' },
          ]}>
          <View style={styles.focusHeroCopy}>
            <View style={[styles.iconLabelRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={[styles.iconBadge, { backgroundColor: palette.surface }]}>
                <AppIcon name="oneMove" color={palette.accent} size={20} />
              </View>
              <MizanText variant="label" muted>{todayCopy.focusEyebrow}</MizanText>
            </View>
            <MizanText muted>{todayCopy.focusBody}</MizanText>

            {displayedDailyLoadStatus === 'loading' || recommendationLoadStatus === 'loading' ? (
              <MizanText accessibilityLiveRegion="polite" muted>{t('loading')}</MizanText>
            ) : null}
            {displayedDailyLoadStatus === 'ready' && recommendationLoadStatus === 'ready' && (!activeRecommendation || !activeActionLabel) ? (
              <MizanText accessibilityLiveRegion="polite" muted>{t('oneMoveEmpty')}</MizanText>
            ) : null}
            {activeRecommendation && activeActionLabel ? (
              <View style={styles.oneMoveContent}>
                <MizanText variant="title">{t(activeActionLabel)}</MizanText>
                <View style={[styles.reasonRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <AppIcon name={signalIconName(activeRecommendation.reasonSignal)} color={palette.accent} size={18} />
                  <MizanText muted style={styles.flexText}>{t(reasonLabelKey(activeRecommendation.reasonSignal))}</MizanText>
                </View>
                <View style={[styles.evidenceRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <AppIcon name="evidence" color={palette.textMuted} size={16} />
                  <MizanText variant="caption" muted style={styles.flexText}>
                    {t(confidenceLabelKey(activeRecommendation.confidence.level))} · {t('evidenceLabel')}: {formatWhole(activeRecommendation.evidence.length)}
                  </MizanText>
                </View>

                {alternative && alternativeLabel && !decisionFinished ? (
                  <View style={styles.alternativeBlock}>
                    <MizanText variant="caption" muted>{t('oneMoveAlternative')}</MizanText>
                    <SecondaryButton
                      label={t(alternativeLabel)}
                      disabled={decisionStatus === 'saving'}
                      onPress={() => {
                        setSelectedActionId(alternative.actionId);
                        setDecisionStatus('idle');
                      }}
                    />
                  </View>
                ) : null}

                <View style={[styles.decisionRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <View style={styles.decisionButtonSlot}>
                    <PrimaryButton
                      label={t('oneMoveAccept')}
                      disabled={decisionStatus === 'saving' || decisionFinished}
                      onPress={() => void handleDecision('accepted')}
                    />
                  </View>
                  <View style={styles.decisionButtonSlot}>
                    <SecondaryButton
                      label={t('oneMoveDefer')}
                      disabled={decisionStatus === 'saving' || decisionFinished}
                      onPress={() => void handleDecision('deferred')}
                    />
                  </View>
                  <View style={styles.decisionButtonSlot}>
                    <SecondaryButton
                      label={t('oneMoveDecline')}
                      disabled={decisionStatus === 'saving' || decisionFinished}
                      onPress={() => void handleDecision('declined')}
                    />
                  </View>
                </View>

                {decisionMessage ? <MizanText accessibilityLiveRegion="polite" muted>{t(decisionMessage)}</MizanText> : null}
              </View>
            ) : null}
          </View>

          <View style={styles.illustrationSlot}>
            <BrandedIllustration variant="focus" size={isWideHome ? 172 : 138} />
          </View>
        </View>

        {activeFeedbackTarget ? (
          <View style={[styles.feedbackBlock, { borderTopColor: palette.border }]}>
            <MizanText variant="title">{t('feedbackTitle')}</MizanText>
            <MizanText muted>{t('feedbackBody')}</MizanText>
            <MizanText variant="label">{t('feedbackUsefulness')}</MizanText>
            <View style={[styles.ratingRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              {OUTCOME_RATINGS.map((value) => {
                const selected = feedbackUsefulness === value;
                const disabled = feedbackStatus === 'saving' || feedbackStatus === 'saved';
                const formattedValue = formatWhole(value);
                const formattedTotal = formatWhole(OUTCOME_RATINGS.length);
                return (
                  <Pressable
                    key={value}
                    accessibilityLabel={`${t('feedbackUsefulness')}: ${formattedValue} / ${formattedTotal}`}
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
                        opacity: disabled ? Interaction.disabled : pressed ? Interaction.chipPressed : 1,
                      },
                    ]}>
                    <MizanText
                      variant="label"
                      style={selected ? [styles.primaryActionText, { color: palette.onAccent }] : undefined}>
                      {formattedValue}
                    </MizanText>
                  </Pressable>
                );
              })}
            </View>
            <View style={[styles.feedbackScaleLabels, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <MizanText variant="caption" muted>{t('feedbackLow')}</MizanText>
              <MizanText variant="caption" muted>{t('feedbackHigh')}</MizanText>
            </View>
            <MizanTextInput
              accessibilityLabel={t('feedbackNotePlaceholder')}
              editable={feedbackStatus !== 'saving' && feedbackStatus !== 'saved'}
              maxLength={280}
              multiline
              onChangeText={(text) => {
                setFeedbackNote(text);
                if (feedbackStatus === 'offline' || feedbackStatus === 'error') setFeedbackStatus('idle');
              }}
              placeholder={t('feedbackNotePlaceholder')}
              style={styles.feedbackInput}
              value={feedbackNote}
            />
            <PrimaryButton
              label={t('feedbackSave')}
              disabled={feedbackUsefulness === null || feedbackStatus === 'saving' || feedbackStatus === 'saved'}
              onPress={() => void handleFeedback()}
            />
            {feedbackMessage ? <MizanText accessibilityLiveRegion="polite" muted>{t(feedbackMessage)}</MizanText> : null}
          </View>
        ) : null}
      </Card>

      <Card style={[styles.checkInPanel, { backgroundColor: palette.surface }]}>
        <View
          style={[
            styles.checkInRow,
            { flexDirection: isWideHome ? (isRtl ? 'row-reverse' : 'row') : 'column' },
          ]}>
          <View style={styles.checkInCopy}>
            <View style={[styles.iconLabelRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={[styles.iconBadge, { backgroundColor: palette.accentSoft }]}>
                <AppIcon name="energy" color={palette.accent} size={20} />
              </View>
              <MizanText variant="label" muted>{todayCopy.quickCheckIn}</MizanText>
            </View>
            <MizanText variant="title">{t('checkInPromptTitle')}</MizanText>
            <MizanText muted>{t('checkInPromptBody')}</MizanText>
          </View>
          <Link href="/check-in" asChild>
            <Pressable
              accessibilityLabel={t('checkInStart')}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.primaryAction,
                {
                  alignSelf: isWideHome ? 'center' : 'stretch',
                  backgroundColor: palette.accent,
                  opacity: pressed ? Interaction.pressed : 1,
                },
              ]}>
              <MizanText variant="label" style={[styles.primaryActionText, { color: palette.onAccent }]}>
                {t('checkInStart')}
              </MizanText>
            </Pressable>
          </Link>
        </View>
      </Card>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <MizanText variant="title">{todayCopy.stateSignals}</MizanText>
          <MizanText muted>{todayCopy.stateSignalsBody}</MizanText>
        </View>
        {displayedDailyLoadStatus === 'loading' ? <MizanText accessibilityLiveRegion="polite" muted>{t('loading')}</MizanText> : null}
        {displayedDailyLoadStatus === 'error' ? <MizanText accessibilityLiveRegion="polite" muted>{t('currentStateError')}</MizanText> : null}
        {displayedDailyLoadStatus === 'ready' && visibleState.length === 0 ? (
          <MizanText accessibilityLiveRegion="polite" muted>{t('currentStateEmpty')}</MizanText>
        ) : null}
        <View style={[styles.signalGrid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          {visibleState.map(({ component, labelKey }) => {
            const value = component.value === null ? null : Math.round(component.value);
            return (
              <Card key={component.key} style={[styles.signalTile, { backgroundColor: palette.surfaceMuted }]}>
                <View style={[styles.stateRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.iconLabelRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.iconBadge, { backgroundColor: palette.surface }]}>
                      <AppIcon name={stateIconName(component.key)} color={palette.accent} size={19} />
                    </View>
                    <MizanText variant="label">{t(labelKey)}</MizanText>
                  </View>
                  <View style={[styles.metricPill, { backgroundColor: palette.surface }]}>
                    <MizanText variant="label">
                      {value === null ? todayCopy.unknown : `${formatWhole(value)} / ${formatWhole(100)}`}
                    </MizanText>
                  </View>
                </View>
                <SignalMeter value={value} trackColor={palette.border} fillColor={palette.accent} />
                <View style={[styles.evidenceRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <AppIcon name="evidence" color={palette.textMuted} size={15} />
                  <MizanText variant="caption" muted style={styles.flexText}>
                    {t(confidenceLabelKey(component.confidence.level))} · {t('evidenceLabel')}: {formatWhole(component.evidence.length)}
                  </MizanText>
                </View>
              </Card>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <MizanText variant="title">{todayCopy.summary}</MizanText>
        <View style={[styles.dashboardGrid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <Card style={styles.dashboardCard}>
            <View style={[styles.iconLabelRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={[styles.iconBadge, { backgroundColor: palette.accentSoft }]}>
                <AppIcon name="lifeMap" color={palette.accent} size={20} />
              </View>
              <MizanText variant="title">{dailyCopy.balance}</MizanText>
            </View>
            {displayedDailyLoadStatus === 'loading' ? <MizanText accessibilityLiveRegion="polite" muted>{t('loading')}</MizanText> : null}
            {displayedDailyLoadStatus === 'error' ? <MizanText accessibilityLiveRegion="polite" muted>{dailyCopy.error}</MizanText> : null}
            {displayedDailyLoadStatus === 'ready' ? (
              dailyOverview?.balance?.score !== null && dailyOverview?.balance?.score !== undefined ? (
                <View style={styles.summaryContent}>
                  <View style={[styles.stateRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <MizanText variant="display">{formatWhole(Math.round(dailyOverview.balance.score))}</MizanText>
                    <MizanText variant="label" muted>/ {formatWhole(100)}</MizanText>
                  </View>
                  <SignalMeter
                    value={Math.round(dailyOverview.balance.score)}
                    trackColor={palette.border}
                    fillColor={palette.accent}
                  />
                  <MizanText variant="caption" muted>
                    {t(confidenceLabelKey(dailyOverview.balance.confidence.level))} · {t('evidenceLabel')}: {formatWhole(dailyOverview.balance.evidence.length)}
                  </MizanText>
                </View>
              ) : (
                <MizanText accessibilityLiveRegion="polite" muted>{dailyCopy.balanceEmpty}</MizanText>
              )
            ) : null}
          </Card>

          <Card style={styles.dashboardCard}>
            <View style={[styles.iconLabelRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={[styles.iconBadge, { backgroundColor: palette.accentSoft }]}>
                <AppIcon name="trendFlat" color={palette.accent} size={20} />
              </View>
              <MizanText variant="title">{dailyCopy.momentum}</MizanText>
            </View>
            <MizanText muted>{dailyCopy.body}</MizanText>
            {displayedDailyLoadStatus === 'loading' ? <MizanText accessibilityLiveRegion="polite" muted>{t('loading')}</MizanText> : null}
            {displayedDailyLoadStatus === 'error' ? <MizanText accessibilityLiveRegion="polite" muted>{dailyCopy.error}</MizanText> : null}
            {displayedDailyLoadStatus === 'ready' ? (
              <View style={styles.summaryContent}>
                {(dailyOverview?.momentum.length ?? 0) === 0 ? (
                  <MizanText accessibilityLiveRegion="polite" muted>{dailyCopy.momentumEmpty}</MizanText>
                ) : null}
                {dailyOverview?.momentum.map(({ metric, momentum }) => {
                  const labelKey = stateLabelKey(metric);
                  if (!labelKey) return null;
                  return (
                    <View key={metric} style={[styles.momentumItem, { borderTopColor: palette.border }]}>
                      <View style={[styles.stateRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                        <View style={[styles.iconLabelRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                          <AppIcon name={stateIconName(metric)} color={palette.textMuted} size={17} />
                          <MizanText>{t(labelKey)}</MizanText>
                        </View>
                        <View
                          style={[
                            styles.metricPill,
                            { backgroundColor: palette.surfaceMuted, flexDirection: isRtl ? 'row-reverse' : 'row' },
                          ]}>
                          <AppIcon name={momentumIconName(momentum.direction)} color={palette.accent} size={16} />
                          <MizanText variant="label">{momentumLabel(momentum.direction, locale)}</MizanText>
                        </View>
                      </View>
                      <MizanText variant="caption" muted>
                        {t(confidenceLabelKey(momentum.confidence.level))} · {t('evidenceLabel')}: {formatWhole(momentum.evidence.length)}
                      </MizanText>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </Card>
        </View>
      </View>

      <Card style={{ backgroundColor: palette.surfaceMuted }}>
        <View style={[styles.statusRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={[styles.iconBadge, { backgroundColor: palette.surface }]}>
            <AppIcon name="evidence" color={palette.accent} size={18} />
          </View>
          <MizanText variant="label" muted>{todayCopy.learningEyebrow}</MizanText>
        </View>
        <MizanText variant="title">{t('learningState')}</MizanText>
        <MizanText muted>{t('learningBody')}</MizanText>
      </Card>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <MizanText variant="title">{t('priorities')}</MizanText>
          <MizanText muted>{todayCopy.prioritiesBody}</MizanText>
        </View>
        <View style={[styles.grid, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          {enabledDomains.map((domainId: DomainId) => (
            <Card key={domainId} style={[styles.domainCard, { backgroundColor: palette.surfaceMuted }]}>
              <View style={[styles.iconLabelRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <View style={[styles.iconBadge, { backgroundColor: palette.surface }]}>
                  <AppIcon name={domainIconName(domainId)} color={palette.accent} size={19} />
                </View>
                <MizanText variant="label">{t(domainId)}</MizanText>
              </View>
              <MizanText variant="caption" muted>{t('learningState')}</MizanText>
            </Card>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.lg },
  heading: { flexGrow: 1, flexShrink: 1, gap: Spacing.xs },
  dayStrip: {
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    minHeight: Controls.minimumTouchHeight,
    paddingHorizontal: Spacing.md,
    borderWidth: Controls.borderWidth,
    borderRadius: Radius.pill,
  },
  settingsButton: {
    minHeight: Controls.minimumTouchHeight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderWidth: Controls.borderWidth,
    borderRadius: Radius.pill,
  },
  oneMoveHero: { gap: Spacing.xl, overflow: 'hidden' },
  focusHeroRow: { alignItems: 'center', gap: Spacing.xl },
  focusHeroCopy: { flexGrow: 1, flexShrink: 1, minWidth: 0, gap: Spacing.md },
  illustrationSlot: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  iconLabelRow: { alignItems: 'center', gap: Spacing.sm, flexShrink: 1 },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  reasonRow: { alignItems: 'flex-start', gap: Spacing.sm },
  evidenceRow: { alignItems: 'center', gap: Spacing.sm },
  flexText: { flexGrow: 1, flexShrink: 1 },
  checkInPanel: { gap: Spacing.md },
  checkInRow: { alignItems: 'stretch', justifyContent: 'space-between', gap: Spacing.xl },
  checkInCopy: { flexGrow: 1, flexShrink: 1, gap: Spacing.sm },
  primaryAction: {
    minHeight: Controls.standardHeight,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  primaryActionText: { textAlign: 'center' },
  section: { gap: Spacing.lg },
  sectionHeading: { gap: Spacing.xs },
  signalGrid: { flexWrap: 'wrap', alignItems: 'stretch', gap: Spacing.md },
  signalTile: { flexGrow: 1, flexShrink: 1, flexBasis: 250, gap: Spacing.md },
  meterTrack: {
    width: '100%',
    height: 8,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  meterFill: { height: '100%', borderRadius: Radius.pill },
  dashboardGrid: { flexWrap: 'wrap', alignItems: 'stretch', gap: Spacing.lg },
  dashboardCard: { flexGrow: 1, flexShrink: 1, flexBasis: 320, gap: Spacing.md },
  summaryContent: { gap: Spacing.md },
  stateRow: { alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.md },
  metricPill: {
    minHeight: Controls.minimumTouchHeight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
  },
  momentumItem: { gap: Spacing.sm, borderTopWidth: Controls.borderWidth, paddingTop: Spacing.md },
  oneMoveContent: { gap: Spacing.md },
  alternativeBlock: { gap: Spacing.sm },
  decisionRow: { flexWrap: 'wrap', gap: Spacing.sm },
  decisionButtonSlot: { flexGrow: 1, minWidth: 120 },
  feedbackBlock: { gap: Spacing.md, borderTopWidth: Controls.borderWidth, paddingTop: Spacing.lg },
  ratingRow: { flexWrap: 'wrap', gap: Spacing.sm },
  ratingButton: {
    minWidth: Controls.actionHeight,
    minHeight: Controls.minimumTouchHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Controls.borderWidth,
    borderRadius: Radius.pill,
  },
  feedbackScaleLabels: { justifyContent: 'space-between', gap: Spacing.md },
  feedbackInput: { minHeight: 88, textAlignVertical: 'top' },
  statusRow: { alignItems: 'center', gap: Spacing.sm },
  grid: { flexWrap: 'wrap', gap: Spacing.md },
  domainCard: { flexGrow: 1, flexShrink: 1, flexBasis: 220, gap: Spacing.sm },
});
