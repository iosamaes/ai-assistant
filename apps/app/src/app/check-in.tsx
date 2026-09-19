import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import {
  submitDailyCheckIn,
  type DailyCheckInMetric,
  type DailyCheckInRating,
  type DailyCheckInRatings,
} from '@/application/check-in';
import { Card, ChoiceChip, MizanText, PrimaryButton, SecondaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Controls, Palette, Radius, Spacing } from '@/constants/theme';
import { formatLocalizedNumber } from '@/i18n/number-input';
import { useAppState } from '@/state/app-state';

const ratingOptions = [1, 2, 3, 4, 5] as const;
const metricItems = [
  { metric: 'energy', label: 'checkInEnergy' },
  { metric: 'recovery', label: 'checkInRecovery' },
  { metric: 'mental_load', label: 'checkInMentalLoad' },
  { metric: 'connection', label: 'checkInConnection' },
] as const;

const deliveryCopy = {
  ar: {
    queued: 'تم حفظ التسجيل بأمان على هذا الجهاز وسيحاول ميزان مزامنته تلقائيًا عند عودة الاتصال.',
  },
  en: {
    queued: 'This check-in is safely stored on this device. MIZAN will retry syncing it when connection returns.',
  },
} as const;

type SubmitState = 'idle' | 'saving' | 'queued' | 'offline' | 'error';

