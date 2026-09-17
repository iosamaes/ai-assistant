import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import {
  submitDailyCheckIn,
  type DailyCheckInMetric,
  type DailyCheckInRating,
  type DailyCheckInRatings,
} from '@/application/check-in';
import { Card, ChoiceChip, MizanText, PrimaryButton } from '@/components/mizan-ui';
import { Screen } from '@/components/screen';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { useAppState } from '@/state/app-state';

const ratingOptions = [1, 2, 3, 4, 5] as const;
const metricItems = [
  { metric: 'energy', label: 'checkInEnergy' },
  { metric: 'recovery', label: 'checkInRecovery' },
  { metric: 'mental_load', label: 'checkInMentalLoad' },
  { metric: 'connection', label: 'checkInConnection' },
] as const;

type SubmitState = 'idle' | 'saving' | 'offline' | 'error';

export default function CheckInScreen() {
  const { isRtl, refreshSession, t, userId } = useAppState();
  const [ratings, setRatings] = useState<DailyCheckInRatings>({});
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const scheme = useColorScheme();
  const palette = Palette[scheme === 'dark' ? 'dark' : 'light'];
  const answeredCount = useMemo(() => Object.keys(ratings).length, [ratings]);

  const setRating = (metric: DailyCheckInMetric, rating?: DailyCheckInRating) => {
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
    setSubmitState('saving');
    const result = await submitDailyCheckIn(userId, ratings);

    if (result.ok) {
      router.replace('/today');
      return;
    }

    if (result.error.kind === 'session-expired') {
      await refreshSession();
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
        <MizanText muted>{t('checkInBody')}</MizanText>
      </View>

      {metricItems.map(({ metric, label }) => (
        <Card key={metric}>
          <MizanText variant="title">{t(label)}</MizanText>
          <View style={[styles.ratingRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            {ratingOptions.map((rating) => (
              <ChoiceChip
                key={rating}
                label={String(rating)}
                selected={ratings[metric] === rating}
                onPress={() => setRating(metric, rating)}
              />
            ))}
          </View>
          <View style={[styles.scaleRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <MizanText variant="caption" muted>{t('checkInLow')}</MizanText>
            <MizanText variant="caption" muted>{t('checkInHigh')}</MizanText>
          </View>
          <ChoiceChip
            label={t('checkInSkip')}
            selected={ratings[metric] === undefined}
            onPress={() => setRating(metric)}
          />
        </Card>
      ))}

      {answeredCount === 0 ? <MizanText muted>{t('checkInNeedOne')}</MizanText> : null}
      {submitState === 'offline' ? <MizanText muted>{t('checkInOffline')}</MizanText> : null}
      {submitState === 'error' ? <MizanText muted>{t('checkInError')}</MizanText> : null}

      <PrimaryButton
        label={submitState === 'saving' ? t('saving') : t('checkInSave')}
        disabled={answeredCount === 0 || submitState === 'saving' || !userId}
        onPress={() => void handleSubmit()}
      />

      <Link href="/today" asChild>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.backButton,
            {
              borderColor: palette.border,
              backgroundColor: palette.surface,
              opacity: pressed ? 0.72 : 1,
            },
          ]}>
          <MizanText variant="label">{t('backToday')}</MizanText>
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { gap: Spacing.sm },
  ratingRow: { flexWrap: 'wrap', gap: Spacing.sm },
  scaleRow: { justifyContent: 'space-between', gap: Spacing.md },
  backButton: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
