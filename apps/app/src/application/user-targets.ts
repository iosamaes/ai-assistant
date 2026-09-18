import type { UserTargets } from '@mizan/core';

import {
  loadDomainPreferences,
  type DataFailureKind,
  type DataResult,
  type DomainPreference,
} from '@/infrastructure/supabase/data-access';
import { loadOnboardingContext } from '@/infrastructure/supabase/onboarding-context';

function firstFailure(...failures: (DataFailureKind | null)[]): DataFailureKind | null {
  return failures.find((failure): failure is DataFailureKind => failure !== null) ?? null;
}

function baselineScore(preference: DomainPreference): number | null {
  const rating = (preference as DomainPreference & { baseline_target_rating?: unknown }).baseline_target_rating;
  if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) return null;
  return (rating - 1) * 25;
}

export async function loadUserTargets(userId: string): Promise<DataResult<UserTargets | null>> {
  const [contextResult, preferenceResult] = await Promise.all([
    loadOnboardingContext(userId),
    loadDomainPreferences(userId),
  ]);

  const failure = firstFailure(
    contextResult.ok ? null : contextResult.error.kind,
    preferenceResult.ok ? null : preferenceResult.error.kind,
  );
  if (failure) return { ok: false, error: { kind: failure } };

  const context = contextResult.ok ? contextResult.value : null;
  if (!context?.life_season || !preferenceResult.ok) return { ok: true, value: null };

  const enabledPreferences = preferenceResult.value.filter(
    (preference) => preference.enabled && preference.priority_weight > 0,
  );
  const dimensionWeights = Object.fromEntries(
    enabledPreferences.map((preference) => [preference.domain_id, preference.priority_weight]),
  );

  if (Object.keys(dimensionWeights).length === 0) return { ok: true, value: null };

  const dimensionBaselines = Object.fromEntries(
    enabledPreferences.flatMap((preference) => {
      const score = baselineScore(preference);
      return score === null ? [] : [[preference.domain_id, score] as const];
    }),
  );

  return {
    ok: true,
    value: {
      seasonId: context.life_season,
      dimensionWeights,
      ...(Object.keys(dimensionBaselines).length > 0 ? { dimensionBaselines } : {}),
    },
  };
}
