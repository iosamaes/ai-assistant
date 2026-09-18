import type { UserTargets } from '@mizan/core';

import {
  loadDomainPreferences,
  type DataFailureKind,
  type DataResult,
} from '@/infrastructure/supabase/data-access';
import { loadOnboardingContext } from '@/infrastructure/supabase/onboarding-context';

function firstFailure(...failures: Array<DataFailureKind | null>): DataFailureKind | null {
  return failures.find((failure): failure is DataFailureKind => failure !== null) ?? null;
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

  const dimensionWeights = Object.fromEntries(
    preferenceResult.value
      .filter((preference) => preference.enabled && preference.priority_weight > 0)
      .map((preference) => [preference.domain_id, preference.priority_weight]),
  );

  if (Object.keys(dimensionWeights).length === 0) return { ok: true, value: null };

  return {
    ok: true,
    value: {
      seasonId: context.life_season,
      dimensionWeights,
    },
  };
}
