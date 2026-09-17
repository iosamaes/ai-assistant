import {
  insertObservations,
  type DataResult,
  type ObservationInput,
} from '@/infrastructure/supabase/data-access';

export type DailyCheckInMetric = 'energy' | 'recovery' | 'mental_load' | 'connection';
export type DailyCheckInRating = 1 | 2 | 3 | 4 | 5;
export type DailyCheckInRatings = Partial<Record<DailyCheckInMetric, DailyCheckInRating>>;

const metricOrder: readonly DailyCheckInMetric[] = ['energy', 'recovery', 'mental_load', 'connection'];

function ratingToScore(rating: DailyCheckInRating) {
  return (rating - 1) * 25;
}

export function buildDailyCheckInObservations(
  ratings: DailyCheckInRatings,
  observedAt: string,
): ObservationInput[] {
  return metricOrder.flatMap((metric) => {
    const rating = ratings[metric];
    if (rating === undefined) return [];
    return [{
      source: 'user' as const,
      metric,
      observed_at: observedAt,
      value_number: ratingToScore(rating),
      unit: 'score_0_100',
    }];
  });
}

export async function submitDailyCheckIn(
  userId: string,
  ratings: DailyCheckInRatings,
): Promise<DataResult<string[]>> {
  const observations = buildDailyCheckInObservations(ratings, new Date().toISOString());
  if (observations.length === 0) {
    return { ok: false, error: { kind: 'invalid' } };
  }
  return insertObservations(userId, observations);
}