export default function CheckInScreen() {
  const { isRtl, locale, refreshSession, t, userId } = useAppState();
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const [ratings, setRatings] = useState<DailyCheckInRatings>({});
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const activeUserRef = useRef(userId);
  const answeredCount = useMemo(() => Object.keys(ratings).length, [ratings]);
  const interactionsLocked = submitState === 'saving' || submitState === 'queued';
  const progressLabel = `${formatLocalizedNumber(answeredCount, locale, 0)} / ${formatLocalizedNumber(metricItems.length, locale, 0)}`;

  useEffect(() => {
    activeUserRef.current = userId;
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      setRatings({});
      setSubmitState('idle');
    });
    return () => {
      active = false;
    };
  }, [userId]);

  const setRating = (metric: DailyCheckInMetric, rating?: DailyCheckInRating) => {
    if (interactionsLocked) return;
    setSubmitState('idle');
    setRatings((current) => {
      const next = { ...current };
      if (rating === undefined) delete next[metric];
      else next[metric] = rating;
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!userId || answeredCount === 0 || submitState === 'saving') return;
    const submittingUserId = userId;
    setSubmitState('saving');
    const result = await submitDailyCheckIn(submittingUserId, ratings);
    if (activeUserRef.current !== submittingUserId) return;

    if (result.ok) {
      if (result.value.delivery === 'queued') {
        setRatings({});
        setSubmitState('queued');
        return;
      }
      router.replace('/today');
      return;
    }

    if (result.error.kind === 'session-expired') {
      await refreshSession();
      if (activeUserRef.current !== submittingUserId) return;
      setSubmitState('error');
      return;
    }

    if (result.error.kind === 'unavailable' || result.error.kind === 'not-configured') {
      setSubmitState('offline');
      return;
    }

    setSubmitState('error');
  };

  return (
    <Screen>
      <View style={styles.heading}>
        <MizanText variant="label" muted>{t('appName')}</MizanText>
        <MizanText variant="display">{t('checkInTitle')}</MizanText>
      </View>

      <Card style={[styles.heroCard, { backgroundColor: palette.accentSoft, borderColor: palette.accent }]}>
        <View style={[styles.heroRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={styles.heroCopy}>
            <MizanText variant="title">{t('checkInTitle')}</MizanText>
            <MizanText muted>{t('checkInBody')}</MizanText>
          </View>
          <View
            accessibilityLabel={`${t('checkInTitle')}: ${progressLabel}`}
            style={[styles.progressPill, { backgroundColor: palette.surface }]}
          >
            <MizanText variant="label">{progressLabel}</MizanText>
          </View>
        </View>
      </Card>

      <View style={styles.metricGrid}>
        {metricItems.map(({ metric, label }) => {
          const selectedRating = ratings[metric];
          const selectedLabel = selectedRating === undefined
            ? t('checkInSkip')
            : `${formatLocalizedNumber(selectedRating, locale, 0)} / ${formatLocalizedNumber(ratingOptions.length, locale, 0)}`;

          return (
            <Card
              key={metric}
              style={[
                styles.metricCard,
                selectedRating !== undefined ? { borderColor: palette.accent } : null,
              ]}
            >
              <View style={[styles.metricHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <MizanText variant="title" style={styles.metricTitle}>{t(label)}</MizanText>
                <View style={[styles.selectionPill, { backgroundColor: palette.surfaceMuted }]}>
                  <MizanText variant="caption" muted>{selectedLabel}</MizanText>
                </View>
              </View>

              <View style={[styles.ratingRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                {ratingOptions.map((rating) => {
                  const localizedRating = formatLocalizedNumber(rating, locale, 0);
                  return (
                    <ChoiceChip
                      key={rating}
                      accessibilityLabel={`${t(label)}: ${localizedRating}`}
                      label={localizedRating}
                      selected={selectedRating === rating}
                      onPress={() => setRating(metric, rating)}
                      disabled={interactionsLocked}
                    />
                  );
                })}
              </View>

              <View style={[styles.scaleRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <MizanText variant="caption" muted style={styles.scaleLabel}>{t('checkInLow')}</MizanText>
                <MizanText variant="caption" muted style={styles.scaleLabel}>{t('checkInHigh')}</MizanText>
              </View>

              <ChoiceChip
                label={t('checkInSkip')}
                selected={selectedRating === undefined}
                onPress={() => setRating(metric)}
                disabled={interactionsLocked}
              />
            </Card>
          );
        })}
      </View>

      {answeredCount === 0 && submitState !== 'queued' ? (
        <Card style={[styles.statusCard, { backgroundColor: palette.surfaceMuted }]}>
          <MizanText accessibilityLiveRegion="polite" muted>{t('checkInNeedOne')}</MizanText>
        </Card>
      ) : null}
      {submitState === 'queued' ? (
        <Card style={[styles.statusCard, { backgroundColor: palette.accentSoft, borderColor: palette.accent }]}>
          <MizanText accessibilityLiveRegion="polite" muted>{deliveryCopy[locale].queued}</MizanText>
        </Card>
      ) : null}
      {submitState === 'offline' ? (
        <Card style={[styles.statusCard, { backgroundColor: palette.surfaceMuted }]}>
          <MizanText accessibilityLiveRegion="polite" muted>{t('checkInOffline')}</MizanText>
        </Card>
      ) : null}
      {submitState === 'error' ? (
        <Card style={[styles.statusCard, { backgroundColor: palette.surfaceMuted, borderColor: palette.danger }]}>
          <MizanText accessibilityLiveRegion="polite" muted>{t('checkInError')}</MizanText>
        </Card>
      ) : null}

      <View style={styles.actions}>
        <PrimaryButton
          label={submitState === 'saving' ? t('saving') : t('checkInSave')}
          disabled={answeredCount === 0 || submitState === 'saving' || submitState === 'queued' || !userId}
          onPress={() => void handleSubmit()}
        />
        <SecondaryButton label={t('backToday')} onPress={() => router.replace('/today')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { gap: Spacing.sm },
  heroCard: { gap: Spacing.xl },
  heroRow: { alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.lg, flexWrap: 'wrap' },
  heroCopy: { flexGrow: 1, flexShrink: 1, flexBasis: 260, gap: Spacing.sm },
  progressPill: {
    minHeight: Controls.minimumTouchHeight,
    minWidth: 76,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
  },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', gap: Spacing.lg },
  metricCard: { flexGrow: 1, flexShrink: 1, flexBasis: 320 },
  metricHeader: { alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.md, flexWrap: 'wrap' },
  metricTitle: { flexGrow: 1, flexShrink: 1, flexBasis: 180 },
  selectionPill: {
    minHeight: Controls.minimumTouchHeight,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
  },
  ratingRow: { flexWrap: 'wrap', gap: Spacing.sm },
  scaleRow: { alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.md, flexWrap: 'wrap' },
  scaleLabel: { flexShrink: 1 },
  statusCard: { paddingVertical: Spacing.lg },
  actions: { gap: Spacing.md },
});
