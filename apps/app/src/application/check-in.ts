import { flushPendingUserMutations } from '@/application/offline-sync';
import {
  createClientMutationId,
  enqueuePendingUserMutation,
} from '@/infrastructure/offline/pending-mutations';
import {
  insertObservations,
  type DataResult,
  type ObservationInput,
} from '@/infrastructure/supabase/data-access';

export type DailyCheckInMetric = 'energy' | 'recovery' | 'mental_load' | 'connection';
export type DailyCheckInRating = 1 | 2 | 3 | 4 | 5;
export type DailyCheckInRatings = Partial<Record<DailyCheckInMetric, DailyCheckInRating>>;
export type DailyCheckInSubmitValue = {
  delivery: 'saved' | 'queued';
  ids: string[];
  mutationId: string;
};

const metricOrder: readonly DailyCheckInMetric[] = ['energy', 'recovery', 'mental_load', 'connection'];

function ratingToScore(rating: DailyCheckInRating) {
  return (rating - 1) * 25;
}

function canQueue(kind: string) {
  return kind === 'unavailable' || kind === 'not-configured' || kind === 'session-expired';
}

export function buildDailyCheckInObservations(
  ratings: DailyCheckInRatings,
  observedAt: string,
  clientMutationId?: string,
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
      ...(clientMutationId ? { client_mutation_id: clientMutationId } : {}),
    }];
  });
}

export async function submitDailyCheckIn(
  userId: string,
  ratings: DailyCheckInRatings,
): Promise<DataResult<DailyCheckInSubmitValue>> {
  await flushPendingUserMutations(userId);

  const mutationId = createClientMutationId();
  const createdAt = new Date().toISOString();
  const observations = buildDailyCheckInObservations(ratings, createdAt, mutationId);
  if (observations.length === 0) {
    return { ok: false, error: { kind: 'invalid' } };
  }

  const result = await insertObservations(userId, observations);
  if (result.ok) {
    return {
      ok: true,
      value: { delivery: 'saved', ids: result.value, mutationId },
    };
  }

  if (canQueue(result.error.kind)) {
    const queued = await enqueuePendingUserMutation({
      id: mutationId,
      userId,
      kind: 'check-in',
      createdAt,
      observations,
    });
    if (queued.ok) {
      return {
        ok: true,
        value: { delivery: 'queued', ids: [], mutationId },
      };
    }
  }

  return { ok: false, error: result.error };
}
